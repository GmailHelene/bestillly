import { formatInTimeZone } from "date-fns-tz";
import { nb } from "date-fns/locale";
import { TIMEZONE } from "@/lib/availability";

// Fullt tidspunkt i norsk tid, f.eks. "onsdag 20. mai 2026 kl. 09:00".
export function formatDateTime(date: Date): string {
  return formatInTimeZone(date, TIMEZONE, "EEEE d. MMMM yyyy 'kl.' HH:mm", {
    locale: nb,
  });
}

// Kort dato i norsk tid, f.eks. "20. mai 2026".
export function formatDateShort(date: Date): string {
  return formatInTimeZone(date, TIMEZONE, "d. MMMM yyyy", { locale: nb });
}

// Klokkeslett i norsk tid, f.eks. "09:00".
export function formatTime(date: Date): string {
  return formatInTimeZone(date, TIMEZONE, "HH:mm");
}

// Datonøkkel i norsk tid på formen "YYYY-MM-DD" — for gruppering i kalender.
export function formatDateKey(date: Date): string {
  return formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd");
}
