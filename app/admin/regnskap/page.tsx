import { and, eq, gte, lt } from "drizzle-orm";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { db } from "@/db";
import { bookings, orders, services } from "@/db/schema";
import { requireBusinessId } from "@/lib/session";
import { TIMEZONE } from "@/lib/availability";
import { BackLink } from "@/components/back-link";
import { ExportControls, type ExportRow } from "./export-controls";

function monthBounds(ym: string): { start: Date; end: Date } {
  const [y, m] = ym.split("-").map(Number);
  const start = fromZonedTime(`${ym}-01T00:00:00`, TIMEZONE);
  const nextM = m === 12 ? 1 : m + 1;
  const nextY = m === 12 ? y + 1 : y;
  const end = fromZonedTime(
    `${nextY}-${String(nextM).padStart(2, "0")}-01T00:00:00`,
    TIMEZONE,
  );
  return { start, end };
}

// De 12 siste månedene som valg, nyeste først.
function recentMonths(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("nb-NO", {
      month: "long",
      year: "numeric",
    });
    out.push({ value, label });
  }
  return out;
}

export default async function RegnskapPage({
  searchParams,
}: {
  searchParams: Promise<{ maned?: string }>;
}) {
  const businessId = await requireBusinessId();
  const { maned } = await searchParams;
  const month = /^\d{4}-\d{2}$/.test(maned ?? "")
    ? (maned as string)
    : formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM");
  const { start, end } = monthBounds(month);

  const bookingList = await db.query.bookings.findMany({
    where: and(
      eq(bookings.businessId, businessId),
      eq(bookings.status, "confirmed"),
      gte(bookings.startsAt, start),
      lt(bookings.startsAt, end),
    ),
  });
  const serviceList = await db.query.services.findMany({
    where: eq(services.businessId, businessId),
  });
  const serviceMap = new Map(serviceList.map((s) => [s.id, s]));

  const orderList = await db.query.orders.findMany({
    where: and(
      eq(orders.businessId, businessId),
      gte(orders.createdAt, start),
      lt(orders.createdAt, end),
    ),
  });

  const rows: ExportRow[] = [
    ...bookingList.map((b): ExportRow => {
      const svc = serviceMap.get(b.serviceId);
      return {
        date: formatInTimeZone(b.startsAt, TIMEZONE, "yyyy-MM-dd"),
        type: "Booking",
        reference: "",
        description: svc?.name ?? "Behandling",
        customer: b.customerName,
        amountNok: svc?.priceNok ?? 0,
        linkType: "booking",
        id: b.id,
      };
    }),
    ...orderList
      .filter((o) => o.status !== "cancelled")
      .map((o): ExportRow => ({
        date: formatInTimeZone(o.createdAt, TIMEZONE, "yyyy-MM-dd"),
        type: "Ordre",
        reference: `#${o.orderNumber}`,
        description: o.items.map((i) => `${i.qty}x ${i.name}`).join(", "),
        customer: o.customerName,
        amountNok: o.totalNok,
        linkType: "ordre",
        id: o.id,
      })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const total = rows.reduce((sum, r) => sum + r.amountNok, 0);
  const monthLabel =
    recentMonths().find((m) => m.value === month)?.label ?? month;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <BackLink href="/admin" label="Tilbake til oversikt" />
        <h1 className="text-2xl font-bold">Regnskap</h1>
        <p className="text-sm text-gray-500">
          Last ned en oversikt over bookinger og salg for en valgt måned —
          som en fil regnskapsføreren din kan ta imot, eller importere i
          regnskapsprogrammet ditt.
        </p>
      </div>

      <ExportControls
        month={month}
        monthLabel={monthLabel}
        monthOptions={recentMonths()}
        rows={rows}
      />

      <div className="rounded-xl border border-gray-200 p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">{monthLabel}</h2>
          <span className="text-sm text-gray-500">
            {rows.length} linjer · {total.toLocaleString("nb-NO")} kr
          </span>
        </div>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            Ingen bookinger eller salg registrert denne måneden.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="py-2 pr-3 font-medium">Dato</th>
                  <th className="py-2 pr-3 font-medium">Type</th>
                  <th className="py-2 pr-3 font-medium">Beskrivelse</th>
                  <th className="py-2 pr-3 font-medium">Kunde</th>
                  <th className="py-2 pr-3 text-right font-medium">Beløp</th>
                  <th className="py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 pr-3 whitespace-nowrap">{r.date}</td>
                    <td className="py-2 pr-3">{r.type}</td>
                    <td className="py-2 pr-3">{r.description}</td>
                    <td className="py-2 pr-3">{r.customer}</td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">
                      {r.amountNok.toLocaleString("nb-NO")} kr
                    </td>
                    <td className="py-2 whitespace-nowrap text-right">
                      <a
                        href={`/kvittering/${r.linkType}/${r.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-gray-500 underline hover:text-gray-900"
                      >
                        Kvittering ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="rounded-xl border border-dashed border-gray-300 p-4 text-xs text-gray-500">
        Oversikten er et regnskapsgrunnlag — ikke et ferdig regnskap.
        Booking-beløp bruker behandlingens gjeldende pris. Snakk med
        regnskapsføreren din om mva og bokføring.
      </p>
    </div>
  );
}
