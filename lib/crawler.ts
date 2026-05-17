// Nettside-crawler — henter bedriftens EGEN nettside og trekker ut tekst,
// tittel, beskrivelse og nøkkelord. Brukes som grunnlag for analyser i Fase 3.
// Ingen API-nøkler nødvendig.

const MAX_PAGES = 6;
const FETCH_TIMEOUT_MS = 8000;
const MAX_TEXT_LENGTH = 12000;

// Robust URL-normalisering. Streamlit-appen feilet på markdown-limte lenker
// og adresser uten skjema — her håndterer vi begge deler.
export function normalizeUrl(input: string): string | null {
  if (!input || typeof input !== "string") return null;
  let s = input.trim();

  // Markdown-lenke: [tekst](url)
  const md = s.match(/\]\(([^)]+)\)/);
  if (md) s = md[1].trim();

  // Vinkelparenteser: <url>
  s = s.replace(/^<+/, "").replace(/>+$/, "").trim();
  // Omsluttende anførselstegn
  s = s.replace(/^["']+/, "").replace(/["']+$/, "").trim();
  // Etterfølgende skilletegn
  s = s.replace(/[.,;:!?]+$/, "").trim();

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
  "også","ikke","skal","være","være","blir","være","være","denne","dette",
  "disse","etter","eller","over","under","mellom","fordi","slik","samt",
  "med","som","for","til","den","det","har","var","kan","vil","ble","fra",
  "her","der","når","hvor","hva","hvem","alle","mange","mer","mest","noen",
  "hvis","men","and","the","for","with","that","this","you","your","are",
  "our","was","https","http","www","com","våre","vår","din","ditt","dine",
  "deg","oss","seg","kontakt","hjem","mer","les","klikk","side","sider",
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

async function fetchHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "bestilly-crawler/1.0 (+https://bestilly.no)",
        Accept: "text/html",
      },
    });
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
