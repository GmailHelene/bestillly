"use client";

import { useActionState } from "react";
import { sendContactMessage } from "@/lib/actions/contact";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

export function ContactForm() {
  const [state, action, pending] = useActionState(
    sendContactMessage,
    undefined,
  );

  if (state && "ok" in state) {
    return (
      <div className="rounded-xl bg-green-50 p-5 text-sm text-green-800">
        Takk for meldingen! Vi svarer deg så snart vi kan.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Navn
        </label>
        <input id="name" name="name" type="text" required className={inputClass} />
      </div>
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          E-post
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="message" className="text-sm font-medium">
          Melding
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "Sender…" : "Send melding"}
      </button>
    </form>
  );
}
