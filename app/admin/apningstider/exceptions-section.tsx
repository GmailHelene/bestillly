"use client";

import { useRef, useState, useTransition } from "react";
import { addException, deleteException } from "@/lib/actions/working-hours";

const inputClass =
  "rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-gray-900";

type Exception = {
  id: string;
  date: string;
  type: "closed" | "custom_hours";
  startTime: string | null;
  endTime: string | null;
};

function formatDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${d}.${m}.${y}`;
}

export function ExceptionsSection({
  exceptions,
}: {
  exceptions: Exception[];
}) {
  const [type, setType] = useState<"closed" | "custom_hours">("closed");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addException(undefined, formData);
      if (result && "error" in result) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        setType("closed");
      }
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 p-4">
      <div>
        <h2 className="font-semibold">Avvik og ferie</h2>
        <p className="text-sm text-gray-500">
          Stengte dager eller egne åpningstider for enkeltdatoer. Overstyrer
          den faste ukerytmen.
        </p>
      </div>

      <form ref={formRef} action={handleSubmit} className="space-y-3">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium">Dato</label>
            <input type="date" name="date" required className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium">Type</label>
            <select
              name="type"
              value={type}
              onChange={(e) =>
                setType(e.target.value as "closed" | "custom_hours")
              }
              className={inputClass}
            >
              <option value="closed">Stengt</option>
              <option value="custom_hours">Egne tider</option>
            </select>
          </div>
          {type === "custom_hours" && (
            <>
              <div className="space-y-1">
                <label className="block text-sm font-medium">Fra</label>
                <input
                  type="time"
                  name="startTime"
                  defaultValue="09:00"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium">Til</label>
                <input
                  type="time"
                  name="endTime"
                  defaultValue="16:00"
                  className={inputClass}
                />
              </div>
            </>
          )}
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {pending ? "Legger til…" : "Legg til avvik"}
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {exceptions.length === 0 ? (
          <p className="text-sm text-gray-500">Ingen avvik registrert.</p>
        ) : (
          exceptions.map((ex) => (
            <div
              key={ex.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <span>
                <span className="font-medium">{formatDate(ex.date)}</span>
                {" — "}
                {ex.type === "closed"
                  ? "Stengt"
                  : `Åpent ${ex.startTime?.slice(0, 5)}–${ex.endTime?.slice(
                      0,
                      5,
                    )}`}
              </span>
              <form
                action={deleteException}
                onSubmit={(e) => {
                  if (!confirm("Slette dette avviket?")) e.preventDefault();
                }}
              >
                <input type="hidden" name="id" value={ex.id} />
                <button
                  type="submit"
                  className="font-medium text-red-600 hover:text-red-700"
                >
                  Slett
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
