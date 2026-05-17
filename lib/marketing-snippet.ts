// F3.7b — SEO-tekstsnippets. Genererer korte, SEO-optimaliserte tekster til
// ulike plasseringer (om-oss, ingress, meta, produkttekst, Google-profil,
// annonsetekst) — i flere varianter bedriften kan velge mellom.

import { generateJson } from "@/lib/anthropic";
import { getSnippetType } from "@/lib/snippet-types";

export type SnippetInput = {
  snippetTypeId: string;
  extraContext?: string;
  businessName: string;
  description?: string;
  address?: string;
  audience?: string;
  tone?: string;
  services: string[];
  products: string[];
  seoKeywords?: string[];
};

const SYSTEM_PROMPT = `Du er en erfaren norsk SEO-tekstforfatter for små, lokale bedrifter (frisører, salonger, enkeltpersonforetak).

Du skal skrive en kort tekst i ÉN bestemt sjanger. Teksten skal være naturlig og ekte — aldri stappfull av søkeord. Vev søkeordene inn der det glir fint. Treff tonen bedriften ønsker.

Lag TRE ulike varianter så bedriften kan velge. Variér vinkling og ordvalg — ikke tre nesten like tekster.

Svar KUN med gyldig JSON:
{
  "variants": ["Variant 1", "Variant 2", "Variant 3"]
}

Ren tekst i hver variant — ingen markdown. Returner KUN JSON.`;

function buildUserPrompt(input: SnippetInput): string {
  const type = getSnippetType(input.snippetTypeId);
  const parts: string[] = [];
  parts.push(
    `Sjanger: ${type?.label ?? input.snippetTypeId}`,
  );
  parts.push(`Krav: ${type?.guidance ?? "Kort SEO-tekst."}`);
  parts.push("");
  parts.push(`Bedrift: ${input.businessName}`);
  if (input.address) parts.push(`Sted: ${input.address}`);
  if (input.description) parts.push(`Om bedriften: ${input.description}`);
  if (input.services.length)
    parts.push(`Behandlinger: ${input.services.join(", ")}`);
  if (input.products.length)
    parts.push(`Produkter: ${input.products.join(", ")}`);
  if (input.audience) parts.push(`Målgruppe: ${input.audience}`);
  if (input.tone) parts.push(`Ønsket tone: ${input.tone}`);
  if (input.seoKeywords?.length)
    parts.push(`Søkeord å veve inn: ${input.seoKeywords.join(", ")}`);
  if (input.extraContext?.trim())
    parts.push(`\nEkstra fra bedriften: ${input.extraContext.trim()}`);
  return parts.join("\n");
}

export async function generateSnippets(
  input: SnippetInput,
): Promise<{ variants: string[]; costUsd: number }> {
  const { data, costUsd } = await generateJson<{ variants?: unknown }>({
    system: SYSTEM_PROMPT,
    user: buildUserPrompt(input),
    maxTokens: 1100,
  });

  const variants = Array.isArray(data.variants)
    ? data.variants
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

  if (variants.length === 0) {
    throw new Error("Svaret fra Claude inneholdt ingen tekster.");
  }
  return { variants, costUsd };
}
