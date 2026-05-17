import { describe, it, expect } from "vitest";
import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("bygger semikolon-separert CSV med BOM", () => {
    const csv = toCsv(["A", "B"], [["1", "2"]]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain("A;B");
    expect(csv).toContain("1;2");
  });

  it("siterer felt som inneholder semikolon", () => {
    const csv = toCsv(["X"], [["a;b"]]);
    expect(csv).toContain('"a;b"');
  });

  it("dobler anførselstegn inne i felt", () => {
    const csv = toCsv(["X"], [['si "hei"']]);
    expect(csv).toContain('"si ""hei"""');
  });

  it("håndterer tall", () => {
    const csv = toCsv(["Beløp"], [[2490]]);
    expect(csv).toContain("2490");
  });
});
