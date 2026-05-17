import type { ReactNode } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, businesses, services } from "@/db/schema";
import { formatDateTime } from "@/lib/format";
import { cancelBookingByToken } from "@/lib/actions/bookings";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-md space-y-5 px-5 py-12">
      {children}
    </main>
  );
}

export default async function CancelBookingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!UUID_PATTERN.test(token)) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold">Ugyldig lenke</h1>
        <p className="text-gray-600">
          Avbestillingslenken er ugyldig eller utløpt.
        </p>
      </Shell>
    );
  }

  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.cancellationToken, token),
  });
  if (!booking) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold">Fant ikke bookingen</h1>
        <p className="text-gray-600">
          Avbestillingslenken er ugyldig eller utløpt.
        </p>
      </Shell>
    );
  }

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, booking.businessId),
  });
  const service = await db.query.services.findFirst({
    where: eq(services.id, booking.serviceId),
  });

  if (booking.status === "cancelled") {
    return (
      <Shell>
        <h1 className="text-2xl font-bold">Timen er avbestilt</h1>
        <p className="text-gray-600">
          {service?.name} hos {business?.name} —{" "}
          {formatDateTime(booking.startsAt)} er avbestilt.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold">Avbestill time</h1>
      <p className="text-gray-600">Du er i ferd med å avbestille denne timen:</p>
      <div className="rounded-xl border border-gray-200 p-4">
        <p className="font-medium">{service?.name}</p>
        <p className="text-sm text-gray-500">hos {business?.name}</p>
        <p className="mt-1 text-sm">{formatDateTime(booking.startsAt)}</p>
      </div>
      <p className="text-sm text-gray-500">
        Avbestilling senere enn 24 timer før avtalt tid kan medføre full
        betaling.
      </p>
      <form action={cancelBookingByToken}>
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Bekreft avbestilling
        </button>
      </form>
    </Shell>
  );
}
