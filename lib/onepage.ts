// Fleksibelt onepage-innhold lagret i businesses.onepageContent (jsonb).
export type OnepageContent = {
  social?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
};

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

// Leser onepage-innhold trygt fra et ukjent jsonb-objekt.
export function parseOnepageContent(raw: unknown): OnepageContent {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  const social = (obj.social ?? {}) as Record<string, unknown>;
  const seo = (obj.seo ?? {}) as Record<string, unknown>;
  return {
    social: {
      instagram: str(social.instagram),
      facebook: str(social.facebook),
      tiktok: str(social.tiktok),
    },
    seo: {
      metaTitle: str(seo.metaTitle),
      metaDescription: str(seo.metaDescription),
      keywords: str(seo.keywords),
    },
  };
}
