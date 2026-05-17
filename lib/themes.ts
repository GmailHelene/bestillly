export type ThemeId = "lys" | "varm" | "skog";

export type Theme = {
  id: ThemeId;
  name: string;
  pageBg: string;
  accent: string;
};

export const THEMES: Record<ThemeId, Theme> = {
  lys: { id: "lys", name: "Lys", pageBg: "#ffffff", accent: "#171717" },
  varm: { id: "varm", name: "Varm", pageBg: "#fffaf3", accent: "#b45309" },
  skog: { id: "skog", name: "Skog", pageBg: "#f5faf5", accent: "#15803d" },
};

export const DEFAULT_THEME: ThemeId = "lys";

export function isThemeId(value: string): value is ThemeId {
  return value in THEMES;
}

export function resolveTheme(template: string | null | undefined): Theme {
  if (template && isThemeId(template)) return THEMES[template];
  return THEMES[DEFAULT_THEME];
}
