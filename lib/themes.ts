export type ThemeId =
  | "ren"
  | "eleganse"
  | "botanisk"
  | "rose"
  | "marine"
  | "plomme"
  | "gull"
  | "skifer";

export type HeroStyle = "minimal" | "band" | "gradient";

export type Theme = {
  id: ThemeId;
  name: string;
  tagline: string;
  pageBg: string;
  surface: string;
  accent: string;
  accentSoft: string;
  heroStyle: HeroStyle;
  heroGradient: string;
  headingFont: string;
  radius: string;
};

export const THEMES: Record<ThemeId, Theme> = {
  ren: {
    id: "ren",
    name: "Ren",
    tagline: "Minimalistisk og luftig",
    pageBg: "#ffffff",
    surface: "#ffffff",
    accent: "#171717",
    accentSoft: "#f3f3f3",
    heroStyle: "minimal",
    heroGradient: "linear-gradient(135deg, #171717, #404040)",
    headingFont: "var(--font-cormorant)",
    radius: "rounded-xl",
  },
  eleganse: {
    id: "eleganse",
    name: "Eleganse",
    tagline: "Varm og elegant — serif-skrift",
    pageBg: "#fbf7f2",
    surface: "#ffffff",
    accent: "#a8654a",
    accentSoft: "#f1e4da",
    heroStyle: "band",
    heroGradient: "linear-gradient(135deg, #a8654a, #c98a64)",
    headingFont: "var(--font-playfair)",
    radius: "rounded-2xl",
  },
  botanisk: {
    id: "botanisk",
    name: "Botanisk",
    tagline: "Frisk og naturlig",
    pageBg: "#f3f7f3",
    surface: "#ffffff",
    accent: "#3f6b52",
    accentSoft: "#dde9de",
    heroStyle: "minimal",
    heroGradient: "linear-gradient(135deg, #3f6b52, #5c8a6e)",
    headingFont: "var(--font-poppins)",
    radius: "rounded-2xl",
  },
  rose: {
    id: "rose",
    name: "Rosé",
    tagline: "Myk og innbydende — serif-skrift",
    pageBg: "#fdf5f4",
    surface: "#ffffff",
    accent: "#b06b76",
    accentSoft: "#f3e0e3",
    heroStyle: "band",
    heroGradient: "linear-gradient(135deg, #b06b76, #c98e97)",
    headingFont: "var(--font-playfair)",
    radius: "rounded-2xl",
  },
  marine: {
    id: "marine",
    name: "Marine",
    tagline: "Rolig og stilren",
    pageBg: "#f5f7f9",
    surface: "#ffffff",
    accent: "#3c5168",
    accentSoft: "#e2e8ef",
    heroStyle: "minimal",
    heroGradient: "linear-gradient(135deg, #3c5168, #5a728c)",
    headingFont: "var(--font-fraunces)",
    radius: "rounded-xl",
  },
  plomme: {
    id: "plomme",
    name: "Plomme",
    tagline: "Dyp og elegant — serif-skrift",
    pageBg: "#faf6f8",
    surface: "#ffffff",
    accent: "#6d4360",
    accentSoft: "#ece1e8",
    heroStyle: "gradient",
    heroGradient: "linear-gradient(135deg, #6d4360, #9a6b8c)",
    headingFont: "var(--font-cormorant)",
    radius: "rounded-2xl",
  },
  gull: {
    id: "gull",
    name: "Gull",
    tagline: "Varm champagne — eksklusiv ro",
    pageBg: "#faf7f0",
    surface: "#ffffff",
    accent: "#9a7b3f",
    accentSoft: "#ede3cb",
    heroStyle: "band",
    heroGradient: "linear-gradient(135deg, #9a7b3f, #c0a05f)",
    headingFont: "var(--font-fraunces)",
    radius: "rounded-2xl",
  },
  skifer: {
    id: "skifer",
    name: "Skifer",
    tagline: "Stram og arkitektonisk",
    pageBg: "#f4f5f6",
    surface: "#ffffff",
    accent: "#2f3a44",
    accentSoft: "#e0e3e6",
    heroStyle: "gradient",
    heroGradient: "linear-gradient(135deg, #2f3a44, #54616c)",
    headingFont: "var(--font-cormorant)",
    radius: "rounded-xl",
  },
};

export const DEFAULT_THEME: ThemeId = "ren";

export function isThemeId(value: string): value is ThemeId {
  return value in THEMES;
}

export function resolveTheme(template: string | null | undefined): Theme {
  if (template && isThemeId(template)) return THEMES[template];
  return THEMES[DEFAULT_THEME];
}
