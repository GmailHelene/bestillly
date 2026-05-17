"use client";

import { useActionState } from "react";
import { sendBusinessMessage } from "@/lib/actions/business-contact";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

export function ContactSection({
  slug,
  accentColor,
}: {
  slug: string;
  accentColor: string;
}) {
  const [state, action, pending] = useActionState(
    sendBusinessMessage.bind(null, slug),
    undefined,
  );

  if (state && "ok" in state) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
        Takk for meldingen! Du hører fra oss så snart vi kan.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <div className="space-y-1">
        <label htmlFor="contact-name" className="text-sm font-medium">
          Navn
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="contact-email" className="text-sm font-medium">
          E-post
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="contact-message" className="text-sm font-medium">
          Melding
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          required
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        style={{ backgroundColor: accentColor }}
        className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Sender…" : "Send melding"}
      </button>
    </form>
  );
}
