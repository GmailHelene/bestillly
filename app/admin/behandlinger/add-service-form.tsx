"use client";

import { useRef, useState, useTransition } from "react";
import { createService } from "@/lib/actions/services";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

export function AddServiceForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createService(undefined, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="space-y-3 rounded-xl border border-gray-200 p-4"
    >
      <h2 className="font-semibold">Ny behandling</h2>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            Navn
          </label>
          <input id="name" name="name" type="text" required className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="durationMinutes" className="text-sm font-medium">
              Varighet (min)
            </label>
            <input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min={1}
              required
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="priceNok" className="text-sm font-medium">
              Pris (kr)
            </label>
            <input
              id="priceNok"
              name="priceNok"
              type="number"
              min={0}
              required
              className={inputClass}
            />
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">
          Beskrivelse <span className="text-gray-400">(valgfritt)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "Legger til…" : "Legg til behandling"}
      </button>
    </form>
  );
}
