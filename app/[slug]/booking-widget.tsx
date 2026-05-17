"use client";

import { useEffect, useState, useTransition } from "react";
import { Calendar } from "@/components/calendar";
import { getSlots } from "@/lib/actions/availability";
import { createBooking } from "@/lib/actions/bookings";

const controlClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
};

function todayInOslo(): string {
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [loadingSlots, startSlotsTransition] = useTransition();

  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, startSubmit] = useTransition();
  const [confirmed, setConfirmed] = useState<{
    service: string;
    date: string;
    time: string;
  } | null>(null);

  useEffect(() => {
    setSelectedTime(null);
  }, [serviceId, date]);

  useEffect(() => {
    if (!serviceId || !date) {
      setSlots(null);
      return;
    }
    let cancelled = false;
    startSlotsTransition(async () => {
      const result = await getSlots(slug, serviceId, date);
      if (!cancelled) setSlots(result);
    });
    return () => {
      cancelled = true;
    };
  }, [slug, serviceId, date, refreshKey]);

  function handleBookingSubmit(formData: FormData) {
    setError(null);
    const time = selectedTime;
    if (!time) return;
    startSubmit(async () => {
      const result = await createBooking({
        slug,
        serviceId,
        date,
        time,
        customerName: String(formData.get("customerName") ?? ""),
        customerEmail: String(formData.get("customerEmail") ?? ""),
        customerPhone: String(formData.get("customerPhone") ?? ""),
      });
      if ("error" in result) {
        setError(result.error);
        setRefreshKey((k) => k + 1);
      } else {
        setConfirmed({
          service: services.find((s) => s.id === serviceId)?.name ?? "",
          date,
          time,
        });
        setSelectedTime(null);
      }
    });
  }

  if (services.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Ingen behandlinger er tilgjengelige for booking ennå.
      </p>
    );
  }

  if (confirmed) {
    return (
      <div className="space-y-3 rounded-lg bg-green-50 p-4">
        <p className="font-medium text-green-800">Timen din er booket!</p>
        <p className="text-sm text-green-800">
          {confirmed.service} — {confirmed.date} kl. {confirmed.time}
        </p>
        <p className="text-sm text-gray-600">
          Du får en bekreftelse på e-post.
        </p>
        <button
          type="button"
          onClick={() => {
            setConfirmed(null);
            setRefreshKey((k) => k + 1);
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          Book en ny time
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
        <p className="text-sm font-medium">Dato</p>
        <Calendar value={date} min={todayInOslo()} onChange={setDate} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Velg en ledig tid</p>
        {loadingSlots ? (
          <p className="text-sm text-gray-500">Laster ledige tider…</p>
        ) : slots === null ? null : slots.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
            Ingen ledige tider denne dagen. Prøv en annen dato.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setSelectedTime(time)}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  selectedTime === time
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 hover:border-gray-900"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedTime && (
        <form
          action={handleBookingSubmit}
          className="space-y-3 rounded-lg border border-gray-200 p-4"
        >
          <p className="text-sm font-medium">
            Bestill {selectedTime} — {date}
          </p>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="space-y-1">
            <label htmlFor="customerName" className="text-sm font-medium">
              Navn
            </label>
            <input
              id="customerName"
              name="customerName"
              type="text"
              required
              className={controlClass}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="customerEmail" className="text-sm font-medium">
                E-post
              </label>
              <input
                id="customerEmail"
                name="customerEmail"
                type="email"
                required
                className={controlClass}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="customerPhone" className="text-sm font-medium">
                Telefon
              </label>
              <input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                required
                className={controlClass}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Ved å bestille godtar du at bedriften lagrer kontaktinfoen din for
            å håndtere timen. Avbestilling må skje senest 24 timer før avtalt
            tid — timer som avbestilles senere, eller ikke benyttes,
            faktureres med full pris.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {submitting ? "Bestiller…" : "Bekreft booking"}
            </button>
            <button
              type="button"
              onClick={() => setSelectedTime(null)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Avbryt
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
