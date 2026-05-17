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
};

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
  };
}
