import "server-only";
import Replicate from "replicate";

// Felles Replicate-klient for AI-bildegenerering (Fase 3, F3.6).
export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Flux Schnell — rask og billig (~$0.003 per bilde).
export const DEFAULT_IMAGE_MODEL = "black-forest-labs/flux-schnell";
export const IMAGE_COST_USD = 0.003;

export function hasReplicateToken(): boolean {
  return Boolean(process.env.REPLICATE_API_TOKEN);
}

export type ImageAspectRatio = "1:1" | "16:9" | "9:16" | "4:5" | "3:4";

export type ImageGenerationOptions = {
  prompt: string;
  aspectRatio?: ImageAspectRatio;
  numImages?: number;
};

// Henter ut en URL-streng fra et Replicate-output-element. I replicate@1.x
// kan elementer være enten en streng, et FileOutput-objekt med .url()-metode,
// eller en URL-instans. Vi støtter alle tre.
function itemToUrl(item: unknown): string | null {
  if (!item) return null;
  if (typeof item === "string") return item;
  if (item instanceof URL) return item.toString();
  const maybe = item as {
    url?: (() => URL | string) | URL | string;
  };
  if (typeof maybe.url === "function") {
    try {
      const u = maybe.url();
      return typeof u === "string" ? u : u.toString();
    } catch {
      return null;
    }
  }
  if (typeof maybe.url === "string") return maybe.url;
  if (maybe.url instanceof URL) return maybe.url.toString();
  return null;
}

// Genererer ett eller flere bilder og returnerer URL-er.
export async function generateImage(
  options: ImageGenerationOptions,
): Promise<string[]> {
  console.log(
    `[replicate] kjører ${DEFAULT_IMAGE_MODEL}, ratio=${options.aspectRatio ?? "1:1"}`,
  );
  const output = await replicate.run(DEFAULT_IMAGE_MODEL, {
    input: {
      prompt: options.prompt,
      aspect_ratio: options.aspectRatio ?? "1:1",
      num_outputs: options.numImages ?? 1,
      output_format: "webp",
      output_quality: 90,
    },
  });

  // Diagnostikk: vis hvilken form Replicate-svaret faktisk har, så vi
  // kan justere itemToUrl hvis SDK-en endrer kontrakt igjen.
  const outputType = Array.isArray(output)
    ? `array(${output.length})`
    : typeof output;
  console.log(`[replicate] output-type: ${outputType}`);

  const items: unknown[] = Array.isArray(output) ? output : [output];
  const urls = items
    .map(itemToUrl)
    .filter((u): u is string => typeof u === "string" && u.length > 0);
  console.log(`[replicate] hentet ut ${urls.length} URL(er)`);
  return urls;
}
