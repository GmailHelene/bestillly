// Typer korte SEO-tekster bedriften kan generere (F3.7b).
// Ren data — ingen importer, trygg å bruke i klient-komponenter.

export const SNIPPET_TYPES = [
  {
    id: "about",
    label: "Om oss-tekst",
    guidance:
      "En kort, varm og tillitsvekkende presentasjon av bedriften. 60-100 ord.",
    placeholder: "Noe spesielt du vil ha med? (valgfritt)",
  },
  {
    id: "hero",
    label: "Ingress / hero-tekst",
    guidance:
      "Én slående setning eller to, til toppen av nettsiden. Kort og fengende, 15-30 ord.",
    placeholder: "Hva vil du fremheve? (valgfritt)",
  },
  {
    id: "meta",
    label: "Meta-beskrivelse",
    guidance:
      "Tekst som vises i Google-treff. Lokkende og søkeordrik, 120-155 tegn.",
    placeholder: "Hvilken side gjelder det? (valgfritt)",
  },
  {
    id: "product",
    label: "Produkt-/behandlingstekst",
    guidance:
      "En selgende, konkret beskrivelse av et produkt eller en behandling. 40-80 ord.",
    placeholder: "Hvilket produkt/behandling? (anbefalt)",
  },
  {
    id: "google",
    label: "Google-bedriftsprofil",
    guidance:
      "Beskrivelse til Google-bedriftsprofilen. Lokal, søkeordrik og informativ, 100-200 ord.",
    placeholder: "Noe spesielt du vil ha med? (valgfritt)",
  },
  {
    id: "ad",
    label: "Kort annonsetekst",
    guidance:
      "Fengende annonsetekst med tydelig oppfordring. 1-2 setninger.",
    placeholder: "Hva skal annonsen handle om? (anbefalt)",
  },
] as const;

export type SnippetTypeId = (typeof SNIPPET_TYPES)[number]["id"];

export function getSnippetType(id: string) {
  return SNIPPET_TYPES.find((t) => t.id === id);
}
