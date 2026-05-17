// F3.4 — Markedsanalyse. Prioriterer kanaler, anbefaler postefrekvens og
// -tidspunkt, og gir en budsjettstrategi (betalt vs. organisk) for bedriften.

import { generateJson } from "@/lib/anthropic";
import { parseMarketAnalysis } from "@/lib/marketing";
import {
  CHANNEL_STRATEGIES,
  channelsByPriority,
  type ChannelId,
} from "@/lib/marketing-platforms";

export type AnalysisChannel = {
  channelId: string;
  name: string;
  priority: number;
  rationale: string;
  recommendedFrequency: string;
  bestTimes: string[];
};

export type MarketAnalysis = {
  summary: string;
  channels: AnalysisChannel[];
  budgetStrategy: string;
  organicVsPaid: string;
  quickWins: string[];
  generatedAt: string;
};

export type AnalysisInput = {
  businessName: string;
  description?: string;
  address?: string;
  services: string[];
  products: string[];
  audience?: string;
  tone?: string;
  budgetNok?: number;
  channels: string[];
  seoSummary?: string;
  seoKeywords?: string[];
};

const SYSTEM_PROMPT = `Du er en erfaren norsk markedsrådgiver som hjelper små, lokale bedrifter (frisører, salonger, enkeltpersonforetak) med å få mest mulig ut av sosiale medier med lite tid og lite penger.

Du får oppgitt en referanse med fakta om hver kanal (frekvens, tider, format). Bruk disse som utgangspunkt, men tilpass til DENNE bedriften, målgruppen og budsjettet.

Vær konkret og realistisk. En liten bedrift klarer ikke å være aktiv overalt — prioriter hardt. Hvis budsjettet er lite eller null, legg vekt på organisk innhold.

Svar KUN med gyldig JSON i dette formatet:
{
  "summary": "2–3 setningers oppsummering av markedsføringssituasjonen og hovedanbefalingen",
  "channels": [
    {
      "channelId": "facebook|instagram|tiktok|snapchat|youtube",
      "name": "Kanalnavn",
      "priority": 1,
      "rationale": "Hvorfor denne prioriteringen passer for nettopp denne bedriften",
      "recommendedFrequency": "Konkret anbefalt frekvens",
      "bestTimes": ["Konkrete postetidspunkt"]
    }
  ],
  "budgetStrategy": "Hvordan fordele budsjettet — betalt annonsering vs. organisk. Vær konkret med kroner hvis budsjett er oppgitt.",
  "organicVsPaid": "Kort råd om balansen mellom gratis (organisk) innhold og betalte annonser for denne bedriften",
  "quickWins": ["3–5 raske grep bedriften kan gjøre denne uka"]
}

Prioriter kanalene fra 1 (viktigst). Ta kun med kanalene bedriften har valgt. Returner KUN JSON.`;

function buildUserPrompt(input: AnalysisInput): string {
  const ids: ChannelId[] = (
    input.channels.length
      ? input.channels
      : (Object.keys(CHANNEL_STRATEGIES) as string[])
  ).filter((id): id is ChannelId => id in CHANNEL_STRATEGIES);

  const reference = channelsByPriority(ids)
    .map(
      (c) =>
        `- ${c.name} (${c.id}): ${c.description} Anbefalt frekvens: ${c.frequency}. Tider: ${c.optimalTimes.join("; ")}. Format: ${c.pixelSize}.`,
    )
    .join("\n");

  const parts: string[] = [];
  parts.push(`Bedrift: ${input.businessName}`);
  if (input.address) parts.push(`Sted: ${input.address}`);
  if (input.description) parts.push(`Beskrivelse: ${input.description}`);
  if (input.services.length)
    parts.push(`Behandlinger: ${input.services.join(", ")}`);
  if (input.products.length)
    parts.push(`Produkter: ${input.products.join(", ")}`);
  if (input.audience) parts.push(`Målgruppe: ${input.audience}`);
  if (input.tone) parts.push(`Tone: ${input.tone}`);
  parts.push(
    input.budgetNok
      ? `Markedsføringsbudsjett: ${input.budgetNok} kr (per år)`
      : "Markedsføringsbudsjett: ikke oppgitt / svært lite — anta tilnærmet null",
  );
  if (input.seoSummary) parts.push(`SEO-oppsummering: ${input.seoSummary}`);
  if (input.seoKeywords?.length)
    parts.push(`Viktige søkeord: ${input.seoKeywords.join(", ")}`);

  parts.push(
    `\nKanaler bedriften vil satse på: ${ids
      .map((id) => CHANNEL_STRATEGIES[id].name)
      .join(", ")}`,
  );
  parts.push(`\n--- Referanse om kanalene ---\n${reference}`);
  return parts.join("\n");
}

export async function generateAnalysis(
  input: AnalysisInput,
): Promise<{ result: MarketAnalysis; costUsd: number }> {
  const { data, costUsd } = await generateJson<
    Omit<MarketAnalysis, "generatedAt">
  >({
    system: SYSTEM_PROMPT,
    user: buildUserPrompt(input),
    maxTokens: 2000,
  });

  const parsed = parseMarketAnalysis({
    ...data,
    generatedAt: new Date().toISOString(),
  });
  if (!parsed) {
    throw new Error("Svaret fra Claude manglet nødvendige felter.");
  }
  parsed.channels.sort((a, b) => a.priority - b.priority);
  return { result: parsed, costUsd };
}
