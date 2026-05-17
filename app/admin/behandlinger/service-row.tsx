"use client";

import { useActionState } from "react";
import type { Service } from "@/db/schema";
import { deleteService, updateService } from "@/lib/actions/services";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

export function ServiceRow({ service }: { service: Service }) {
  const [state, action, pending] = useActionState(updateService, undefined);
  const deleteFormId = `delete-${service.id}`;

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <form
        id={deleteFormId}
        action={deleteService}
        className="hidden"
        onSubmit={(e) => {
          if (!confirm(`Slette behandlingen «${service.name}»?`)) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={service.id} />
      </form>

      <form action={action} className="space-y-3">
        <input type="hidden" name="id" value={service.id} />
        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Navn</label>
            <input
              name="name"
              type="text"
              required
              defaultValue={service.name}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Varighet (min)</label>
              <input
                name="durationMinutes"
                type="number"
                min={1}
                required
                defaultValue={service.durationMinutes}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Pris (kr)</label>
              <input
                name="priceNok"
                type="number"
                min={0}
                required
                defaultValue={service.priceNok}
                className={inputClass}
              />
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Beskrivelse <span className="text-gray-400">(valgfritt)</span>
          </label>
          <textarea
            name="description"
            rows={2}
            defaultValue={service.description ?? ""}
            className={inputClass}
          />
        </div>
        <div className="flex items-center justify-between pt-1">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {pending ? "Lagrer…" : "Lagre endringer"}
          </button>
          <button
            type="submit"
            form={deleteFormId}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Slett
          </button>
        </div>
      </form>
    </div>
  );
}
