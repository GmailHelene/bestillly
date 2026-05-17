"use client";

import { cancelOrder, markOrderPaid } from "@/lib/actions/orders";

export function OrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  return (
    <div className="mt-3 flex gap-3 border-t border-gray-100 pt-3">
      {status === "pending" && (
        <form action={markOrderPaid}>
          <input type="hidden" name="id" value={orderId} />
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            Marker som betalt
          </button>
        </form>
      )}
      {status !== "cancelled" && (
        <form
          action={cancelOrder}
          onSubmit={(e) => {
            if (!confirm("Kansellere denne ordren?")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={orderId} />
          <button
            type="submit"
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Kanseller
          </button>
        </form>
      )}
    </div>
  );
}
