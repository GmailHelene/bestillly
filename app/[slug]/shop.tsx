"use client";

import { useState } from "react";

type ShopProduct = {
  id: string;
  name: string;
  description: string | null;
  priceNok: number;
  imageUrl: string | null;
  inStock: boolean;
};

const qtyBtn =
  "flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 text-sm hover:bg-gray-50";

export function Shop({
  products,
  accentColor,
  radius,
}: {
  products: ShopProduct[];
  accentColor: string;
  radius: string;
}) {
  const [cart, setCart] = useState<Record<string, number>>({});

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
  const total = cartItems.reduce(
    (sum, item) => sum + item.priceNok * item.qty,
    0,
  );

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
                  alt=""
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
          <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-medium">
            <span>Totalt</span>
            <span>{total} kr</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Kassen aktiveres i neste steg.
          </p>
        </div>
      )}
    </div>
  );
}
