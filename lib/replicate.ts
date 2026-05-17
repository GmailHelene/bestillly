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

// Genererer ett eller flere bilder og returnerer URL-er.
export async function generateImage(
  options: ImageGenerationOptions,
): Promise<string[]> {
  const output = await replicate.run(DEFAULT_IMAGE_MODEL, {
    input: {
      prompt: options.prompt,
      aspect_ratio: options.aspectRatio ?? "1:1",
      num_outputs: options.numImages ?? 1,
      output_format: "webp",
      output_quality: 90,
    },
  });

  if (Array.isArray(output)) {
    return output.map((item) =>
      typeof item === "string"
        ? item
        : (item as { url: () => URL }).url().toString(),
    );
  }
  return [];
}
