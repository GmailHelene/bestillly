// F3.3 — SEO-generator. Tar alt bestilly vet om bedriften (profil, behandlinger,
// produkter, beskrivelse) pluss nettside-crawlen, og foreslår nøkkelord,
// meta-tittel/-beskrivelse og konkrete innholdsråd via Claude.

import { generateJson } from "@/lib/anthropic";

export type SeoResult = {
  keywords: string[];
  metaTitle: string;
  metaDescription: string;
  contentTips: string[];
  summary: string;
  generatedAt: string;
};

export function parseSeoResult(raw: unknown): SeoResult | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  if (typeof o.metaTitle !== "string" || typeof o.summary !== "string") {
    return undefined;
  }
  const strList = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
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

export type SeoInput = {
  businessName: string;
  description?: string;
  address?: string;
  services: string[];
  products: string[];
  audience?: string;
  tone?: string;
  websiteTitle?: string;
  websiteDescription?: string;
  websiteKeywords?: string[];
  websiteText?: string;
};

const SYSTEM_PROMPT = `Du er en erfaren norsk SEO-rådgiver som hjelper små, lokale bedrifter (frisører, salonger, enkeltpersonforetak) med å bli mer synlige i Google-søk.

Du skal lage en konkret, praktisk SEO-anbefaling. Vær spesifikk og lokal — tenk på hva ekte kunder faktisk søker etter. Unngå svada og generelle råd.

Svar KUN med gyldig JSON i dette formatet:
{
  "keywords": ["8–12 konkrete søkeord/fraser kunden bør satse på, inkl. stedsnavn der det passer"],
  "metaTitle": "Forslag til meta-tittel, maks 60 tegn, med viktigste søkeord",
  "metaDescription": "Forslag til meta-beskrivelse, 120–155 tegn, lokkende og med søkeord",
  "contentTips": ["4–6 konkrete råd om innhold på nettsiden/onepage som vil styrke synlighet"],
  "summary": "2–3 setningers oppsummering av SEO-situasjonen og viktigste grep"
}

Returner KUN JSON, ingen tekst rundt.`;

function buildUserPrompt(input: SeoInput): string {
  const parts: string[] = [];
  parts.push(`Bedrift: ${input.businessName}`);
  if (input.address) parts.push(`Adresse/sted: ${input.address}`);
  if (input.description) parts.push(`Beskrivelse: ${input.description}`);
  if (input.services.length)
    parts.push(`Behandlinger/tjenester: ${input.services.join(", ")}`);
  if (input.products.length)
    parts.push(`Produkter: ${input.products.join(", ")}`);
  if (input.audience) parts.push(`Målgruppe: ${input.audience}`);
  if (input.tone) parts.push(`Ønsket tone: ${input.tone}`);

  if (input.websiteTitle || input.websiteDescription || input.websiteText) {
    parts.push("\n--- Fra bedriftens nåværende nettside ---");
    if (input.websiteTitle) parts.push(`Tittel i dag: ${input.websiteTitle}`);
    if (input.websiteDescription)
      parts.push(`Meta-beskrivelse i dag: ${input.websiteDescription}`);
    if (input.websiteKeywords?.length)
      parts.push(`Hyppige ord på siden: ${input.websiteKeywords.join(", ")}`);
    if (input.websiteText)
      parts.push(`Utdrag av tekst:\n${input.websiteText.slice(0, 3000)}`);
  } else {
    parts.push(
      "\n(Bedriften har ikke analysert en nettside ennå — baser deg på opplysningene over.)",
    );
  }
  return parts.join("\n");
}

export async function generateSeo(
  input: SeoInput,
): Promise<{ result: SeoResult; costUsd: number }> {
  const { data, costUsd } = await generateJson<Omit<SeoResult, "generatedAt">>({
    system: SYSTEM_PROMPT,
    user: buildUserPrompt(input),
    maxTokens: 1500,
  });

  const parsed = parseSeoResult({
    ...data,
    generatedAt: new Date().toISOString(),
  });
  if (!parsed) {
    throw new Error("Svaret fra Claude manglet nødvendige felter.");
  }
  return { result: parsed, costUsd };
}
