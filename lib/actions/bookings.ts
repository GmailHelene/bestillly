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

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

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

  await db.insert(bookings).values({
    businessId: business.id,
    serviceId: service.id,
    customerName,
    customerEmail,
    customerPhone,
    startsAt,
    endsAt,
  });

  const when = formatDateTime(startsAt);

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
