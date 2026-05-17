import type { WebsiteCrawl } from "@/lib/crawler";
import { parseSeoResult, type SeoResult } from "@/lib/marketing-seo";
import {
  parseMarketAnalysis,
  type MarketAnalysis,
} from "@/lib/marketing-analysis";

// Kanaler bedriften kan markedsføre på.
export const MARKETING_CHANNELS = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "snapchat", label: "Snapchat" },
  { id: "youtube", label: "YouTube" },
] as const;

// Markedsføringsprofil — input som mater analyser og innholdsgenerering (Fase 3).
export type MarketingProfile = {
  audience?: string;
  tone?: string;
  budgetNok?: number;
  websiteUrl?: string;
  channels?: string[];
  websiteCrawl?: WebsiteCrawl;
  seo?: SeoResult;
  analysis?: MarketAnalysis;
};

function parseWebsiteCrawl(raw: unknown): WebsiteCrawl | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  if (typeof o.url !== "string" || typeof o.text !== "string") return undefined;
  return {
    url: o.url,
    title: typeof o.title === "string" ? o.title : undefined,
    description: typeof o.description === "string" ? o.description : undefined,
    text: o.text,
    keywords: Array.isArray(o.keywords)
      ? o.keywords.filter((x): x is string => typeof x === "string")
      : [],
    pagesCrawled: typeof o.pagesCrawled === "number" ? o.pagesCrawled : 0,
    crawledAt: typeof o.crawledAt === "string" ? o.crawledAt : "",
  };
}

export function parseMarketingProfile(raw: unknown): MarketingProfile {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    audience: typeof o.audience === "string" ? o.audience : undefined,
    tone: typeof o.tone === "string" ? o.tone : undefined,
    budgetNok: typeof o.budgetNok === "number" ? o.budgetNok : undefined,
    websiteUrl: typeof o.websiteUrl === "string" ? o.websiteUrl : undefined,
    channels: Array.isArray(o.channels)
      ? o.channels.filter((x): x is string => typeof x === "string")
      : [],
    websiteCrawl: parseWebsiteCrawl(o.websiteCrawl),
    seo: parseSeoResult(o.seo),
    analysis: parseMarketAnalysis(o.analysis),
  };
}
