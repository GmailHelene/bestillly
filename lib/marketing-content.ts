// F3.5 — Innholdsgenerator (SoMe). Lager komplette innlegg tilpasset HVER
// kanal: innleggstype, tittel, bildetekst, hashtags, oppfordring (CTA),
// lenke/mål, bildeidé, beste tidspunkt og tips. Kanaltilpasning er
// kjerneverdien — hvert innlegg genereres separat per kanal.

import { generateJson } from "@/lib/anthropic";
import {
  getChannelStrategy,
  type ChannelId,
} from "@/lib/marketing-platforms";

export type GeneratedPost = {
  channelId: string;
  channelName: string;
  postType: string;
  pixelSize: string;
  title: string;
  caption: string;
  hashtags: string[];
  callToAction: string;
  linkSuggestion: string;
  goal: string;
  imageIdea: string;
  imagePrompt: string;
  bestTime: string;
  tips: string[];
};

const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

const str = (v: unknown): string => (typeof v === "string" ? v : "");

export function parseGeneratedPost(
  raw: unknown,
  channelId: string,
  channelName: string,
  pixelSize: string,
): GeneratedPost | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  if (typeof o.caption !== "string") return undefined;
  return {
    channelId,
    channelName,
    pixelSize,
    postType: str(o.postType) || "Innlegg",
    title: str(o.title),
    caption: o.caption,
    hashtags: strList(o.hashtags),
    callToAction: str(o.callToAction),
    linkSuggestion: str(o.linkSuggestion),
    goal: str(o.goal),
    imageIdea: str(o.imageIdea),
    imagePrompt: str(o.imagePrompt),
    bestTime: str(o.bestTime),
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
  publicUrl?: string;
};

function buildSystemPrompt(channelId: ChannelId): string {
  const s = getChannelStrategy(channelId);
  return `Du er en erfaren norsk content creator som lager innhold for sosiale medier for små, lokale bedrifter.

Du skal lage ÉTT komplett, publiseringsklart innlegg spesielt tilpasset ${s.name}. Innholdet skal IKKE være generisk — det skal utnytte hvordan nettopp ${s.name} fungerer. Innholdet skal være SEO-bevisst: vev inn relevante søkeord naturlig.

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
  "postType": "Innleggstypen som passer ${s.name} for dette innholdet (f.eks. Innlegg, Reel, Story, Kort video, Short)",
  "title": "Kort, fengende tittel — fyll ut der kanalen trenger det (særlig YouTube). Tom streng hvis ikke relevant.",
  "caption": "Selve bildeteksten — klar til å lime inn, på norsk, tilpasset ${s.name}",
  "hashtags": [${s.hashtagCount === 0 ? "" : '"relevante hashtags uten #-tegn"'}],
  "callToAction": "Konkret oppfordring til handling — hva kunden skal gjøre nå",
  "linkSuggestion": "Hvilken lenke eller mål innlegget skal peke mot (f.eks. bookingsiden, en bestemt behandling)",
  "goal": "Kort: hva dette innlegget skal oppnå for bedriften",
  "imageIdea": "Kort beskrivelse på norsk av hva bildet/videoen bør vise",
  "imagePrompt": "Detaljert prompt på ENGELSK for AI-bildegenerering — beskriv motiv, stil, lys",
  "bestTime": "Konkret anbefalt tidspunkt å publisere",
  "tips": ["2-4 korte, konkrete tips for å lykkes med akkurat dette innlegget"]
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
  if (input.publicUrl)
    parts.push(
      `Bedriftens nettside (booking + butikk): ${input.publicUrl} — bruk denne som mål/lenke der det passer.`,
    );
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
    maxTokens: 1400,
  });

  const post = parseGeneratedPost(
    data,
    channelId,
    strategy.name,
    strategy.pixelSize,
  );
  if (!post) {
    throw new Error("Svaret fra Claude manglet nødvendige felter.");
  }
  return { post, costUsd };
}
