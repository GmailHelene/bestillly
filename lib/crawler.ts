// Nettside-crawler — henter bedriftens EGEN nettside og trekker ut tekst,
// tittel, beskrivelse og nøkkelord. Brukes som grunnlag for analyser i Fase 3.
// Ingen API-nøkler nødvendig.

import net from "node:net";
import { lookup } from "node:dns/promises";

const MAX_PAGES = 6;
const FETCH_TIMEOUT_MS = 8000;
const MAX_TEXT_LENGTH = 12000;
const MAX_REDIRECTS = 4;

// Robust URL-normalisering. Streamlit-appen feilet på markdown-limte lenker
// og adresser uten skjema — her håndterer vi begge deler.
export function normalizeUrl(input: string): string | null {
  if (!input || typeof input !== "string") return null;
  let s = input.trim();

  // Markdown-lenke: [tekst](url)
  const md = s.match(/\]\(([^)]+)\)/);
  if (md) s = md[1].trim();

  // Fjern omsluttende tegn — anførselstegn, vinkelparenteser og etterfølgende
  // skilletegn — gjentatte ganger til strengen er stabil. Håndterer også
  // sammensatte avslutninger som `."` eller `>.`.
  let prev = "";
  while (prev !== s) {
    prev = s;
    s = s
      .replace(/^[\s"'<(]+/, "")
      .replace(/[\s"'>).,;:!?]+$/, "");
  }

  if (!s) return null;

  // Mangler skjema → anta https
  if (!/^https?:\/\//i.test(s)) {
    s = s.replace(/^\/+/, "");
    s = "https://" + s;
  }

  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname.includes(".")) return null;
    u.hash = "";
    return u.toString();
  } catch {
    return null;
  }
}

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&aelig;": "æ",
  "&oslash;": "ø",
  "&aring;": "å",
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCodePoint(parseInt(h, 16)),
    )
    .replace(/&[a-z]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? " ");
}

function extractText(html: string): string {
  let s = html;
  s = s.replace(/<script[\s\S]*?<\/script>/gi, " ");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, " ");
  s = s.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  s = s.replace(/<!--[\s\S]*?-->/g, " ");
  s = s.replace(/<[^>]+>/g, " ");
  s = decodeEntities(s);
  return s.replace(/\s+/g, " ").trim();
}

function extractTitle(html: string): string | undefined {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) return undefined;
  const t = decodeEntities(m[1]).replace(/\s+/g, " ").trim();
  return t || undefined;
}

function extractMetaDescription(html: string): string | undefined {
  const m =
    html.match(
      /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i,
    ) ||
    html.match(
      /<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i,
    ) ||
    html.match(
      /<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']*)["']/i,
    );
  if (!m) return undefined;
  const d = decodeEntities(m[1]).replace(/\s+/g, " ").trim();
  return d || undefined;
}

const SKIP_LINK_EXT =
  /\.(pdf|jpe?g|png|gif|webp|svg|zip|docx?|xlsx?|mp4|mp3|css|js)$/i;

function extractInternalLinks(html: string, base: URL): string[] {
  const found = new Set<string>();
  const re = /<a\s[^>]*href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const href = m[1].trim();
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) {
      continue;
    }
    try {
      const u = new URL(href, base);
      if (u.hostname !== base.hostname) continue;
      if (u.protocol !== "http:" && u.protocol !== "https:") continue;
      if (SKIP_LINK_EXT.test(u.pathname)) continue;
      u.hash = "";
      u.search = "";
      found.add(u.toString());
    } catch {
      // ignorer ugyldige lenker
    }
  }
  return [...found];
}

// Norske og engelske stoppord — fjernes fra nøkkelord.
const STOPWORDS = new Set([
  "også","ikke","skal","være","blir","denne","dette","disse","etter",
  "eller","over","under","mellom","fordi","slik","samt","med","som","for",
  "til","den","det","har","var","kan","vil","ble","fra","her","der","når",
  "hvor","hva","hvem","alle","mange","mer","mest","noen","hvis","men",
  "and","the","with","that","this","you","your","are","our","was",
  "https","http","www","com","våre","vår","din","ditt","dine","deg","oss",
  "seg","kontakt","hjem","les","klikk","side","sider",
]);

function extractKeywords(text: string): string[] {
  const counts = new Map<string, number>();
  const words = text.toLowerCase().match(/[a-zæøå]{4,}/gi) ?? [];
  for (const w of words) {
    if (STOPWORDS.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([w]) => w);
}

// --- SSRF-vern: blokker interne/private adresser ---

function isBlockedIpv4(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return true; // ugyldig → blokker
  }
  const [a, b] = p;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true; // link-local / sky-metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 192 && b === 0) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a >= 224) return true; // multicast + reservert
  return false;
}

function isBlockedIpv6(ip: string): boolean {
  const h = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "::1" || h === "::") return true;
  if (h.startsWith("fe80") || h.startsWith("fc") || h.startsWith("fd")) {
    return true;
  }
  const mapped = h.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isBlockedIpv4(mapped[1]);
  return false;
}

// Eksportert for testing.
export function isBlockedIp(ip: string): boolean {
  const kind = net.isIP(ip);
  if (kind === 4) return isBlockedIpv4(ip);
  if (kind === 6) return isBlockedIpv6(ip);
  return true; // ikke en gyldig IP → blokker
}

// Tillates verten? IP-litteraler sjekkes direkte; domenenavn slås opp først.
async function isHostAllowed(hostname: string): Promise<boolean> {
  const h = hostname.replace(/\.+$/, "").toLowerCase();
  if (
    !h ||
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h.endsWith(".local") ||
    h.endsWith(".internal")
  ) {
    return false;
  }
  if (net.isIP(h)) return !isBlockedIp(h);
  try {
    const records = await lookup(h, { all: true });
    if (records.length === 0) return false;
    return records.every((r) => !isBlockedIp(r.address));
  } catch {
    return false;
  }
}

// Henter HTML, men avviser interne adresser — også via redirects.
async function fetchHtml(rawUrl: string): Promise<string | null> {
  let url = rawUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return null;
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    if (!(await isHostAllowed(parsed.hostname))) return null;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        redirect: "manual",
        headers: {
          "User-Agent": "bestilly-crawler/1.0 (+https://bestilly.no)",
          Accept: "text/html",
        },
      });
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) return null;
        url = new URL(location, url).toString();
        continue; // valider neste hopp på nytt
      }
      if (!res.ok) return null;
      const ct = res.headers.get("content-type") ?? "";
      if (!ct.includes("text/html") && ct !== "") return null;
      return await res.text();
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
  return null; // for mange redirects
}

export type WebsiteCrawl = {
  url: string;
  title?: string;
  description?: string;
  text: string;
  keywords: string[];
  pagesCrawled: number;
  crawledAt: string;
};

export type CrawlResult =
  | { ok: true; crawl: WebsiteCrawl }
  | { ok: false; error: string };

// Crawler bedriftens egen nettside: forsiden + noen interne undersider.
export async function crawlWebsite(rawUrl: string): Promise<CrawlResult> {
  const start = normalizeUrl(rawUrl);
  if (!start) {
    return { ok: false, error: "Ugyldig nettadresse. Sjekk at den er riktig." };
  }

  const startUrl = new URL(start);
  const firstHtml = await fetchHtml(start);
  if (firstHtml == null) {
    return {
      ok: false,
      error:
        "Klarte ikke å hente nettsiden. Sjekk at adressen er riktig og at siden er tilgjengelig.",
    };
  }

  const visited = new Set<string>([start]);
  const queue = extractInternalLinks(firstHtml, startUrl).filter(
    (u) => !visited.has(u),
  );

  let title = extractTitle(firstHtml);
  let description = extractMetaDescription(firstHtml);
  const textParts: string[] = [extractText(firstHtml)];
  let pagesCrawled = 1;

  for (const next of queue) {
    if (pagesCrawled >= MAX_PAGES) break;
    if (visited.has(next)) continue;
    visited.add(next);
    const html = await fetchHtml(next);
    if (html == null) continue;
    pagesCrawled++;
    if (!description) description = extractMetaDescription(html);
    textParts.push(extractText(html));
  }

  let text = textParts.join("\n\n").replace(/\s+\n/g, "\n").trim();
  if (text.length > MAX_TEXT_LENGTH) {
    text = text.slice(0, MAX_TEXT_LENGTH).trim();
  }

  if (text.length < 50) {
    return {
      ok: false,
      error:
        "Fant lite tekst på nettsiden. Den kan være bygget slik at innholdet ikke kan leses automatisk.",
    };
  }

  return {
    ok: true,
    crawl: {
      url: start,
      title,
      description,
      text,
      keywords: extractKeywords(text),
      pagesCrawled,
      crawledAt: new Date().toISOString(),
    },
  };
}
