import { describe, it, expect } from "vitest";
import {
  computeAvailableSlots,
  isoWeekday,
  slotInstant,
  type WorkingHour,
} from "@/lib/availability";

const allDays: WorkingHour[] = [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({
  weekday,
  startTime: "09:00",
  endTime: "12:00",
}));
const farPast = new Date("2000-01-01T00:00:00Z");

describe("isoWeekday", () => {
  it("mandag = 1, søndag = 7", () => {
    expect(isoWeekday("2026-05-18")).toBe(1); // mandag
    expect(isoWeekday("2026-05-17")).toBe(7); // søndag
  });
});

describe("computeAvailableSlots", () => {
  it("genererer slots innenfor åpningstiden", () => {
    const slots = computeAvailableSlots({
      date: "2099-08-15",
      durationMinutes: 60,
      workingHours: allDays,
      exceptions: [],
      bookings: [],
      now: farPast,
    });
    expect(slots[0]).toBe("09:00");
    expect(slots).toContain("11:00");
    expect(slots).not.toContain("11:15"); // 11:15 + 60 min > 12:00
  });

  it("ekskluderer slots som overlapper en booking", () => {
    const start = slotInstant("2099-08-15", "09:00");
    const slots = computeAvailableSlots({
      date: "2099-08-15",
      durationMinutes: 60,
      workingHours: allDays,
      exceptions: [],
      bookings: [
        { startsAt: start, endsAt: new Date(start.getTime() + 3_600_000) },
      ],
      now: farPast,
    });
    expect(slots).not.toContain("09:00");
    expect(slots).toContain("10:00");
  });

  it("ekskluderer slots i fortiden", () => {
    const slots = computeAvailableSlots({
      date: "2099-08-15",
      durationMinutes: 60,
      workingHours: allDays,
      exceptions: [],
      bookings: [],
      now: slotInstant("2099-08-15", "10:00"),
    });
    expect(slots).not.toContain("09:00");
    expect(slots).toContain("10:00");
  });

  it("stenger på lukket-avvik", () => {
    const slots = computeAvailableSlots({
      date: "2099-08-15",
      durationMinutes: 60,
      workingHours: allDays,
      exceptions: [
        { date: "2099-08-15", type: "closed", startTime: null, endTime: null },
      ],
      bookings: [],
      now: farPast,
    });
    expect(slots).toEqual([]);
  });

  it("bruker custom_hours-avvik over fast ukerytme", () => {
    const slots = computeAvailableSlots({
      date: "2099-08-15",
      durationMinutes: 60,
      workingHours: allDays,
      exceptions: [
        {
          date: "2099-08-15",
          type: "custom_hours",
          startTime: "13:00",
          endTime: "15:00",
        },
      ],
      bookings: [],
      now: farPast,
    });
    expect(slots).toContain("13:00");
    expect(slots).not.toContain("09:00");
  });

  it("stenger automatisk på norske helligdager", () => {
    const slots = computeAvailableSlots({
      date: "2026-12-25", // 1. juledag
      durationMinutes: 60,
      workingHours: allDays,
      exceptions: [],
      bookings: [],
      now: farPast,
    });
    expect(slots).toEqual([]);
  });

  it("lar bedriften åpne en helligdag med eksplisitt avvik", () => {
    const slots = computeAvailableSlots({
      date: "2026-12-25",
      durationMinutes: 60,
      workingHours: allDays,
      exceptions: [
        {
          date: "2026-12-25",
          type: "custom_hours",
          startTime: "10:00",
          endTime: "12:00",
        },
      ],
      bookings: [],
      now: farPast,
    });
    expect(slots).toContain("10:00");
  });
});
