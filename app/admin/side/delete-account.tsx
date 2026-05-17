"use client";

import { useActionState, useState } from "react";
import { deleteBusinessAccount } from "@/lib/actions/business";

export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    deleteBusinessAccount,
    undefined,
  );

  return (
    <div className="space-y-3 rounded-xl border border-red-200 p-4">
      <div>
        <h2 className="font-semibold text-red-700">Slett konto</h2>
        <p className="text-sm text-gray-600">
          Sletter bedriften og alle data permanent — behandlinger, bookinger,
          produkter, ordrer, blogginnlegg og abonnenter. Dette kan ikke angres.
        </p>
      </div>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          Jeg vil slette kontoen
        </button>
      ) : (
        <form action={action} className="space-y-2">
          {state && "error" in state && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}
          <label htmlFor="confirm" className="block text-sm font-medium">
            Skriv <span className="font-bold">SLETT</span> for å bekrefte
          </label>
          <input
            id="confirm"
            name="confirm"
            type="text"
            autoComplete="off"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {pending ? "Sletter…" : "Slett kontoen permanent"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Avbryt
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
