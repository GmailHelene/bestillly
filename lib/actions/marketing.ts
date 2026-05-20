"use server";

import { and, eq } from "drizzle-orm";
import { toZonedTime } from "date-fns-tz";
import { revalidatePath } from "next/cache";
import { TIMEZONE } from "@/lib/availability";
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
import { parseOnepageContent, type OnepageContent } from "@/lib/onepage";
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
import { generateSnippets } from "@/lib/marketing-snippet";
import { getSnippetType } from "@/lib/snippet-types";
import {
  consumeCredits,
  refundCredits,
  TEXT_COST,
} from "@/lib/ai-quota";
import {
  buildDemoMarketingProfile,
  demoContentPosts,
  demoImageUrl,
  demoSnippets,
  DEMO_BLOG_POST,
} from "@/lib/demo-marketing";

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
  if (await isDemoBusiness(businessId)) {
    const crawl = buildDemoMarketingProfile().websiteCrawl;
    return crawl ? { ok: true, crawl } : { error: DEMO_BLOCK_MESSAGE };
  }

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
  if (await isDemoBusiness(businessId)) {
    const seo = buildDemoMarketingProfile().seo;
    return seo ? { ok: true, seo } : { error: DEMO_BLOCK_MESSAGE };
  }
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

  const credit = await consumeCredits(businessId, "text", TEXT_COST.seo);
  if (!credit.ok) return { error: credit.error };

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
    await refundCredits(businessId, "text", TEXT_COST.seo);
    return {
      error:
        "Klarte ikke å lage SEO-anbefalingen akkurat nå. Prøv igjen om litt.",
    };
  }
}

export type ApplySeoState =
  | { error: string }
  | { ok: true }
  | undefined;

// Skriver SEO-forslaget (meta-tittel, -beskrivelse, søkeord) rett inn i
// bedriftens onepage — så loopen fra forslag til faktisk side lukkes.
export async function applySeoSuggestion(): Promise<ApplySeoState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });
  if (!business) return { error: "Fant ikke bedriften." };

  const profile = parseMarketingProfile(business.marketingProfile);
  if (!profile.seo) {
    return { error: "Lag en SEO-anbefaling først." };
  }

  const content = parseOnepageContent(business.onepageContent);
  const updated: OnepageContent = {
    ...content,
    seo: {
      metaTitle: profile.seo.metaTitle || content.seo?.metaTitle,
      metaDescription:
        profile.seo.metaDescription || content.seo?.metaDescription,
      keywords: profile.seo.keywords.length
        ? profile.seo.keywords.join(", ")
        : content.seo?.keywords,
    },
  };

  await db
    .update(businesses)
    .set({ onepageContent: updated })
    .where(eq(businesses.id, businessId));
  revalidatePath("/admin/side");
  revalidatePath(`/${business.slug}`);
  return { ok: true };
}

export type AnalysisState =
  | { error: string }
  | { ok: true; analysis: MarketAnalysis }
  | undefined;

// F3.4 — genererer markedsanalyse med Claude og lagrer den i profilen.
export async function generateAnalysisAction(): Promise<AnalysisState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) {
    const analysis = buildDemoMarketingProfile().analysis;
    return analysis
      ? { ok: true, analysis }
      : { error: DEMO_BLOCK_MESSAGE };
  }
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

  const credit = await consumeCredits(businessId, "text", TEXT_COST.analysis);
  if (!credit.ok) return { error: credit.error };

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
    await refundCredits(businessId, "text", TEXT_COST.analysis);
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
  if (await isDemoBusiness(businessId)) {
    const demoChannels = channelIds.filter(
      (id): id is ChannelId => id in CHANNEL_STRATEGIES,
    );
    if (demoChannels.length === 0) {
      return { error: "Velg minst én kanal." };
    }
    return {
      ok: true,
      posts: demoContentPosts(demoChannels),
      failedChannels: [],
    };
  }
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

  const cost = channels.length * TEXT_COST.contentPerPost;
  const credit = await consumeCredits(businessId, "text", cost);
  if (!credit.ok) return { error: credit.error };

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

  // Refunder kreditter for kanaler som ikke ga noe innlegg.
  if (failedChannels.length > 0) {
    await refundCredits(
      businessId,
      "text",
      failedChannels.length * TEXT_COST.contentPerPost,
    );
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
  if (await isDemoBusiness(businessId)) {
    return { ok: true, imageUrl: demoImageUrl(channelId) };
  }
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

  const credit = await consumeCredits(businessId, "image", 1);
  if (!credit.ok) return { error: credit.error };

  try {
    const urls = await generateImage({ prompt: cleanPrompt, aspectRatio });
    const replicateUrl = urls[0];
    if (!replicateUrl) {
      await refundCredits(businessId, "image", 1);
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
  } catch (err) {
    await refundCredits(businessId, "image", 1);
    // Logg detaljert til server-loggen så vi kan diagnostisere i produksjon.
    console.error("[generateImageAction] Replicate-feil:", err);
    return {
      error: "Klarte ikke å lage bildet akkurat nå. Prøv igjen om litt.",
    };
  }
}

export type PlanState =
  | { error: string }
  | { ok: true; plan: PostingPlan }
  | undefined;

// Førstkommende mandag i norsk tid, som ISO-dato (YYYY-MM-DD).
function nextMonday(): string {
  const oslo = toZonedTime(new Date(), TIMEZONE);
  const day = oslo.getDay(); // 0 = søndag, i norsk tid
  let diff = (1 - day + 7) % 7;
  if (diff === 0) diff = 7;
  oslo.setDate(oslo.getDate() + diff);
  const y = oslo.getFullYear();
  const m = String(oslo.getMonth() + 1).padStart(2, "0");
  const d = String(oslo.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// F3.8 — genererer en helhetlig publiseringsplan på tvers av kanalene.
export async function generatePlanAction(
  periodWeeks: number,
): Promise<PlanState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) {
    const plan = buildDemoMarketingProfile().postingPlan;
    return plan ? { ok: true, plan } : { error: DEMO_BLOCK_MESSAGE };
  }
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

  const credit = await consumeCredits(businessId, "text", TEXT_COST.plan);
  if (!credit.ok) return { error: credit.error };

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
    await refundCredits(businessId, "text", TEXT_COST.plan);
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
  if (await isDemoBusiness(businessId)) {
    return { ok: true, post: DEMO_BLOG_POST };
  }
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

  const credit = await consumeCredits(businessId, "text", TEXT_COST.blog);
  if (!credit.ok) return { error: credit.error };

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
    await refundCredits(businessId, "text", TEXT_COST.blog);
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

export type SnippetState =
  | { error: string }
  | { ok: true; variants: string[] }
  | undefined;

// F3.7b — genererer korte SEO-tekster i flere varianter.
export async function generateSnippetAction(
  snippetTypeId: string,
  extraContext: string,
): Promise<SnippetState> {
  const businessId = await requireBusinessId();
  if (!getSnippetType(snippetTypeId)) {
    return { error: "Ukjent teksttype." };
  }
  if (await isDemoBusiness(businessId)) {
    return { ok: true, variants: demoSnippets(snippetTypeId) };
  }
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

  const credit = await consumeCredits(businessId, "text", TEXT_COST.snippet);
  if (!credit.ok) return { error: credit.error };

  try {
    const { variants } = await generateSnippets({
      snippetTypeId,
      extraContext,
      businessName: business.name,
      description: business.description ?? undefined,
      address: business.address ?? undefined,
      audience: profile.audience,
      tone: profile.tone,
      services: serviceList.map((s) => s.name),
      products: productList.map((p) => p.name),
      seoKeywords: profile.seo?.keywords,
    });
    return { ok: true, variants };
  } catch {
    await refundCredits(businessId, "text", TEXT_COST.snippet);
    return {
      error: "Klarte ikke å lage tekstene akkurat nå. Prøv igjen om litt.",
    };
  }
}
