import "server-only";
import { headers } from "next/headers";

// Enkel rate-limiting i minnet. Holder for én app-instans (Railway kjører
// typisk én) — beskytter mot brute-force og skjema-spam. Nullstilles ved
// ny deploy, og deles ikke mellom flere instanser.

const hits = new Map<string, number[]>();

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "ukjent"
  );
}

// Returnerer true hvis forespørselen er innenfor grensen, false hvis ikke.
export async function rateLimit(
  scope: string,
  max: number,
  windowMs: number,
): Promise<boolean> {
  const now = Date.now();
  const key = `${scope}:${await clientIp()}`;
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);

  // Lett opprydding så kartet ikke vokser i det uendelige.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }
  return true;
}

export const RATE_LIMIT_MESSAGE =
  "For mange forsøk på kort tid. Vent et minutt og prøv igjen.";
