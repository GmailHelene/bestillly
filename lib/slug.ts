// Slugs som ikke kan brukes av bedrifter — de kolliderer med appens egne ruter.
export const RESERVED_SLUGS = new Set([
  "admin",
  "login",
  "logout",
  "registrer",
  "avbestill",
  "avmeld",
  "kontakt",
  "personvern",
  "vilkar",
  "drift",
  "api",
  "_next",
  "static",
  "public",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "demo",
]);

export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  return slug || "bedrift";
}
