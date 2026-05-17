import { fromZonedTime } from "date-fns-tz";

export const TIMEZONE = "Europe/Oslo";
const SLOT_STEP_MINUTES = 15;

export type WorkingHour = {
  weekday: number; // 1 = mandag ... 7 = søndag
  startTime: string;
  endTime: string;
};

export type Exception = {
  date: string; // YYYY-MM-DD
  type: "closed" | "custom_hours";
  startTime: string | null;
  endTime: string | null;
};

export type BookingInterval = {
  startsAt: Date;
  endsAt: Date;
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ISO-ukedag (1 = mandag ... 7 = søndag) for en YYYY-MM-DD-dato.
export function isoWeekday(date: string): number {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay(); // 0 = søndag
  return ((day + 6) % 7) + 1;
}

// Et lokalt klokkeslett på en dato i norsk tid, som et absolutt tidspunkt.
function osloInstant(date: string, time: string): Date {
  return fromZonedTime(`${date}T${time}:00`, TIMEZONE);
}

// Finner åpningsintervallet for en dato: avvik overstyrer den faste ukerytmen.
function openInterval(
  date: string,
  workingHours: WorkingHour[],
  exceptions: Exception[],
): { start: string; end: string } | null {
  const exception = exceptions.find((e) => e.date === date);
  if (exception) {
    if (exception.type === "closed") return null;
    if (exception.startTime && exception.endTime) {
      return { start: exception.startTime, end: exception.endTime };
    }
    return null;
  }
  const wh = workingHours.find((w) => w.weekday === isoWeekday(date));
  if (!wh) return null;
  return { start: wh.startTime, end: wh.endTime };
}

// Beregner ledige starttider ("HH:MM") for en behandling på en gitt dato.
export function computeAvailableSlots(params: {
  date: string;
  durationMinutes: number;
  workingHours: WorkingHour[];
  exceptions: Exception[];
  bookings: BookingInterval[];
  now: Date;
}): string[] {
  const { date, durationMinutes, workingHours, exceptions, bookings, now } =
    params;

  const interval = openInterval(date, workingHours, exceptions);
  if (!interval) return [];

  const startMinutes = timeToMinutes(interval.start);
  const endMinutes = timeToMinutes(interval.end);
  const slots: string[] = [];

  for (
    let minute = startMinutes;
    minute + durationMinutes <= endMinutes;
    minute += SLOT_STEP_MINUTES
  ) {
    const slotTime = minutesToTime(minute);
    const slotStart = osloInstant(date, slotTime);
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60_000);

    if (slotStart < now) continue;

    const overlaps = bookings.some(
      (b) => slotStart < b.endsAt && slotEnd > b.startsAt,
    );
    if (overlaps) continue;

    slots.push(slotTime);
  }

  return slots;
}

// Start- og slutt-tidspunkt (absolutt) for en bookingdag i norsk tid.
export function dayBounds(date: string): { start: Date; end: Date } {
  const start = osloInstant(date, "00:00");
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

// Absolutt tidspunkt for en valgt slot — brukes når en booking skal lagres.
export function slotInstant(date: string, time: string): Date {
  return osloInstant(date, time);
}
