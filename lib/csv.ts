// Bygger semikolon-separert CSV (norsk Excel-konvensjon) med UTF-8 BOM, så
// norske tegn vises riktig. Ren funksjon — enkel å teste.

function csvCell(value: string | number): string {
  const s = String(value);
  if (/[";\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(
  headers: string[],
  rows: (string | number)[][],
): string {
  const lines = [headers, ...rows].map((row) =>
    row.map(csvCell).join(";"),
  );
  return "﻿" + lines.join("\r\n");
}
