"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { businesses, posts, products, services } from "@/db/schema";
import { slugify } from "@/lib/slug";
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
import { generateImage, hasReplicateToken } from "@/lib/replicate";
import { hasCloudinary, uploadImageFromUrl } from "@/lib/cloudinary";
import { generatePlan, type PostingPlan } from "@/lib/marketing-plan";
import {
  generateBlogPost,
  type GeneratedBlogPost,
} from "@/lib/marketing-blog";

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
    postingPlan: existing.postingPlan,
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bestilly.no";
  const input = {
    businessName: business.name,
    description: business.description ?? undefined,
    audience: profile.audience,
    tone: profile.tone,
    topic: cleanTopic,
    seoKeywords: profile.seo?.keywords,
    publicUrl: `${baseUrl}/${business.slug}`,
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

export type ImageState =
  | { error: string }
  | { ok: true; imageUrl: string }
  | undefined;

// F3.6 — genererer et AI-bilde fra en prompt, tilpasset kanalens format.
export async function generateImageAction(
  prompt: string,
  channelId: string,
): Promise<ImageState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };
  if (!hasReplicateToken()) {
    return { error: "Bildegenerering er ikke konfigurert ennå." };
  }

  const cleanPrompt = prompt.trim();
  if (cleanPrompt.length < 3) {
    return { error: "Mangler en beskrivelse å lage bilde fra." };
  }

  const aspectRatio =
    channelId in CHANNEL_STRATEGIES
      ? CHANNEL_STRATEGIES[channelId as ChannelId].imageAspectRatio
      : "1:1";

  try {
    const urls = await generateImage({ prompt: cleanPrompt, aspectRatio });
    const replicateUrl = urls[0];
    if (!replicateUrl) {
      return { error: "Bildemotoren returnerte ingen bilde." };
    }

    // Lagre permanent i Cloudinary — Replicate-URL-er utløper raskt.
    if (hasCloudinary()) {
      try {
        const stored = await uploadImageFromUrl(replicateUrl);
        return { ok: true, imageUrl: stored };
      } catch {
        // Faller tilbake til Replicate-URL hvis opplasting feiler.
        return { ok: true, imageUrl: replicateUrl };
      }
    }
    return { ok: true, imageUrl: replicateUrl };
  } catch {
    return {
      error: "Klarte ikke å lage bildet akkurat nå. Prøv igjen om litt.",
    };
  }
}

export type PlanState =
  | { error: string }
  | { ok: true; plan: PostingPlan }
  | undefined;

// Førstkommende mandag, som ISO-dato (YYYY-MM-DD).
function nextMonday(): string {
  const d = new Date();
  const day = d.getDay(); // 0 = søndag
  let diff = (1 - day + 7) % 7;
  if (diff === 0) diff = 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

// F3.8 — genererer en helhetlig publiseringsplan på tvers av kanalene.
export async function generatePlanAction(
  periodWeeks: number,
): Promise<PlanState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };
  if (!hasAnthropicKey()) {
    return { error: "AI-tjenesten er ikke konfigurert ennå." };
  }
  const weeks = [1, 2, 4].includes(periodWeeks) ? periodWeeks : 2;

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
    const { result } = await generatePlan({
      businessName: business.name,
      description: business.description ?? undefined,
      audience: profile.audience,
      tone: profile.tone,
      services: serviceList.map((s) => s.name),
      products: productList.map((p) => p.name),
      seoKeywords: profile.seo?.keywords,
      channels: profile.channels ?? [],
      periodWeeks: weeks,
      startDate: nextMonday(),
    });

    const plan: PostingPlan = { ...result, generatedAt: new Date().toISOString() };
    const marketingProfile: MarketingProfile = {
      ...profile,
      postingPlan: plan,
    };
    await db
      .update(businesses)
      .set({ marketingProfile })
      .where(eq(businesses.id, businessId));
    revalidatePath("/admin/markedsforing");
    return { ok: true, plan };
  } catch {
    return {
      error:
        "Klarte ikke å lage publiseringsplanen akkurat nå. Prøv igjen om litt.",
    };
  }
}

export type BlogState =
  | { error: string }
  | { ok: true; post: GeneratedBlogPost }
  | undefined;

// F3.7 — genererer et SEO-optimalisert blogginnlegg (lagres ikke ennå).
export async function generateBlogPostAction(
  topic: string,
): Promise<BlogState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };
  if (!hasAnthropicKey()) {
    return { error: "AI-tjenesten er ikke konfigurert ennå." };
  }

  const cleanTopic = topic.trim();
  if (cleanTopic.length < 3) {
    return { error: "Skriv inn et tema for blogginnlegget." };
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bestilly.no";
  try {
    const { result } = await generateBlogPost({
      businessName: business.name,
      description: business.description ?? undefined,
      audience: profile.audience,
      tone: profile.tone,
      topic: cleanTopic,
      seoKeywords: profile.seo?.keywords,
      services: serviceList.map((s) => s.name),
      products: productList.map((p) => p.name),
      publicUrl: `${baseUrl}/${business.slug}`,
    });
    return { ok: true, post: result };
  } catch {
    return {
      error:
        "Klarte ikke å lage blogginnlegget akkurat nå. Prøv igjen om litt.",
    };
  }
}

export type SaveBlogState =
  | { error: string }
  | { ok: true }
  | undefined;

// Lagrer et generert blogginnlegg som upublisert kladd i bloggen.
export async function saveGeneratedBlogPost(
  title: string,
  content: string,
): Promise<SaveBlogState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };

  const cleanTitle = title.trim();
  const cleanContent = content.trim();
  if (!cleanTitle) return { error: "Tittel er påkrevd." };
  if (!cleanContent) return { error: "Innhold er påkrevd." };

  // Finn en ledig slug innenfor bedriften.
  const base = slugify(cleanTitle) || "innlegg";
  let slug = base;
  let suffix = 1;
  while (
    await db.query.posts.findFirst({
      where: and(eq(posts.businessId, businessId), eq(posts.slug, slug)),
    })
  ) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  await db.insert(posts).values({
    businessId,
    slug,
    title: cleanTitle,
    content: cleanContent,
    published: false,
  });
  revalidatePath("/admin/blogg");
  return { ok: true };
}
