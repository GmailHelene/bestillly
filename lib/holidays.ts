// Norske offentlige helligdager («røde dager»). Brukes til å sperre booking
// automatisk — bedriften kan likevel åpne en helligdag med et eksplisitt
// åpningstid-avvik.

function ymd(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 86_400_000);
}

// 1. påskedag for et gitt år (anonym gregoriansk algoritme / computus).
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = mars, 4 = april
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

const cache = new Map<number, Set<string>>();

// Alle norske helligdager for et år, som «YYYY-MM-DD»-sett.
export function norwegianHolidays(year: number): Set<string> {
  const cached = cache.get(year);
  if (cached) return cached;

  const easter = easterSunday(year);
  const days = new Set<string>([
    `${year}-01-01`, // Første nyttårsdag
    `${year}-05-01`, // Arbeidernes dag
    `${year}-05-17`, // Grunnlovsdagen
    `${year}-12-25`, // Første juledag
    `${year}-12-26`, // Andre juledag
    ymd(addDays(easter, -3)), // Skjærtorsdag
    ymd(addDays(easter, -2)), // Langfredag
    ymd(easter), // Første påskedag
    ymd(addDays(easter, 1)), // Andre påskedag
    ymd(addDays(easter, 39)), // Kristi himmelfartsdag
    ymd(addDays(easter, 49)), // Første pinsedag
    ymd(addDays(easter, 50)), // Andre pinsedag
  ]);
  cache.set(year, days);
  return days;
}

// Er datoen («YYYY-MM-DD») en norsk helligdag?
export function isNorwegianHoliday(date: string): boolean {
  const year = Number(date.slice(0, 4));
  if (!Number.isInteger(year)) return false;
  return norwegianHolidays(year).has(date);
}
