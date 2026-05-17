import "server-only";
import { and, eq, sql } from "drizzle-orm";
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

// Trekker kreditter før en AI-handling. Selve trekket gjøres som ÉN atomisk
// UPDATE med tak-sjekk i WHERE — så samtidige kall ikke kan overskride potten.
// Nullstiller begge tellere hvis måneden er ny.
export async function consumeCredits(
  businessId: string,
  kind: "text" | "image",
  amount: number,
): Promise<ConsumeResult> {
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });
  if (!business) return { ok: false, error: "Fant ikke bedriften." };
  if (business.status === "paused") {
    return {
      ok: false,
      error:
        "Kontoen er satt på pause grunnet manglende betaling. AI-verktøyene er utilgjengelige til fakturaen er betalt.",
    };
  }

  const period = currentPeriod();
  // Telleverdi i denne perioden — 0 hvis lagret periode er utdatert.
  const textNow = sql`(CASE WHEN ${businesses.aiPeriod} = ${period} THEN ${businesses.aiTextUsed} ELSE 0 END)`;
  const imagesNow = sql`(CASE WHEN ${businesses.aiPeriod} = ${period} THEN ${businesses.aiImagesUsed} ELSE 0 END)`;

  const rows =
    kind === "text"
      ? await db
          .update(businesses)
          .set({
            aiPeriod: period,
            aiTextUsed: sql`${textNow} + ${amount}`,
            aiImagesUsed: imagesNow,
          })
          .where(
            and(
              eq(businesses.id, businessId),
              sql`${textNow} + ${amount} <= ${MONTHLY_TEXT_CREDITS}`,
            ),
          )
          .returning({ id: businesses.id })
      : await db
          .update(businesses)
          .set({
            aiPeriod: period,
            aiTextUsed: textNow,
            aiImagesUsed: sql`${imagesNow} + ${amount}`,
          })
          .where(
            and(
              eq(businesses.id, businessId),
              sql`${imagesNow} + ${amount} <= ${MONTHLY_IMAGE_CREDITS}`,
            ),
          )
          .returning({ id: businesses.id });

  if (rows.length === 0) {
    return {
      ok: false,
      error:
        kind === "text"
          ? `Du har brukt opp månedens AI-kreditter (${MONTHLY_TEXT_CREDITS}). De fornyes ved månedsskiftet.`
          : `Du har brukt opp månedens bildekvote (${MONTHLY_IMAGE_CREDITS}). Den fornyes ved månedsskiftet.`,
    };
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
  const period = currentPeriod();
  const column = kind === "text" ? businesses.aiTextUsed : businesses.aiImagesUsed;
  await db
    .update(businesses)
    .set(
      kind === "text"
        ? { aiTextUsed: sql`GREATEST(0, ${column} - ${amount})` }
        : { aiImagesUsed: sql`GREATEST(0, ${column} - ${amount})` },
    )
    .where(
      and(eq(businesses.id, businessId), eq(businesses.aiPeriod, period)),
    );
}
