"use client";

import { useState, useTransition } from "react";
import { setShopEnabled } from "@/lib/actions/shop";

export function ShopToggle({ enabled }: { enabled: boolean }) {
  const [on, setOn] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle() {
    setError(null);
    const next = !on;
    startTransition(async () => {
      const result = await setShopEnabled(next);
      if (result && "ok" in result) {
        setOn(next);
      } else if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4">
        <div>
          <p className="font-medium">Nettbutikk</p>
          <p className="text-sm text-gray-500">
            {on
              ? "Nettbutikken er på. Produkter vises på den offentlige siden din."
              : "Nettbutikken er av. De fleste enkeltpersonforetak trenger den ikke."}
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          role="switch"
          aria-checked={on}
          className={`relative h-6 w-11 flex-none rounded-full transition-colors disabled:opacity-50 ${
            on ? "bg-gray-900" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              on ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
