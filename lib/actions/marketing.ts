"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { businesses, products, services } from "@/db/schema";
import { isDemoBusiness, requireBusinessId } from "@/lib/session";
import { DEMO_BLOCK_MESSAGE } from "@/lib/demo";
import {
  MARKETING_CHANNELS,
  parseMarketingProfile,
  type MarketingProfile,
} from "@/lib/marketing";
import { crawlWebsite, type WebsiteCrawl } from "@/lib/crawler";
import { hasAnthropicKey } from "@/lib/anthropic";
import { generateSeo, type SeoResult } from "@/lib/marketing-seo";
import {
  generateAnalysis,
  type MarketAnalysis,
} from "@/lib/marketing-analysis";
import {
  generatePost,
  type GeneratedPost,
} from "@/lib/marketing-content";
import { CHANNEL_STRATEGIES, type ChannelId } from "@/lib/marketing-platforms";

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
    seo: existing.seo,
    analysis: existing.analysis,
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

export type SeoState =
  | { error: string }
  | { ok: true; seo: SeoResult }
  | undefined;

// F3.3 — genererer SEO-anbefaling med Claude og lagrer den i profilen.
export async function generateSeoAction(): Promise<SeoState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };
  if (!hasAnthropicKey()) {
    return { error: "AI-tjenesten er ikke konfigurert ennå." };
  }

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });
  if (!business) return { error: "Fant ikke bedriften." };
  const profile = parseMarketingProfile(business.marketingProfile);

  const serviceList = await db.query.services.findMany({
    where: eq(services.businessId, businessId),
  });
  const productList = await db.query.products.findMany({
    where: eq(products.businessId, businessId),
  });

  try {
    const { result } = await generateSeo({
      businessName: business.name,
      description: business.description ?? undefined,
      address: business.address ?? undefined,
      services: serviceList.map((s) => s.name),
      products: productList.map((p) => p.name),
      audience: profile.audience,
      tone: profile.tone,
      websiteTitle: profile.websiteCrawl?.title,
      websiteDescription: profile.websiteCrawl?.description,
      websiteKeywords: profile.websiteCrawl?.keywords,
      websiteText: profile.websiteCrawl?.text,
    });

    const marketingProfile: MarketingProfile = { ...profile, seo: result };
    await db
      .update(businesses)
      .set({ marketingProfile })
      .where(eq(businesses.id, businessId));
    revalidatePath("/admin/markedsforing");
    return { ok: true, seo: result };
  } catch {
    return {
      error:
        "Klarte ikke å lage SEO-anbefalingen akkurat nå. Prøv igjen om litt.",
    };
  }
}

export type AnalysisState =
  | { error: string }
  | { ok: true; analysis: MarketAnalysis }
  | undefined;

// F3.4 — genererer markedsanalyse med Claude og lagrer den i profilen.
export async function generateAnalysisAction(): Promise<AnalysisState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };
  if (!hasAnthropicKey()) {
    return { error: "AI-tjenesten er ikke konfigurert ennå." };
  }

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });
  if (!business) return { error: "Fant ikke bedriften." };
  const profile = parseMarketingProfile(business.marketingProfile);

  const serviceList = await db.query.services.findMany({
    where: eq(services.businessId, businessId),
  });
  const productList = await db.query.products.findMany({
    where: eq(products.businessId, businessId),
  });

  try {
    const { result } = await generateAnalysis({
      businessName: business.name,
      description: business.description ?? undefined,
      address: business.address ?? undefined,
      services: serviceList.map((s) => s.name),
      products: productList.map((p) => p.name),
      audience: profile.audience,
      tone: profile.tone,
      budgetNok: profile.budgetNok,
      channels: profile.channels ?? [],
      seoSummary: profile.seo?.summary,
      seoKeywords: profile.seo?.keywords,
    });

    const marketingProfile: MarketingProfile = {
      ...profile,
      analysis: result,
    };
    await db
      .update(businesses)
      .set({ marketingProfile })
      .where(eq(businesses.id, businessId));
    revalidatePath("/admin/markedsforing");
    return { ok: true, analysis: result };
  } catch {
    return {
      error:
        "Klarte ikke å lage markedsanalysen akkurat nå. Prøv igjen om litt.",
    };
  }
}

export type ContentState =
  | { error: string }
  | { ok: true; posts: GeneratedPost[]; failedChannels: string[] }
  | undefined;

// F3.5 — genererer ett innlegg per valgt kanal, tilpasset hver kanal.
export async function generateContentAction(
  topic: string,
  channelIds: string[],
): Promise<ContentState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };
  if (!hasAnthropicKey()) {
    return { error: "AI-tjenesten er ikke konfigurert ennå." };
  }

  const cleanTopic = topic.trim();
  if (cleanTopic.length < 3) {
    return { error: "Skriv inn et tema for innholdet." };
  }
  const channels = channelIds.filter(
    (id): id is ChannelId => id in CHANNEL_STRATEGIES,
  );
  if (channels.length === 0) {
    return { error: "Velg minst én kanal." };
  }

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });
  if (!business) return { error: "Fant ikke bedriften." };
  const profile = parseMarketingProfile(business.marketingProfile);

  const input = {
    businessName: business.name,
    description: business.description ?? undefined,
    audience: profile.audience,
    tone: profile.tone,
    topic: cleanTopic,
    seoKeywords: profile.seo?.keywords,
  };

  const posts: GeneratedPost[] = [];
  const failedChannels: string[] = [];
  for (const channelId of channels) {
    try {
      const { post } = await generatePost(channelId, input);
      posts.push(post);
    } catch {
      failedChannels.push(CHANNEL_STRATEGIES[channelId].name);
    }
  }

  if (posts.length === 0) {
    return {
      error: "Klarte ikke å lage innhold akkurat nå. Prøv igjen om litt.",
    };
  }
  return { ok: true, posts, failedChannels };
}
