import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, businesses, orders, services } from "@/db/schema";
import { requireBusinessId } from "@/lib/session";
import { parseOnepageContent } from "@/lib/onepage";
import { formatDateTime } from "@/lib/format";
import { PrintButton } from "./print-button";

type Line = { description: string; amountNok: number };

type Receipt = {
  reference: string;
  date: Date;
  customerName: string;
  customerContact: string[];
  lines: Line[];
  totalNok: number;
};

export default async function KvitteringPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  if (type !== "booking" && type !== "ordre") notFound();

  const businessId = await requireBusinessId();
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });
  if (!business) notFound();
  const content = parseOnepageContent(business.onepageContent);
  const orgNumber = content.footer?.orgNumber;

  let receipt: Receipt;

  if (type === "ordre") {
    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, id), eq(orders.businessId, businessId)),
    });
    if (!order) notFound();
    const lines: Line[] = order.items.map((i) => ({
      description: `${i.qty} × ${i.name}`,
      amountNok: i.priceNok * i.qty,
    }));
    if (order.shippingNok > 0) {
      lines.push({ description: "Frakt", amountNok: order.shippingNok });
    }
    receipt = {
      reference: `Ordre #${order.orderNumber}`,
      date: order.createdAt,
      customerName: order.customerName,
      customerContact: [order.customerEmail, order.customerPhone].filter(
        Boolean,
      ),
      lines,
      totalNok: order.totalNok,
    };
  } else {
    const booking = await db.query.bookings.findFirst({
      where: and(eq(bookings.id, id), eq(bookings.businessId, businessId)),
    });
    if (!booking) notFound();
    const service = await db.query.services.findFirst({
      where: eq(services.id, booking.serviceId),
    });
    receipt = {
      reference: `Ref. ${booking.id.slice(0, 8).toUpperCase()}`,
      date: booking.startsAt,
      customerName: booking.customerName,
      customerContact: [
        booking.customerEmail,
        booking.customerPhone ?? "",
      ].filter(Boolean),
      lines: [
        {
          description: service?.name ?? "Behandling",
          amountNok: service?.priceNok ?? 0,
        },
      ],
      totalNok: service?.priceNok ?? 0,
    };
  }

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-10">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="space-y-6 rounded-xl border border-gray-200 p-8 print:border-0 print:p-0">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-lg font-bold">{business.name}</p>
            {business.address && (
              <p className="text-sm text-gray-600">{business.address}</p>
            )}
            {orgNumber && (
              <p className="text-sm text-gray-600">Org.nr {orgNumber}</p>
            )}
            <p className="text-sm text-gray-600">{business.email}</p>
            {business.phone && (
              <p className="text-sm text-gray-600">Tlf {business.phone}</p>
            )}
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold">Kvittering</h1>
            <p className="text-sm text-gray-600">{receipt.reference}</p>
            <p className="text-sm text-gray-600">
              {formatDateTime(receipt.date)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Kunde
          </p>
          <p className="text-sm font-medium text-gray-800">
            {receipt.customerName}
          </p>
          {receipt.customerContact.map((c) => (
            <p key={c} className="text-sm text-gray-600">
              {c}
            </p>
          ))}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300 text-left text-gray-500">
              <th className="py-2 font-medium">Beskrivelse</th>
              <th className="py-2 text-right font-medium">Beløp</th>
            </tr>
          </thead>
          <tbody>
            {receipt.lines.map((line, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2">{line.description}</td>
                <td className="py-2 text-right whitespace-nowrap">
                  {line.amountNok.toLocaleString("nb-NO")} kr
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="py-2 font-semibold">Totalt</td>
              <td className="py-2 text-right font-semibold">
                {receipt.totalNok.toLocaleString("nb-NO")} kr
              </td>
            </tr>
          </tfoot>
        </table>

        <p className="text-xs text-gray-400">
          Beløpet er oppgitt i norske kroner. Bedriften er ansvarlig for
          korrekt mva-behandling og bokføring.
        </p>
      </div>
    </main>
  );
}
