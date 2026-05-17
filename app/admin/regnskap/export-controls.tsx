"use client";

import { useRouter } from "next/navigation";

export type ExportRow = {
  date: string;
  type: string;
  reference: string;
  description: string;
  customer: string;
  amountNok: number;
};

function csvCell(value: string | number): string {
  const s = String(value);
  // Semikolon-separert (norsk Excel-konvensjon). Siter felt med spesialtegn.
  if (/[";\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(month: string, rows: ExportRow[]) {
  const header = ["Dato", "Type", "Referanse", "Beskrivelse", "Kunde", "Beløp"];
  const lines = [
    header.join(";"),
    ...rows.map((r) =>
      [r.date, r.type, r.reference, r.description, r.customer, r.amountNok]
        .map(csvCell)
        .join(";"),
    ),
  ];
  // BOM så norske tegn vises riktig i Excel.
  const csv = "﻿" + lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `regnskap-${month}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportControls({
  month,
  monthLabel,
  monthOptions,
  rows,
}: {
  month: string;
  monthLabel: string;
  monthOptions: { value: string; label: string }[];
  rows: ExportRow[];
}) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 p-4">
      <div className="space-y-1">
        <label htmlFor="maned" className="text-sm font-medium">
          Måned
        </label>
        <select
          id="maned"
          value={month}
          onChange={(e) =>
            router.push(`/admin/regnskap?maned=${e.target.value}`)
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
        >
          {monthOptions.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={() => downloadCsv(month, rows)}
        disabled={rows.length === 0}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        Last ned CSV for {monthLabel}
      </button>
    </div>
  );
}
