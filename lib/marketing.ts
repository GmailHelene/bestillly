// Typer, konstanter og parsere for markedsføringshuben.
// VIKTIG: denne fila importeres av klient-komponenter — den skal IKKE
// importere noe som drar inn AI-SDK-er (Anthropic/Replicate). Hold alle
// importer her som `import type` (erasable).

import type { WebsiteCrawl } from "@/lib/crawler";
import type { SeoResult } from "@/lib/marketing-seo";
import type {
  AnalysisChannel,
  MarketAnalysis,
} from "@/lib/marketing-analysis";
import type { PlanItem, PostingPlan } from "@/lib/marketing-plan";

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
  postingPlan?: PostingPlan;
};

const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

function parseWebsiteCrawl(raw: unknown): WebsiteCrawl | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  if (typeof o.url !== "string" || typeof o.text !== "string") return undefined;
  return {
    url: o.url,
    title: typeof o.title === "string" ? o.title : undefined,
    description: typeof o.description === "string" ? o.description : undefined,
    text: o.text,
    keywords: strList(o.keywords),
    pagesCrawled: typeof o.pagesCrawled === "number" ? o.pagesCrawled : 0,
    crawledAt: typeof o.crawledAt === "string" ? o.crawledAt : "",
  };
}

export function parseSeoResult(raw: unknown): SeoResult | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  if (typeof o.metaTitle !== "string" || typeof o.summary !== "string") {
    return undefined;
  }
  return {
    keywords: strList(o.keywords),
    metaTitle: o.metaTitle,
    metaDescription:
      typeof o.metaDescription === "string" ? o.metaDescription : "",
    contentTips: strList(o.contentTips),
    summary: o.summary,
    generatedAt: typeof o.generatedAt === "string" ? o.generatedAt : "",
  };
}

export function parseMarketAnalysis(raw: unknown): MarketAnalysis | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  if (typeof o.summary !== "string") return undefined;
  const channels: AnalysisChannel[] = Array.isArray(o.channels)
    ? o.channels
        .map((c): AnalysisChannel | null => {
          if (!c || typeof c !== "object") return null;
          const ch = c as Record<string, unknown>;
          if (typeof ch.channelId !== "string") return null;
          return {
            channelId: ch.channelId,
            name: typeof ch.name === "string" ? ch.name : ch.channelId,
            priority: typeof ch.priority === "number" ? ch.priority : 0,
            rationale: typeof ch.rationale === "string" ? ch.rationale : "",
            recommendedFrequency:
              typeof ch.recommendedFrequency === "string"
                ? ch.recommendedFrequency
                : "",
            bestTimes: strList(ch.bestTimes),
          };
        })
        .filter((c): c is AnalysisChannel => c !== null)
    : [];
  return {
    summary: o.summary,
    channels,
    budgetStrategy:
      typeof o.budgetStrategy === "string" ? o.budgetStrategy : "",
    organicVsPaid:
      typeof o.organicVsPaid === "string" ? o.organicVsPaid : "",
    quickWins: strList(o.quickWins),
    generatedAt: typeof o.generatedAt === "string" ? o.generatedAt : "",
  };
}

export function parsePostingPlan(raw: unknown): PostingPlan | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.items)) return undefined;
  const items: PlanItem[] = o.items
    .map((it): PlanItem | null => {
      if (!it || typeof it !== "object") return null;
      const i = it as Record<string, unknown>;
      if (typeof i.date !== "string" || typeof i.caption !== "string") {
        return null;
      }
      return {
        date: i.date,
        weekday: typeof i.weekday === "string" ? i.weekday : "",
        time: typeof i.time === "string" ? i.time : "",
        channelId: typeof i.channelId === "string" ? i.channelId : "",
        channelName:
          typeof i.channelName === "string" ? i.channelName : "",
        postType: typeof i.postType === "string" ? i.postType : "Innlegg",
        theme: typeof i.theme === "string" ? i.theme : "",
        caption: i.caption,
        hashtags: strList(i.hashtags),
      };
    })
    .filter((i): i is PlanItem => i !== null);
  if (items.length === 0) return undefined;
  return {
    periodWeeks: typeof o.periodWeeks === "number" ? o.periodWeeks : 1,
    startDate: typeof o.startDate === "string" ? o.startDate : "",
    summary: typeof o.summary === "string" ? o.summary : "",
    items,
    generatedAt: typeof o.generatedAt === "string" ? o.generatedAt : "",
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
    channels: strList(o.channels),
    websiteCrawl: parseWebsiteCrawl(o.websiteCrawl),
    seo: parseSeoResult(o.seo),
    analysis: parseMarketAnalysis(o.analysis),
    postingPlan: parsePostingPlan(o.postingPlan),
  };
}
