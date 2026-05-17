"use server";

import { and, eq, gte, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  availabilityExceptions,
  bookings,
  businesses,
  services,
  workingHours,
} from "@/db/schema";
import { computeAvailableSlots, dayBounds, slotInstant } from "@/lib/availability";
import { formatDateTime } from "@/lib/format";
import { sendEmail } from "@/lib/email";
import { requireBusinessId } from "@/lib/session";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type BookingResult = { ok: true } | { error: string };

export type CreateBookingInput = {
  slug: string;
  serviceId: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

export async function createBooking(
  input: CreateBookingInput,
): Promise<BookingResult> {
  const date = String(input.date);
  const time = String(input.time);
  const customerName = String(input.customerName ?? "").trim();
  const customerEmail = String(input.customerEmail ?? "")
    .trim()
    .toLowerCase();
  const customerPhone = String(input.customerPhone ?? "").trim();

  if (!DATE_PATTERN.test(date) || !TIME_PATTERN.test(time)) {
    return { error: "Ugyldig dato eller tid." };
  }
  if (!customerName) return { error: "Fyll inn navnet ditt." };
  if (!EMAIL_PATTERN.test(customerEmail)) {
    return { error: "Fyll inn en gyldig e-postadresse." };
  }
  if (!customerPhone) return { error: "Fyll inn telefonnummeret ditt." };

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.slug, String(input.slug)),
  });
  if (!business) return { error: "Fant ikke bedriften." };

  const service = await db.query.services.findFirst({
    where: and(
      eq(services.id, String(input.serviceId)),
      eq(services.businessId, business.id),
      eq(services.active, true),
    ),
  });
  if (!service) return { error: "Behandlingen er ikke tilgjengelig." };

  // Re-sjekk at tiden fortsatt er ledig (mot dobbeltbooking).
  const wh = await db.query.workingHours.findMany({
    where: eq(workingHours.businessId, business.id),
  });
  const exc = await db.query.availabilityExceptions.findMany({
    where: eq(availabilityExceptions.businessId, business.id),
  });
  const { start, end } = dayBounds(date);
  const dayBookings = await db.query.bookings.findMany({
    where: and(
      eq(bookings.businessId, business.id),
      eq(bookings.status, "confirmed"),
      gte(bookings.startsAt, start),
      lt(bookings.startsAt, end),
    ),
  });
  const available = computeAvailableSlots({
    date,
    durationMinutes: service.durationMinutes,
    workingHours: wh.map((w) => ({
      weekday: w.weekday,
      startTime: w.startTime,
      endTime: w.endTime,
    })),
    exceptions: exc.map((e) => ({
      date: e.date,
      type: e.type,
      startTime: e.startTime,
      endTime: e.endTime,
    })),
    bookings: dayBookings.map((b) => ({
      startsAt: b.startsAt,
      endsAt: b.endsAt,
    })),
    now: new Date(),
  });
  if (!available.includes(time)) {
    return {
      error: "Beklager, denne tiden er ikke lenger ledig. Velg en annen.",
    };
  }

  const startsAt = slotInstant(date, time);
  const endsAt = new Date(
    startsAt.getTime() + service.durationMinutes * 60_000,
  );

  const [booking] = await db
    .insert(bookings)
    .values({
      businessId: business.id,
      serviceId: service.id,
      customerName,
      customerEmail,
      customerPhone,
      startsAt,
      endsAt,
    })
    .returning();

  const when = formatDateTime(startsAt);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const cancelUrl = `${baseUrl}/avbestill/${booking.cancellationToken}`;

  await sendEmail({
    to: customerEmail,
    subject: `Bekreftelse: time hos ${business.name}`,
    html: `
      <h2>Timen din er booket</h2>
      <p>Hei ${customerName},</p>
      <p>Du har booket time hos <strong>${business.name}</strong>:</p>
      <ul>
        <li><strong>Behandling:</strong> ${service.name}</li>
        <li><strong>Tidspunkt:</strong> ${when}</li>
        <li><strong>Varighet:</strong> ${service.durationMinutes} min</li>
        <li><strong>Pris:</strong> ${service.priceNok} kr</li>
      </ul>
      <p>Trenger du å avbestille? <a href="${cancelUrl}">Avbestill timen her</a>.
      Avbestilling senere enn 24 timer før timen kan medføre full betaling.</p>
      <p>Vi gleder oss til å se deg!</p>
    `,
  });

  await sendEmail({
    to: business.email,
    subject: `Ny booking: ${service.name} — ${when}`,
    html: `
      <h2>Ny booking</h2>
      <ul>
        <li><strong>Behandling:</strong> ${service.name}</li>
        <li><strong>Tidspunkt:</strong> ${when}</li>
        <li><strong>Kunde:</strong> ${customerName}</li>
        <li><strong>E-post:</strong> ${customerEmail}</li>
        <li><strong>Telefon:</strong> ${customerPhone}</li>
      </ul>
    `,
  });

  revalidatePath("/admin/bookinger");
  return { ok: true };
}

type BookingRow = typeof bookings.$inferSelect;

async function sendCancellationEmails(booking: BookingRow): Promise<void> {
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, booking.businessId),
  });
  const service = await db.query.services.findFirst({
    where: eq(services.id, booking.serviceId),
  });
  if (!business || !service) return;

  const when = formatDateTime(booking.startsAt);

  await sendEmail({
    to: booking.customerEmail,
    subject: `Avbestilt: time hos ${business.name}`,
    html: `
      <h2>Timen din er avbestilt</h2>
      <p>Hei ${booking.customerName},</p>
      <p>Følgende time hos <strong>${business.name}</strong> er avbestilt:</p>
      <ul>
        <li><strong>Behandling:</strong> ${service.name}</li>
        <li><strong>Tidspunkt:</strong> ${when}</li>
      </ul>
    `,
  });

  await sendEmail({
    to: business.email,
    subject: `Avbestilling: ${service.name} — ${when}`,
    html: `
      <h2>En booking er avbestilt</h2>
      <ul>
        <li><strong>Behandling:</strong> ${service.name}</li>
        <li><strong>Tidspunkt:</strong> ${when}</li>
        <li><strong>Kunde:</strong> ${booking.customerName}</li>
        <li><strong>E-post:</strong> ${booking.customerEmail}</li>
        <li><strong>Telefon:</strong> ${booking.customerPhone}</li>
      </ul>
    `,
  });
}

// Avbestilling fra kundens lenke i bekreftelses-e-posten (uten innlogging).
export async function cancelBookingByToken(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  if (!UUID_PATTERN.test(token)) return;

  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.cancellationToken, token),
  });
  if (!booking || booking.status === "cancelled") return;

  await db
    .update(bookings)
    .set({ status: "cancelled" })
    .where(eq(bookings.id, booking.id));
  await sendCancellationEmails(booking);

  revalidatePath(`/avbestill/${token}`);
  revalidatePath("/admin/bookinger");
}

// Avbestilling fra bedriftens admin-panel.
export async function cancelBookingByAdmin(formData: FormData): Promise<void> {
  const businessId = await requireBusinessId();
  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) return;

  const booking = await db.query.bookings.findFirst({
    where: and(eq(bookings.id, id), eq(bookings.businessId, businessId)),
  });
  if (!booking || booking.status === "cancelled") return;

  await db
    .update(bookings)
    .set({ status: "cancelled" })
    .where(eq(bookings.id, booking.id));
  await sendCancellationEmails(booking);

  revalidatePath("/admin/bookinger");
}
