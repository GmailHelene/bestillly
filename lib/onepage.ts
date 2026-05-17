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
  sections?: {
    aboutText?: string;
    showOpeningHours?: boolean;
    showContactForm?: boolean;
    showBlog?: boolean;
    showNewsletter?: boolean;
  };
  header?: {
    tagline?: string;
  };
  footer?: {
    orgNumber?: string;
    note?: string;
  };
  media?: {
    logoUrl?: string;
    gallery?: string[];
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
  const sections = (obj.sections ?? {}) as Record<string, unknown>;
  const header = (obj.header ?? {}) as Record<string, unknown>;
  const footer = (obj.footer ?? {}) as Record<string, unknown>;
  const media = (obj.media ?? {}) as Record<string, unknown>;
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
    sections: {
      aboutText: str(sections.aboutText),
      showOpeningHours: sections.showOpeningHours === true,
      showContactForm: sections.showContactForm === true,
      showBlog: sections.showBlog === true,
      showNewsletter: sections.showNewsletter === true,
    },
    header: {
      tagline: str(header.tagline),
    },
    footer: {
      orgNumber: str(footer.orgNumber),
      note: str(footer.note),
    },
    media: {
      logoUrl: str(media.logoUrl),
      gallery: Array.isArray(media.gallery)
        ? media.gallery.filter((x): x is string => typeof x === "string")
        : [],
    },
  };
}
