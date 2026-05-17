import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import {
  consumeCredits,
  refundCredits,
  MONTHLY_TEXT_CREDITS,
} from "@/lib/ai-quota";

// Integrasjonstest mot test-databasen (TEST_DATABASE_URL).
let businessId: string;

beforeAll(async () => {
  const [b] = await db
    .insert(businesses)
    .values({
      slug: `itest-quota-${randomUUID()}`,
      name: "Integrasjonstest",
      email: "itest@example.com",
    })
    .returning();
  businessId = b.id;
});

afterAll(async () => {
  await db.delete(businesses).where(eq(businesses.id, businessId));
});

describe("AI-kvote (integrasjon)", () => {
  it("trekker kreditter, blokkerer over taket og refunderer", async () => {
    const limit = MONTHLY_TEXT_CREDITS;

    // Bruk nesten hele potten.
    expect((await consumeCredits(businessId, "text", limit - 10)).ok).toBe(
      true,
    );
    // Et trekk som ville sprengt taket skal avvises.
    expect((await consumeCredits(businessId, "text", 20)).ok).toBe(false);
    // Et trekk som akkurat fyller potten skal gå gjennom.
    expect((await consumeCredits(businessId, "text", 10)).ok).toBe(true);
    // Potten er nå tom — alt videre avvises.
    expect((await consumeCredits(businessId, "text", 1)).ok).toBe(false);
    // Refusjon frigjør kreditter igjen.
    await refundCredits(businessId, "text", 5);
    expect((await consumeCredits(businessId, "text", 5)).ok).toBe(true);
    expect((await consumeCredits(businessId, "text", 1)).ok).toBe(false);
  });

  it("teller bilder separat fra tekst", async () => {
    expect((await consumeCredits(businessId, "image", 1)).ok).toBe(true);
  });
});
