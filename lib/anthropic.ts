import Anthropic from "@anthropic-ai/sdk";

// Felles Anthropic-klient for markedsføringshuben (Fase 3).
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Sonnet gir god balanse mellom kvalitet og kostnad for tekstgenerering.
export const DEFAULT_MODEL = "claude-sonnet-4-6";

// Pris per million tokens (USD). Oppdater hvis Anthropic endrer priser.
export const MODEL_PRICING = {
  "claude-sonnet-4-6": { input: 3.0, output: 15.0 },
  "claude-opus-4-7": { input: 15.0, output: 75.0 },
  "claude-haiku-4-5-20251001": { input: 1.0, output: 5.0 },
} as const;

export type ModelName = keyof typeof MODEL_PRICING;

export function calculateCost(
  model: ModelName,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 0;
  return (
    (inputTokens / 1_000_000) * pricing.input +
    (outputTokens / 1_000_000) * pricing.output
  );
}

export function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// Henter JSON ut av et Claude-svar — tåler at svaret er pakket i ```json ... ```.
export function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  const raw = (fenced ? fenced[1] : text).trim();
  return JSON.parse(raw) as T;
}

export type ClaudeJsonResult<T> = {
  data: T;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
};

// Kjører en JSON-generering mot Claude og returnerer parset data + forbruk.
export async function generateJson<T>(opts: {
  system: string;
  user: string;
  maxTokens?: number;
  model?: ModelName;
}): Promise<ClaudeJsonResult<T>> {
  const model = opts.model ?? (DEFAULT_MODEL as ModelName);
  const response = await anthropic.messages.create({
    model,
    max_tokens: opts.maxTokens ?? 2048,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  });

  const text = response.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("");

  let data: T;
  try {
    data = extractJson<T>(text);
  } catch (err) {
    throw new Error(
      `Klarte ikke å tolke svaret fra Claude: ${(err as Error).message}`,
    );
  }

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  return {
    data,
    inputTokens,
    outputTokens,
    costUsd: calculateCost(model, inputTokens, outputTokens),
  };
}
