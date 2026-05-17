export type ThemeId = "ren" | "eleganse" | "pulse";

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
    headingFont: "var(--font-geist-sans)",
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
  pulse: {
    id: "pulse",
    name: "Pulse",
    tagline: "Moderne og energisk",
    pageBg: "#f6f5ff",
    surface: "#ffffff",
    accent: "#6d28d9",
    accentSoft: "#ddd6fe",
    heroStyle: "gradient",
    heroGradient: "linear-gradient(135deg, #6d28d9, #9333ea)",
    headingFont: "var(--font-poppins)",
    radius: "rounded-2xl",
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
