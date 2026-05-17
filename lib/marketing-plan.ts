// F3.8 — Publiseringsplan. Lager en helhetlig kalender over hva som postes
// når, på tvers av alle kanalene bedriften satser på — uke- eller månedsbasis.

import { generateJson } from "@/lib/anthropic";
import {
  channelsByPriority,
  CHANNEL_STRATEGIES,
  type ChannelId,
} from "@/lib/marketing-platforms";

export type PlanItem = {
  date: string;
  weekday: string;
  time: string;
  channelId: string;
  channelName: string;
  postType: string;
  theme: string;
  caption: string;
  hashtags: string[];
};

export type PostingPlan = {
  periodWeeks: number;
  startDate: string;
  summary: string;
  items: PlanItem[];
  generatedAt: string;
};

export type PlanInput = {
  businessName: string;
  description?: string;
  audience?: string;
  tone?: string;
  services: string[];
  products: string[];
  seoKeywords?: string[];
  channels: string[];
  periodWeeks: number;
  startDate: string;
};

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const SYSTEM_PROMPT = `Du er en erfaren norsk innholdsplanlegger som lager publiseringsplaner for små, lokale bedrifter med lite tid.

Du skal lage en realistisk, gjennomførbar plan — ikke en overambisiøs en. En liten bedrift klarer ikke å være aktiv overalt hele tida. Prioriter de viktigste kanalene, og hold totalen overkommelig.

Varier temaene gjennom planen: tilbud, fagtips, bak kulissene, produkt-/behandlingsfokus, kundehistorier, ledige timer, sesong. Ikke gjenta samme idé.

Svar KUN med gyldig JSON i dette formatet:
{
  "summary": "2-3 setninger om planen og tankegangen bak prioriteringen",
  "items": [
    {
      "date": "YYYY-MM-DD (innenfor perioden)",
      "weekday": "Ukedag på norsk",
      "time": "HH:MM",
      "channelId": "facebook|instagram|tiktok|snapchat|youtube",
      "postType": "Innlegg|Reel|Story|Kort video|Short",
      "theme": "Kort: hva innlegget handler om",
      "caption": "1-2 setningers utkast til bildetekst — bedriften finpusser selv",
      "hashtags": ["relevante hashtags uten #-tegn, tom liste hvis kanalen ikke bruker dem"]
    }
  ]
}

Sorter items etter dato. Bruk anbefalte postedager og -tidspunkt. Returner KUN JSON.`;

function buildUserPrompt(input: PlanInput): string {
  const ids = (
    input.channels.length
      ? input.channels
      : (Object.keys(CHANNEL_STRATEGIES) as string[])
  ).filter((id): id is ChannelId => id in CHANNEL_STRATEGIES);

  const reference = channelsByPriority(ids)
    .map(
      (c) =>
        `- ${c.name} (${c.id}): anbefalt ${c.frequency}. Tider: ${c.optimalTimes.join("; ")}.`,
    )
    .join("\n");

  const endDate = addDays(input.startDate, input.periodWeeks * 7 - 1);

  const parts: string[] = [];
  parts.push(`Bedrift: ${input.businessName}`);
  if (input.description) parts.push(`Om bedriften: ${input.description}`);
  if (input.services.length)
    parts.push(`Behandlinger: ${input.services.join(", ")}`);
  if (input.products.length)
    parts.push(`Produkter: ${input.products.join(", ")}`);
  if (input.audience) parts.push(`Målgruppe: ${input.audience}`);
  if (input.tone) parts.push(`Tone: ${input.tone}`);
  if (input.seoKeywords?.length)
    parts.push(`Søkeord å veve inn: ${input.seoKeywords.join(", ")}`);
  parts.push(
    `\nPeriode: ${input.periodWeeks} uke(r), fra ${input.startDate} til og med ${endDate}.`,
  );
  parts.push(`\n--- Kanaler og anbefalinger ---\n${reference}`);
  return parts.join("\n");
}

export async function generatePlan(
  input: PlanInput,
): Promise<{ result: Omit<PostingPlan, "generatedAt">; costUsd: number }> {
  const { data, costUsd } = await generateJson<{
    summary?: unknown;
    items?: unknown;
  }>({
    system: SYSTEM_PROMPT,
    user: buildUserPrompt(input),
    maxTokens: Math.min(8000, 2500 + input.periodWeeks * 1100),
  });

  const strList = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

  const items: PlanItem[] = Array.isArray(data.items)
    ? data.items
        .map((raw): PlanItem | null => {
          if (!raw || typeof raw !== "object") return null;
          const o = raw as Record<string, unknown>;
          if (typeof o.date !== "string" || typeof o.caption !== "string") {
            return null;
          }
          const channelId =
            typeof o.channelId === "string" ? o.channelId : "";
          const strategy =
            channelId in CHANNEL_STRATEGIES
              ? CHANNEL_STRATEGIES[channelId as ChannelId]
              : undefined;
          if (!strategy) return null;
          return {
            date: o.date,
            weekday: typeof o.weekday === "string" ? o.weekday : "",
            time: typeof o.time === "string" ? o.time : "",
            channelId,
            channelName: strategy.name,
            postType:
              typeof o.postType === "string" ? o.postType : "Innlegg",
            theme: typeof o.theme === "string" ? o.theme : "",
            caption: o.caption,
            hashtags: strList(o.hashtags),
          };
        })
        .filter((i): i is PlanItem => i !== null)
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  if (items.length === 0) {
    throw new Error("Planen kom tom tilbake.");
  }

  return {
    result: {
      periodWeeks: input.periodWeeks,
      startDate: input.startDate,
      summary: typeof data.summary === "string" ? data.summary : "",
      items,
    },
    costUsd,
  };
}
