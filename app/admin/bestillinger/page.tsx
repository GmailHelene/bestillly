import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireBusinessId } from "@/lib/session";
import { BackLink } from "@/components/back-link";
import { formatDateTime } from "@/lib/format";
import { OrderActions } from "./order-actions";

const STATUS: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Venter på betaling",
    className: "bg-amber-100 text-amber-800",
  },
  paid: { label: "Betalt", className: "bg-green-100 text-green-800" },
  cancelled: {
    label: "Kansellert",
    className: "bg-red-100 text-red-700",
  },
};

export default async function OrdersPage() {
  const businessId = await requireBusinessId();
  const list = await db.query.orders.findMany({
    where: eq(orders.businessId, businessId),
    orderBy: (o, { desc }) => [desc(o.createdAt)],
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <BackLink href="/admin" label="Tilbake til oversikt" />
        <h1 className="text-2xl font-bold">Bestillinger</h1>
        <p className="text-sm text-gray-500">
          Ordrer fra nettbutikken din. Marker som betalt når Vipps-betalingen
          er mottatt.
        </p>
      </div>

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          Ingen bestillinger ennå.
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((order) => {
            const status = STATUS[order.status] ?? STATUS.pending;
            return (
              <div
                key={order.id}
                className={`rounded-xl border border-gray-200 p-4 ${
                  order.status === "cancelled" ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      Ordre #{order.orderNumber}
                      <span
                        className={`ml-2 rounded px-1.5 py-0.5 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-gray-500">{order.customerEmail}</p>
                    <p className="text-gray-500">{order.customerPhone}</p>
                  </div>
                </div>
                <ul className="mt-3 space-y-0.5 text-sm text-gray-600">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.qty} × {item.name} — {item.priceNok * item.qty} kr
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm">
                  <span className="text-gray-500">
                    Frakt {order.shippingNok === 0
                      ? "gratis"
                      : `${order.shippingNok} kr`}{" "}
                    ·{" "}
                  </span>
                  <span className="font-medium">
                    Totalt {order.totalNok} kr
                  </span>
                </p>
                <OrderActions orderId={order.id} status={order.status} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
