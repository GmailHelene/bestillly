"use client";

import { useActionState } from "react";
import { subscribe } from "@/lib/actions/newsletter";

export function NewsletterSignup({
  slug,
  accentColor,
}: {
  slug: string;
  accentColor: string;
}) {
  const [state, action, pending] = useActionState(
    subscribe.bind(null, slug),
    undefined,
  );

  if (state && "ok" in state) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
        Takk! Du er meldt på nyhetsbrevet.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-2">
      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="email"
          type="email"
          required
          placeholder="Din e-postadresse"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
        />
        <button
          type="submit"
          disabled={pending}
          style={{ backgroundColor: accentColor }}
          className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Melder på…" : "Meld meg på"}
        </button>
      </div>
      <p className="text-xs text-gray-400">
        Du kan melde deg av når som helst.
      </p>
    </form>
  );
}
