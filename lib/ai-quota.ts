import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses } from "@/db/schema";

// F3.10 — AI-kreditter. Hver bedrift har en månedlig pott inkludert i
// årsprisen. Tekst og bilder telles separat. Potten nullstilles automatisk
// ved månedsskifte.

export const MONTHLY_TEXT_CREDITS = 100;
export const MONTHLY_IMAGE_CREDITS = 40;

// Hva hver handling koster i tekst-kreditter.
export const TEXT_COST = {
  seo: 5,
  analysis: 5,
  blog: 3,
  snippet: 2,
  plan: 5,
  contentPerPost: 1,
} as const;

function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

export type UsageSummary = {
  textUsed: number;
  textLimit: number;
  imagesUsed: number;
  imageLimit: number;
};

type UsageRow = {
  aiPeriod: string | null;
  aiTextUsed: number;
  aiImagesUsed: number;
};

// Leser av forbruket for visning — nullstiller ikke (gjøres ved neste trekk).
export function readUsage(b: UsageRow): UsageSummary {
  const stale = b.aiPeriod !== currentPeriod();
  return {
    textUsed: stale ? 0 : b.aiTextUsed,
    textLimit: MONTHLY_TEXT_CREDITS,
    imagesUsed: stale ? 0 : b.aiImagesUsed,
    imageLimit: MONTHLY_IMAGE_CREDITS,
  };
}

export type ConsumeResult = { ok: true } | { ok: false; error: string };

// Trekker kreditter før en AI-handling. Nullstiller potten hvis måneden er ny.
export async function consumeCredits(
  businessId: string,
  kind: "text" | "image",
  amount: number,
): Promise<ConsumeResult> {
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });
  if (!business) return { ok: false, error: "Fant ikke bedriften." };

  const period = currentPeriod();
  const stale = business.aiPeriod !== period;
  const textUsed = stale ? 0 : business.aiTextUsed;
  const imagesUsed = stale ? 0 : business.aiImagesUsed;

  if (kind === "text") {
    if (textUsed + amount > MONTHLY_TEXT_CREDITS) {
      return {
        ok: false,
        error: `Du har brukt opp månedens AI-kreditter (${MONTHLY_TEXT_CREDITS}). De fornyes ved månedsskiftet.`,
      };
    }
    await db
      .update(businesses)
      .set({
        aiPeriod: period,
        aiTextUsed: textUsed + amount,
        aiImagesUsed: imagesUsed,
      })
      .where(eq(businesses.id, businessId));
  } else {
    if (imagesUsed + amount > MONTHLY_IMAGE_CREDITS) {
      return {
        ok: false,
        error: `Du har brukt opp månedens bildekvote (${MONTHLY_IMAGE_CREDITS}). Den fornyes ved månedsskiftet.`,
      };
    }
    await db
      .update(businesses)
      .set({
        aiPeriod: period,
        aiTextUsed: textUsed,
        aiImagesUsed: imagesUsed + amount,
      })
      .where(eq(businesses.id, businessId));
  }
  return { ok: true };
}

// Refunderer kreditter hvis en handling feilet etter at de ble trukket.
export async function refundCredits(
  businessId: string,
  kind: "text" | "image",
  amount: number,
): Promise<void> {
  if (amount <= 0) return;
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });
  if (!business || business.aiPeriod !== currentPeriod()) return;

  if (kind === "text") {
    await db
      .update(businesses)
      .set({ aiTextUsed: Math.max(0, business.aiTextUsed - amount) })
      .where(eq(businesses.id, businessId));
  } else {
    await db
      .update(businesses)
      .set({ aiImagesUsed: Math.max(0, business.aiImagesUsed - amount) })
      .where(eq(businesses.id, businessId));
  }
}
