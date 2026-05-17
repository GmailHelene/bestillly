"use client";

import { useActionState } from "react";
import { sendNewsletter } from "@/lib/actions/newsletter";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

export function ComposeForm({
  subscriberCount,
}: {
  subscriberCount: number;
}) {
  const [state, action, pending] = useActionState(sendNewsletter, undefined);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !confirm(
            `Sende nyhetsbrevet til ${subscriberCount} abonnent(er)?`,
          )
        ) {
          e.preventDefault();
        }
      }}
      className="space-y-3 rounded-xl border border-gray-200 p-4"
    >
      <h2 className="font-semibold">Skriv nyhetsbrev</h2>

      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state && "ok" in state && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Nyhetsbrevet ble sendt til {state.count} abonnent(er).
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="subject" className="text-sm font-medium">
          Emne
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="content" className="text-sm font-medium">
          Innhold
        </label>
        <textarea
          id="content"
          name="content"
          rows={8}
          required
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={pending || subscriberCount === 0}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending
          ? "Sender…"
          : `Send til ${subscriberCount} abonnent(er)`}
      </button>
    </form>
  );
}
