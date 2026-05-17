"use client";

import { useActionState } from "react";
import { updateBusinessProfile } from "@/lib/actions/business";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

type Profile = {
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState(
    updateBusinessProfile,
    undefined,
  );

  return (
    <form
      action={action}
      className="space-y-3 rounded-xl border border-gray-200 p-4"
    >
      <h2 className="font-semibold">Innhold på siden</h2>

      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state && "ok" in state && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Siden er oppdatert.
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Bedriftsnavn
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={profile.name}
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">
          Beskrivelse
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={profile.description ?? ""}
          placeholder="Kort om bedriften — vises øverst på siden din."
          className={inputClass}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="address" className="text-sm font-medium">
            Adresse
          </label>
          <input
            id="address"
            name="address"
            type="text"
            defaultValue={profile.address ?? ""}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="phone" className="text-sm font-medium">
            Telefon
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile.phone ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "Lagrer…" : "Lagre"}
      </button>
    </form>
  );
}
