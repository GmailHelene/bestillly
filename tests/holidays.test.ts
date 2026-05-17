import { describe, it, expect } from "vitest";
import { isNorwegianHoliday, norwegianHolidays } from "@/lib/holidays";

describe("norske helligdager", () => {
  it("inkluderer faste helligdager", () => {
    expect(isNorwegianHoliday("2026-01-01")).toBe(true);
    expect(isNorwegianHoliday("2026-05-01")).toBe(true);
    expect(isNorwegianHoliday("2026-05-17")).toBe(true);
    expect(isNorwegianHoliday("2026-12-25")).toBe(true);
    expect(isNorwegianHoliday("2026-12-26")).toBe(true);
  });

  it("vanlige hverdager er ikke helligdager", () => {
    expect(isNorwegianHoliday("2026-08-15")).toBe(false);
    expect(isNorwegianHoliday("2026-06-10")).toBe(false);
  });

  it("inkluderer de bevegelige påskedagene (påske 2026)", () => {
    const h = norwegianHolidays(2026);
    expect(h.has("2026-04-02")).toBe(true); // skjærtorsdag
    expect(h.has("2026-04-03")).toBe(true); // langfredag
    expect(h.has("2026-04-05")).toBe(true); // 1. påskedag
    expect(h.has("2026-04-06")).toBe(true); // 2. påskedag
  });

  it("har 12 helligdager i året", () => {
    expect(norwegianHolidays(2026).size).toBe(12);
  });
});
