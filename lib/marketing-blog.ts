// F3.7 — SEO-blogginnlegg-generator. Lager et komplett, SEO-optimalisert
// blogginnlegg som kan lagres rett inn i blogg-funksjonen (Fase 2).

import { generateJson } from "@/lib/anthropic";

export type GeneratedBlogPost = {
  title: string;
  metaDescription: string;
  content: string;
};

export type BlogInput = {
  businessName: string;
  description?: string;
  audience?: string;
  tone?: string;
  topic: string;
  seoKeywords?: string[];
  services: string[];
  products: string[];
  publicUrl?: string;
};

const SYSTEM_PROMPT = `Du er en erfaren norsk innholdsskribent som skriver SEO-optimaliserte blogginnlegg for små, lokale bedrifter (frisører, salonger, enkeltpersonforetak).

Skriv et blogginnlegg som er nyttig og ekte — ikke tynt «SEO-fyll». Det skal gi leseren konkret verdi og samtidig styrke bedriftens synlighet i Google.

Krav til innlegget:
- 400-700 ord, på norsk.
- Naturlig, lett tone. Skriv som et menneske, ikke en robot.
- Vev inn søkeordene naturlig — ikke proppfull.
- Tydelig struktur: fengende innledning, noen avsnitt med konkret innhold, og en avslutning med en mild oppfordring til å booke time / ta kontakt.
- Ren tekst — INGEN markdown, HTML eller spesialtegn. Avsnitt skilles med én blank linje. Eventuelle deloverskrifter skrives som en kort linje for seg selv.
- Første setning bør fungere godt som meta-beskrivelse.

Svar KUN med gyldig JSON:
{
  "title": "Fengende, søkeordrik tittel (maks ca. 60 tegn)",
  "metaDescription": "Meta-beskrivelse, 120-155 tegn",
  "content": "Hele innlegget som ren tekst, avsnitt skilt med blank linje (\\n\\n)"
}

Returner KUN JSON.`;

function buildUserPrompt(input: BlogInput): string {
  const parts: string[] = [];
  parts.push(`Bedrift: ${input.businessName}`);
  if (input.description) parts.push(`Om bedriften: ${input.description}`);
  if (input.services.length)
    parts.push(`Behandlinger: ${input.services.join(", ")}`);
  if (input.products.length)
    parts.push(`Produkter: ${input.products.join(", ")}`);
  if (input.audience) parts.push(`Målgruppe: ${input.audience}`);
  if (input.tone) parts.push(`Ønsket tone: ${input.tone}`);
  if (input.seoKeywords?.length)
    parts.push(`Søkeord å veve inn: ${input.seoKeywords.join(", ")}`);
  if (input.publicUrl)
    parts.push(`Bedriftens nettside (for booking): ${input.publicUrl}`);
  parts.push(`\nTema for blogginnlegget: ${input.topic}`);
  return parts.join("\n");
}

export async function generateBlogPost(
  input: BlogInput,
): Promise<{ result: GeneratedBlogPost; costUsd: number }> {
  const { data, costUsd } = await generateJson<Record<string, unknown>>({
    system: SYSTEM_PROMPT,
    user: buildUserPrompt(input),
    maxTokens: 2200,
  });

  const title = typeof data.title === "string" ? data.title.trim() : "";
  const content =
    typeof data.content === "string" ? data.content.trim() : "";
  const metaDescription =
    typeof data.metaDescription === "string"
      ? data.metaDescription.trim()
      : "";

  if (!title || content.length < 100) {
    throw new Error("Svaret fra Claude manglet tittel eller innhold.");
  }

  return {
    result: { title, content, metaDescription },
    costUsd,
  };
}
