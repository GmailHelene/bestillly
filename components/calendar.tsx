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

function ymd(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function Calendar({
  value,
  min,
  onChange,
}: {
  value: string;
  min: string;
  onChange: (date: string) => void;
}) {
  const [viewYear, setViewYear] = useState(() => Number(value.slice(0, 4)));
  const [viewMonth, setViewMonth] = useState(
    () => Number(value.slice(5, 7)) - 1,
  );

  const minYear = Number(min.slice(0, 4));
  const minMonth = Number(min.slice(5, 7)) - 1;
  const atMinMonth =
    viewYear < minYear || (viewYear === minYear && viewMonth <= minMonth);

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
    <div className="rounded-lg border border-gray-300 p-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          disabled={atMinMonth}
          aria-label="Forrige måned"
          className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent"
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

      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <span key={`empty-${i}`} />;
          const dateStr = ymd(viewYear, viewMonth, day);
          const disabled = dateStr < min;
          const selected = dateStr === value;
          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              onClick={() => onChange(dateStr)}
              className={`h-9 rounded-md text-sm ${
                selected
                  ? "bg-gray-900 font-medium text-white"
                  : disabled
                    ? "text-gray-300"
                    : "hover:bg-gray-100"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
