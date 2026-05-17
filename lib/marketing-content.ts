// F3.5 — Innholdsgenerator (SoMe). Lager komplette innlegg tilpasset HVER
// kanal: bildetekst, hashtags, bildeidé, beste tidspunkt og tips. Kanaltilpasning
// er kjerneverdien — hvert innlegg genereres separat per kanal.

import { generateJson } from "@/lib/anthropic";
import {
  getChannelStrategy,
  type ChannelId,
} from "@/lib/marketing-platforms";

export type GeneratedPost = {
  channelId: string;
  channelName: string;
  format: string;
  pixelSize: string;
  caption: string;
  hashtags: string[];
  imageIdea: string;
  imagePrompt: string;
  bestTime: string;
  tips: string[];
};

export function parseGeneratedPost(
  raw: unknown,
  channelId: string,
  channelName: string,
  format: string,
  pixelSize: string,
): GeneratedPost | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  if (typeof o.caption !== "string") return undefined;
  const strList = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  return {
    channelId,
    channelName,
    format,
    pixelSize,
    caption: o.caption,
    hashtags: strList(o.hashtags),
    imageIdea: typeof o.imageIdea === "string" ? o.imageIdea : "",
    imagePrompt: typeof o.imagePrompt === "string" ? o.imagePrompt : "",
    bestTime: typeof o.bestTime === "string" ? o.bestTime : "",
    tips: strList(o.tips),
  };
}

export type ContentInput = {
  businessName: string;
  description?: string;
  audience?: string;
  tone?: string;
  topic: string;
  seoKeywords?: string[];
};

function buildSystemPrompt(channelId: ChannelId): string {
  const s = getChannelStrategy(channelId);
  return `Du er en erfaren norsk content creator som lager innhold for sosiale medier for små, lokale bedrifter.

Du skal lage ÉTT innlegg spesielt tilpasset ${s.name}. Innholdet skal IKKE være generisk — det skal utnytte hvordan nettopp ${s.name} fungerer.

# Om ${s.name}
${s.description}
- Anbefalt frekvens: ${s.frequency}
- Gode tidspunkt: ${s.optimalTimes.join("; ")}
- Bildeformat: ${s.pixelSize} (${s.imageAspectRatio})
- Bildetekst: ideelt ${s.captionLength.ideal} tegn (maks ${s.captionLength.max})
- Hashtags: ${s.hashtagCount === 0 ? "brukes ikke" : `ca. ${s.hashtagCount} relevante`}

Algoritme-tips:
${s.tips.map((t) => `- ${t}`).join("\n")}

Unngå:
${s.avoid.map((a) => `- ${a}`).join("\n")}

# Format på svaret
Svar KUN med gyldig JSON:
{
  "caption": "Selve bildeteksten — klar til å lime inn, på norsk, tilpasset ${s.name}",
  "hashtags": [${s.hashtagCount === 0 ? "" : '"relevante hashtags uten #-tegn"'}],
  "imageIdea": "Kort beskrivelse på norsk av hva bildet/videoen bør vise",
  "imagePrompt": "Detaljert prompt på ENGELSK for AI-bildegenerering — beskriv motiv, stil, lys",
  "bestTime": "Konkret anbefalt tidspunkt å publisere",
  "tips": ["2–4 korte, konkrete tips for å lykkes med akkurat dette innlegget"]
}

Returner KUN JSON, ingen tekst rundt.`;
}

function buildUserPrompt(input: ContentInput): string {
  const parts: string[] = [];
  parts.push(`Bedrift: ${input.businessName}`);
  if (input.description) parts.push(`Om bedriften: ${input.description}`);
  if (input.audience) parts.push(`Målgruppe: ${input.audience}`);
  if (input.tone) parts.push(`Ønsket tone: ${input.tone}`);
  if (input.seoKeywords?.length)
    parts.push(`Relevante søkeord å veve inn: ${input.seoKeywords.join(", ")}`);
  parts.push(`\nTema for innlegget: ${input.topic}`);
  return parts.join("\n");
}

export async function generatePost(
  channelId: ChannelId,
  input: ContentInput,
): Promise<{ post: GeneratedPost; costUsd: number }> {
  const strategy = getChannelStrategy(channelId);
  const { data, costUsd } = await generateJson<Record<string, unknown>>({
    system: buildSystemPrompt(channelId),
    user: buildUserPrompt(input),
    maxTokens: 1200,
  });

  const post = parseGeneratedPost(
    data,
    channelId,
    strategy.name,
    `${strategy.imageAspectRatio} — ${strategy.frequency}`,
    strategy.pixelSize,
  );
  if (!post) {
    throw new Error("Svaret fra Claude manglet nødvendige felter.");
  }
  return { post, costUsd };
}
