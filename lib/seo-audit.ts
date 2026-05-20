// SEO-revisjon av bedriftens bestilly-side. Ren analyse av data bestilly
// allerede har — ingen API-nøkler, ingen crawling. Gir en score og konkrete
// råd gruppert i kategorier.

export type AuditStatus = "pass" | "warn" | "fail";

export type AuditItem = {
  id: string;
  category: string;
  label: string;
  status: AuditStatus;
  advice: string;
};

export type SeoAuditResult = {
  score: number;
  items: AuditItem[];
};

export type SeoAuditInput = {
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  aboutText?: string;
  logoUrl?: string;
  galleryCount: number;
  serviceCount: number;
  hasOpeningHours: boolean;
  publishedPostCount: number;
  hasMarketingSeo: boolean;
};

const CAT_BASIC = "Grunnleggende SEO";
const CAT_CONTENT = "Innhold";
const CAT_LOCAL = "Lokal SEO";
const CAT_TECH = "Teknisk (håndteres av Bestilly)";

export function auditSeo(input: SeoAuditInput): SeoAuditResult {
  const items: AuditItem[] = [];
  const add = (
    id: string,
    category: string,
    label: string,
    status: AuditStatus,
    advice: string,
  ) => items.push({ id, category, label, status, advice });

  // --- Grunnleggende SEO ---
  const metaTitle = input.metaTitle?.trim() ?? "";
  if (!metaTitle) {
    add(
      "metaTitle",
      CAT_BASIC,
      "Egen meta-tittel",
      "warn",
      "Bestilly lager en standard tittel, men en egen, søkeordrik tittel (30–60 tegn) gir bedre treff. Fyll inn under «Min side» → SEO.",
    );
  } else if (metaTitle.length < 30 || metaTitle.length > 60) {
    add(
      "metaTitle",
      CAT_BASIC,
      "Egen meta-tittel",
      "warn",
      `Meta-tittelen er ${metaTitle.length} tegn. Ideelt er 30–60 tegn — da vises hele i Google.`,
    );
  } else {
    add("metaTitle", CAT_BASIC, "Egen meta-tittel", "pass", "Tittelen har god lengde.");
  }

  const metaDesc = input.metaDescription?.trim() ?? "";
  if (!metaDesc) {
    add(
      "metaDescription",
      CAT_BASIC,
      "Meta-beskrivelse",
      "fail",
      "Meta-beskrivelsen er teksten under tittelen i Google-treffet. Skriv 50–160 tegn som lokker til klikk. Fyll inn under «Min side» → SEO.",
    );
  } else if (metaDesc.length < 50 || metaDesc.length > 160) {
    add(
      "metaDescription",
      CAT_BASIC,
      "Meta-beskrivelse",
      "warn",
      `Meta-beskrivelsen er ${metaDesc.length} tegn. Sikt på 50–160 tegn.`,
    );
  } else {
    add(
      "metaDescription",
      CAT_BASIC,
      "Meta-beskrivelse",
      "pass",
      "Beskrivelsen har god lengde.",
    );
  }

  add(
    "keywords",
    CAT_BASIC,
    "Søkeord fylt ut",
    input.keywords?.trim() ? "pass" : "warn",
    input.keywords?.trim()
      ? "Søkeord er fylt ut."
      : "Legg inn relevante søkeord — gjerne med stedsnavn. SEO-generatoren i Markedsføring kan foreslå dem.",
  );

  add(
    "marketingSeo",
    CAT_BASIC,
    "SEO-anbefaling kjørt",
    input.hasMarketingSeo ? "pass" : "warn",
    input.hasMarketingSeo
      ? "Du har kjørt SEO-generatoren."
      : "Kjør SEO-generatoren under Markedsføring for skreddersydde søkeord og forslag til meta-tekst.",
  );

  // --- Innhold ---
  const desc = input.description?.trim() ?? "";
  if (!desc) {
    add(
      "description",
      CAT_CONTENT,
      "Bedriftsbeskrivelse",
      "fail",
      "Siden mangler en beskrivelse av bedriften. Skriv noen setninger om hva dere tilbyr.",
    );
  } else if (desc.length < 60) {
    add(
      "description",
      CAT_CONTENT,
      "Bedriftsbeskrivelse",
      "warn",
      "Beskrivelsen er ganske kort. Litt mer tekst gir Google mer å gå etter.",
    );
  } else {
    add("description", CAT_CONTENT, "Bedriftsbeskrivelse", "pass", "Beskrivelsen er på plass.");
  }

  if (input.serviceCount === 0) {
    add(
      "services",
      CAT_CONTENT,
      "Behandlinger lagt inn",
      "fail",
      "Legg inn behandlingene dine — hver behandling er innhold Google kan vise.",
    );
  } else if (input.serviceCount < 3) {
    add(
      "services",
      CAT_CONTENT,
      "Behandlinger lagt inn",
      "warn",
      `Du har ${input.serviceCount} behandling(er). Flere behandlinger med beskrivelse gir mer innhold.`,
    );
  } else {
    add("services", CAT_CONTENT, "Behandlinger lagt inn", "pass", `${input.serviceCount} behandlinger er lagt inn.`);
  }

  add(
    "aboutText",
    CAT_CONTENT,
    "«Om oss»-tekst",
    input.aboutText?.trim() ? "pass" : "warn",
    input.aboutText?.trim()
      ? "«Om oss»-teksten er fylt ut."
      : "En «om oss»-tekst gir både kunder og Google mer kontekst om bedriften.",
  );

  const hasImages = Boolean(input.logoUrl) || input.galleryCount > 0;
  add(
    "images",
    CAT_CONTENT,
    "Bilder på siden",
    hasImages ? "pass" : "warn",
    hasImages
      ? "Siden har bilder."
      : "Legg til logo og noen bilder — det løfter både inntrykk og synlighet.",
  );

  add(
    "blog",
    CAT_CONTENT,
    "Blogginnlegg publisert",
    input.publishedPostCount > 0 ? "pass" : "warn",
    input.publishedPostCount > 0
      ? `${input.publishedPostCount} publisert(e) innlegg gir Google ferskt innhold.`
      : "Blogginnlegg gir nye sider Google kan vise. Blogggeneratoren under Markedsføring kan hjelpe deg i gang.",
  );

  // --- Lokal SEO ---
  add(
    "address",
    CAT_LOCAL,
    "Adresse fylt ut",
    input.address?.trim() ? "pass" : "fail",
    input.address?.trim()
      ? "Adressen er på plass — viktig for lokale søk."
      : "Adresse er avgjørende for å bli funnet i lokale søk og på kart. Fyll den inn.",
  );

  add(
    "phone",
    CAT_LOCAL,
    "Telefonnummer fylt ut",
    input.phone?.trim() ? "pass" : "warn",
    input.phone?.trim()
      ? "Telefonnummer er fylt ut."
      : "Et telefonnummer gjør bedriften mer troverdig og lettere å kontakte.",
  );

  add(
    "openingHours",
    CAT_LOCAL,
    "Åpningstider satt opp",
    input.hasOpeningHours ? "pass" : "warn",
    input.hasOpeningHours
      ? "Åpningstidene er satt opp."
      : "Sett opp åpningstider — det vises på siden og er nyttig for lokale søk.",
  );

  // --- Teknisk (Bestilly ordner dette automatisk) ---
  add("https", CAT_TECH, "Sikker tilkobling (HTTPS)", "pass", "Bestilly leverer siden over HTTPS automatisk.");
  add("mobile", CAT_TECH, "Mobilvennlig", "pass", "Siden er responsiv og fungerer på mobil automatisk.");
  add("sitemap", CAT_TECH, "Sitemap og robots.txt", "pass", "Bestilly genererer sitemap og robots.txt automatisk.");
  add(
    "structuredData",
    CAT_TECH,
    "Strukturerte data",
    "pass",
    "Bestilly legger inn strukturerte data (JSON-LD) for bedrift og blogginnlegg automatisk.",
  );

  const points = items.reduce(
    (sum, it) => sum + (it.status === "pass" ? 1 : it.status === "warn" ? 0.5 : 0),
    0,
  );
  const score = Math.round((points / items.length) * 100);

  return { score, items };
}
