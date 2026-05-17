"use client";

import { useEffect, useState, useTransition } from "react";
import { getSlots } from "@/lib/actions/availability";

const controlClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
};

function todayInOslo(): string {
  // sv-SE gir YYYY-MM-DD-format
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Oslo",
  }).format(new Date());
}

export function BookingWidget({
  slug,
  services,
}: {
  slug: string;
  services: Service[];
}) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(todayInOslo());
  const [slots, setSlots] = useState<string[] | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!serviceId || !date) {
      setSlots(null);
      return;
    }
    startTransition(async () => {
      const result = await getSlots(slug, serviceId, date);
      setSlots(result);
    });
  }, [slug, serviceId, date]);

  if (services.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Ingen behandlinger er tilgjengelige for booking ennå.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="service" className="text-sm font-medium">
            Behandling
          </label>
          <select
            id="service"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className={controlClass}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.durationMinutes} min)
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="date" className="text-sm font-medium">
            Dato
          </label>
          <input
            id="date"
            type="date"
            value={date}
            min={todayInOslo()}
            onChange={(e) => setDate(e.target.value)}
            className={controlClass}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Ledige tider</p>
        {pending ? (
          <p className="text-sm text-gray-500">Laster ledige tider…</p>
        ) : slots === null ? null : slots.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
            Ingen ledige tider denne dagen. Prøv en annen dato.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((time) => (
              <span
                key={time}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
              >
                {time}
              </span>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Selve bookingen (valg av tid + bekreftelse) aktiveres i steg 6.
      </p>
    </div>
  );
}
