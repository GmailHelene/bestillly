"use client";

import { useState } from "react";

const MONTHS = [
  "januar",
  "februar",
  "mars",
  "april",
  "mai",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "desember",
];
const WEEKDAYS = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export type CalendarBooking = {
  dateKey: string; // YYYY-MM-DD
  time: string; // HH:MM
  serviceName: string;
  customerName: string;
  cancelled: boolean;
};

export function BookingsCalendar({
  bookings,
  initialMonth,
}: {
  bookings: CalendarBooking[];
  initialMonth: string; // YYYY-MM
}) {
  const [viewYear, setViewYear] = useState(Number(initialMonth.slice(0, 4)));
  const [viewMonth, setViewMonth] = useState(
    Number(initialMonth.slice(5, 7)) - 1,
  );

  const byDay = new Map<string, CalendarBooking[]>();
  for (const b of bookings) {
    const arr = byDay.get(b.dateKey) ?? [];
    arr.push(b);
    byDay.set(b.dateKey, arr);
  }
  for (const arr of byDay.values()) {
    arr.sort((a, b) => a.time.localeCompare(b.time));
  }

  const firstWeekday =
    (new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(
    Date.UTC(viewYear, viewMonth + 1, 0),
  ).getUTCDate();

  function changeMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewYear(y);
    setViewMonth(m);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          aria-label="Forrige måned"
          className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100"
        >
          ‹
        </button>
        <span className="text-sm font-medium">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          aria-label="Neste måned"
          className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100"
        >
          ›
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const key = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
          const dayBookings = byDay.get(key) ?? [];
          return (
            <div
              key={key}
              className="min-h-24 rounded-md border border-gray-100 p-1"
            >
              <div className="text-right text-xs text-gray-400">{day}</div>
              <div className="mt-0.5 space-y-0.5">
                {dayBookings.map((b, idx) => (
                  <div
                    key={idx}
                    title={`${b.time} ${b.serviceName} — ${b.customerName}`}
                    className={`truncate rounded px-1 py-0.5 text-[11px] leading-tight ${
                      b.cancelled
                        ? "bg-gray-100 text-gray-400 line-through"
                        : "bg-gray-900 text-white"
                    }`}
                  >
                    {b.time} {b.serviceName}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
