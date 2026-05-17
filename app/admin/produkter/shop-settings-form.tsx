"use client";

import { useActionState } from "react";
import { updateShopSettings } from "@/lib/actions/shop";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

type Settings = {
  vippsNumber: string;
  shippingFree: boolean;
  shippingFee: number;
  shippingLabel: string;
};

export function ShopSettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState(
    updateShopSettings,
    undefined,
  );

  return (
    <form
      action={action}
      className="space-y-3 rounded-xl border border-gray-200 p-4"
    >
      <div>
        <h2 className="font-semibold">Butikkinnstillinger</h2>
        <p className="text-sm text-gray-500">
          Vipps-nummer for betaling, og hvordan frakt beregnes i kassen.
        </p>
      </div>

      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state && "ok" in state && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Lagret.
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="vippsNumber" className="text-sm font-medium">
          Vipps-nummer
        </label>
        <input
          id="vippsNumber"
          name="vippsNumber"
          type="text"
          inputMode="numeric"
          defaultValue={settings.vippsNumber}
          placeholder="F.eks. 123456"
          className={inputClass}
        />
        <p className="text-xs text-gray-400">
          Kunden får beskjed om å betale til dette nummeret i kassen.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="shippingFree"
          defaultChecked={settings.shippingFree}
        />
        Fri frakt
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="shippingFee" className="text-sm font-medium">
            Fraktpris (kr)
          </label>
          <input
            id="shippingFee"
            name="shippingFee"
            type="number"
            min={0}
            defaultValue={settings.shippingFee}
            className={inputClass}
          />
          <p className="text-xs text-gray-400">Brukes når fri frakt er av.</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="shippingLabel" className="text-sm font-medium">
            Frakt-tekst
          </label>
          <input
            id="shippingLabel"
            name="shippingLabel"
            type="text"
            defaultValue={settings.shippingLabel}
            placeholder="Frakt"
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "Lagrer…" : "Lagre innstillinger"}
      </button>
    </form>
  );
}
