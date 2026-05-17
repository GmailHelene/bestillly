"use client";

import { useActionState } from "react";
import { saveWorkingHours } from "@/lib/actions/working-hours";

const WEEKDAYS = [
  [1, "Mandag"],
  [2, "Tirsdag"],
  [3, "Onsdag"],
  [4, "Torsdag"],
  [5, "Fredag"],
  [6, "Lørdag"],
  [7, "Søndag"],
] as const;

const timeClass =
  "rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-gray-900";

type Hour = { weekday: number; startTime: string; endTime: string };

export function WorkingHoursForm({ hours }: { hours: Hour[] }) {
  const [state, action, pending] = useActionState(saveWorkingHours, undefined);
  const byDay = new Map(hours.map((h) => [h.weekday, h]));

  return (
    <form
      action={action}
      className="space-y-3 rounded-xl border border-gray-200 p-4"
    >
      <div>
        <h2 className="font-semibold">Fast ukerytme</h2>
        <p className="text-sm text-gray-500">
          Huk av for dagene du har åpent, og sett klokkeslett.
        </p>
      </div>

      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state && "ok" in state && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Ukerytmen er lagret.
        </p>
      )}

      <div className="space-y-2">
        {WEEKDAYS.map(([n, label]) => {
          const h = byDay.get(n);
          return (
            <div key={n} className="flex items-center gap-3">
              <label className="flex w-32 items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name={`open-${n}`}
                  defaultChecked={!!h}
                />
                {label}
              </label>
              <input
                type="time"
                name={`start-${n}`}
                defaultValue={h ? h.startTime.slice(0, 5) : "09:00"}
                className={timeClass}
              />
              <span className="text-gray-400">–</span>
              <input
                type="time"
                name={`end-${n}`}
                defaultValue={h ? h.endTime.slice(0, 5) : "16:00"}
                className={timeClass}
              />
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "Lagrer…" : "Lagre ukerytme"}
      </button>
    </form>
  );
}
