import { describe, it, expect } from "vitest";
import { auditSeo } from "@/lib/seo-audit";

describe("auditSeo", () => {
  it("en tom side gir lav score og minst ett alvorlig punkt", () => {
    const result = auditSeo({
      galleryCount: 0,
      serviceCount: 0,
      hasOpeningHours: false,
      publishedPostCount: 0,
      hasMarketingSeo: false,
    });
    expect(result.score).toBeLessThan(60);
    expect(result.items.some((i) => i.status === "fail")).toBe(true);
  });

  it("en godt utfylt side gir høy score", () => {
    const result = auditSeo({
      description: "x".repeat(120),
      address: "Eksempelgata 1, 3370 Vikersund",
      phone: "12345678",
      metaTitle: "x".repeat(45),
      metaDescription: "y".repeat(120),
      keywords: "frisør, vikersund",
      aboutText: "Om oss-tekst som forklarer bedriften.",
      logoUrl: "https://res.cloudinary.com/x/logo.jpg",
      galleryCount: 3,
      serviceCount: 5,
      hasOpeningHours: true,
      publishedPostCount: 2,
      hasMarketingSeo: true,
    });
    expect(result.score).toBeGreaterThan(85);
  });

  it("score er alltid mellom 0 og 100", () => {
    const result = auditSeo({
      galleryCount: 0,
      serviceCount: 0,
      hasOpeningHours: false,
      publishedPostCount: 0,
      hasMarketingSeo: false,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
