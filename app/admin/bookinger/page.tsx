import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, services } from "@/db/schema";
import { requireBusinessId } from "@/lib/session";
import { BackLink } from "@/components/back-link";
import { formatDateTime } from "@/lib/format";

type BookingRow = typeof bookings.$inferSelect;

function BookingCard({
  booking,
  serviceName,
}: {
  booking: BookingRow;
  serviceName: string;
}) {
  const cancelled = booking.status === "cancelled";
  return (
    <div
      className={`rounded-xl border border-gray-200 p-4 ${
        cancelled ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">
            {serviceName}
            {cancelled && (
              <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                Avbestilt
              </span>
            )}
          </p>
          <p className="text-sm text-gray-500">
            {formatDateTime(booking.startsAt)}
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="font-medium">{booking.customerName}</p>
          <p className="text-gray-500">{booking.customerEmail}</p>
          <p className="text-gray-500">{booking.customerPhone}</p>
        </div>
      </div>
    </div>
  );
}

export default async function BookingsPage() {
  const businessId = await requireBusinessId();

  const list = await db.query.bookings.findMany({
    where: eq(bookings.businessId, businessId),
    orderBy: (b, { desc }) => [desc(b.startsAt)],
  });
  const serviceList = await db.query.services.findMany({
    where: eq(services.businessId, businessId),
  });
  const serviceName = new Map(serviceList.map((s) => [s.id, s.name]));

  const now = new Date();
  const upcoming = list
    .filter((b) => b.startsAt >= now)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const past = list.filter((b) => b.startsAt < now);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <BackLink href="/admin" label="Tilbake til oversikt" />
        <h1 className="text-2xl font-bold">Bookinger</h1>
        <p className="text-sm text-gray-500">
          Kommende og tidligere avtaler for bedriften din.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">
          Kommende <span className="text-gray-400">({upcoming.length})</span>
        </h2>
        {upcoming.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            Ingen kommende bookinger.
          </p>
        ) : (
          upcoming.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              serviceName={serviceName.get(b.serviceId) ?? "Ukjent behandling"}
            />
          ))
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">
            Tidligere <span className="text-gray-400">({past.length})</span>
          </h2>
          {past.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              serviceName={serviceName.get(b.serviceId) ?? "Ukjent behandling"}
            />
          ))}
        </section>
      )}
    </div>
  );
}
