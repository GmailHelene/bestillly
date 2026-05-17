"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { isDemoBusiness, requireBusinessId } from "@/lib/session";
import { DEMO_BLOCK_MESSAGE } from "@/lib/demo";
import {
  MARKETING_CHANNELS,
  parseMarketingProfile,
  type MarketingProfile,
} from "@/lib/marketing";
import { crawlWebsite, type WebsiteCrawl } from "@/lib/crawler";

export type MarketingProfileState =
  | { error: string }
  | { ok: true }
  | undefined;

export async function updateMarketingProfile(
  _prev: MarketingProfileState,
  formData: FormData,
): Promise<MarketingProfileState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };

  const existing = parseMarketingProfile(
    (
      await db.query.businesses.findFirst({
        where: eq(businesses.id, businessId),
      })
    )?.marketingProfile,
  );

  const audience = String(formData.get("audience") ?? "").trim();
  const tone = String(formData.get("tone") ?? "").trim();
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim();
  const budgetRaw = Number(formData.get("budgetNok"));
  const budgetNok =
    Number.isFinite(budgetRaw) && budgetRaw > 0
      ? Math.round(budgetRaw)
      : undefined;
  const channels = MARKETING_CHANNELS.map((c) => c.id).filter(
    (id) => formData.get(`channel-${id}`) != null,
  );

  // Behold tidligere crawl, men kast den hvis nettadressen er endret.
  const keepCrawl =
    existing.websiteCrawl &&
    existing.websiteUrl === (websiteUrl || undefined)
      ? existing.websiteCrawl
      : undefined;

  const marketingProfile: MarketingProfile = {
    audience: audience || undefined,
    tone: tone || undefined,
    budgetNok,
    websiteUrl: websiteUrl || undefined,
    channels,
    websiteCrawl: keepCrawl,
  };

  await db
    .update(businesses)
    .set({ marketingProfile })
    .where(eq(businesses.id, businessId));
  revalidatePath("/admin/markedsforing");
  return { ok: true };
}

export type CrawlState =
  | { error: string }
  | { ok: true; crawl: WebsiteCrawl }
  | undefined;

// Crawler bedriftens egen nettside og lagrer sammendraget i profilen.
export async function crawlWebsiteAction(): Promise<CrawlState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });
  const profile = parseMarketingProfile(business?.marketingProfile);
  if (!profile.websiteUrl) {
    return { error: "Legg til nettsiden din i profilen først." };
  }

  const result = await crawlWebsite(profile.websiteUrl);
  if (!result.ok) return { error: result.error };

  const marketingProfile: MarketingProfile = {
    ...profile,
    websiteCrawl: result.crawl,
  };
  await db
    .update(businesses)
    .set({ marketingProfile })
    .where(eq(businesses.id, businessId));
  revalidatePath("/admin/markedsforing");
  return { ok: true, crawl: result.crawl };
}
