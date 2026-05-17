"use client";

import { useActionState } from "react";
import { registerAction } from "@/lib/actions/auth";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
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
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="orgNumber" className="text-sm font-medium">
          Organisasjonsnummer
        </label>
        <input
          id="orgNumber"
          name="orgNumber"
          type="text"
          inputMode="numeric"
          required
          className={inputClass}
        />
        <p className="text-xs text-gray-400">9 siffer.</p>
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
          autoComplete="email"
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          Passord
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className={inputClass}
        />
        <p className="text-xs text-gray-400">Minst 8 tegn.</p>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "Oppretter konto…" : "Opprett konto"}
      </button>
    </form>
  );
}
