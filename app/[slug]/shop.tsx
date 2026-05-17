"use client";

import { useState, useTransition } from "react";
import { createOrder } from "@/lib/actions/orders";

type ShopProduct = {
  id: string;
  name: string;
  description: string | null;
  priceNok: number;
  imageUrl: string | null;
  inStock: boolean;
};

type Shipping = { free: boolean; fee: number; label: string };

const qtyBtn =
  "flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 text-sm hover:bg-gray-50";
const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

export function Shop({
  products,
  accentColor,
  radius,
  slug,
  shipping,
}: {
  products: ShopProduct[];
  accentColor: string;
  radius: string;
  slug: string;
  shipping: Shipping;
}) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, startSubmit] = useTransition();
  const [confirmed, setConfirmed] = useState<{
    orderNumber: number;
    totalNok: number;
    vippsNumber: string | null;
  } | null>(null);

  function setQty(id: string, qty: number) {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }

  const cartItems = products
    .filter((p) => (cart[p.id] ?? 0) > 0)
    .map((p) => ({ ...p, qty: cart[p.id] }));
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.priceNok * item.qty,
    0,
  );
  const shippingNok = shipping.free ? 0 : shipping.fee;
  const total = subtotal + shippingNok;
  const shippingLabel = shipping.label || "Frakt";

  function handleCheckout(formData: FormData) {
    setError(null);
    startSubmit(async () => {
      const result = await createOrder({
        slug,
        items: cartItems.map((i) => ({ productId: i.id, qty: i.qty })),
        customerName: String(formData.get("customerName") ?? ""),
        customerEmail: String(formData.get("customerEmail") ?? ""),
        customerPhone: String(formData.get("customerPhone") ?? ""),
      });
      if ("error" in result) {
        setError(result.error);
      } else {
        setConfirmed({
          orderNumber: result.orderNumber,
          totalNok: result.totalNok,
          vippsNumber: result.vippsNumber,
        });
        setCart({});
        setCheckoutOpen(false);
      }
    });
  }

  if (confirmed) {
    return (
      <div className={`space-y-2 bg-green-50 p-5 ${radius}`}>
        <p className="font-medium text-green-800">Takk for bestillingen!</p>
        <p className="text-sm text-green-800">
          Ordre #{confirmed.orderNumber}
        </p>
        {confirmed.vippsNumber ? (
          <p className="text-sm text-gray-700">
            Betal <strong>{confirmed.totalNok} kr</strong> med Vipps til{" "}
            <strong>{confirmed.vippsNumber}</strong>, og merk betalingen med
            «ordre #{confirmed.orderNumber}».
          </p>
        ) : (
          <p className="text-sm text-gray-700">
            Bedriften tar kontakt med deg om betaling.
          </p>
        )}
        <p className="text-sm text-gray-500">
          Du får en bekreftelse på e-post.
        </p>
        <button
          type="button"
          onClick={() => setConfirmed(null)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
        >
          Handle mer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {products.map((product) => {
          const qty = cart[product.id] ?? 0;
          return (
            <div
              key={product.id}
              className={`border border-gray-200 bg-white p-4 ${radius}`}
            >
              {product.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  loading="lazy"
                  className={`mb-3 aspect-video w-full object-cover ${radius}`}
                />
              )}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{product.name}</p>
                  {product.description && (
                    <p className="text-sm text-gray-500">
                      {product.description}
                    </p>
                  )}
                </div>
                <span className="shrink-0 font-medium">
                  {product.priceNok} kr
                </span>
              </div>
              <div className="mt-3">
                {!product.inStock ? (
                  <span className="text-sm text-gray-400">Utsolgt</span>
                ) : qty === 0 ? (
                  <button
                    type="button"
                    onClick={() => setQty(product.id, 1)}
                    style={{ backgroundColor: accentColor }}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                  >
                    Legg i kurv
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQty(product.id, qty - 1)}
                      className={qtyBtn}
                      aria-label="Færre"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-medium">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(product.id, qty + 1)}
                      className={qtyBtn}
                      aria-label="Flere"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {cartItems.length > 0 && (
        <div className={`border border-gray-200 bg-white p-4 ${radius}`}>
          <p className="font-medium">Handlekurv</p>
          <ul className="mt-2 divide-y divide-gray-100">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 py-2 text-sm"
              >
                <span>
                  {item.qty} × {item.name}
                </span>
                <div className="flex items-center gap-3">
                  <span>{item.priceNok * item.qty} kr</span>
                  <button
                    type="button"
                    onClick={() => setQty(item.id, 0)}
                    className="text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    Fjern
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-2 space-y-1 border-t border-gray-200 pt-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Delsum</span>
              <span>{subtotal} kr</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{shippingLabel}</span>
              <span>{shippingNok === 0 ? "Gratis" : `${shippingNok} kr`}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Totalt</span>
              <span>{total} kr</span>
            </div>
          </div>

          {!checkoutOpen ? (
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              style={{ backgroundColor: accentColor }}
              className="mt-3 rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Til kassen
            </button>
          ) : (
            <form action={handleCheckout} className="mt-3 space-y-3">
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
              <div className="space-y-1">
                <label htmlFor="customerName" className="text-sm font-medium">
                  Navn
                </label>
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  required
                  className={inputClass}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label
                    htmlFor="customerEmail"
                    className="text-sm font-medium"
                  >
                    E-post
                  </label>
                  <input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    required
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="customerPhone"
                    className="text-sm font-medium"
                  >
                    Telefon
                  </label>
                  <input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    required
                    className={inputClass}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Etter bestilling betaler du med Vipps, og bedriften bekrefter
                ordren.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: accentColor }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Sender…" : "Fullfør bestilling"}
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Avbryt
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
