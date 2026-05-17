"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { isDemoBusiness, requireBusinessId } from "@/lib/session";
import { DEMO_BLOCK_MESSAGE } from "@/lib/demo";
import { DEFAULT_THEME, isThemeId } from "@/lib/themes";
import type { OnepageContent } from "@/lib/onepage";

export type ProfileState = { error: string } | { ok: true } | undefined;

export async function updateBusinessProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const description = String(formData.get("description") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const themeInput = String(formData.get("template") ?? "");
  const template = isThemeId(themeInput) ? themeInput : DEFAULT_THEME;

  if (!name) return { error: "Bedriftsnavn er påkrevd." };
  if (!email.includes("@")) {
    return { error: "Fyll inn en gyldig e-postadresse." };
  }

  const field = (key: string) =>
    String(formData.get(key) ?? "").trim() || undefined;

  const onepageContent: OnepageContent = {
    social: {
      instagram: field("instagram"),
      facebook: field("facebook"),
      tiktok: field("tiktok"),
    },
    seo: {
      metaTitle: field("metaTitle"),
      metaDescription: field("metaDescription"),
      keywords: field("keywords"),
    },
    sections: {
      aboutText: field("aboutText"),
      showOpeningHours: formData.get("showOpeningHours") != null,
      showContactForm: formData.get("showContactForm") != null,
      showBlog: formData.get("showBlog") != null,
      showNewsletter: formData.get("showNewsletter") != null,
    },
    header: {
      tagline: field("tagline"),
    },
    footer: {
      orgNumber: field("orgNumber"),
      note: field("footerNote"),
    },
    media: {
      logoUrl: field("logoUrl"),
      gallery: formData
        .getAll("galleryImage")
        .map(String)
        .filter(Boolean),
    },
  };

  await db
    .update(businesses)
    .set({
      name,
      email,
      description: description || null,
      address: address || null,
      phone: phone || null,
      template,
      onepageContent,
    })
    .where(eq(businesses.id, businessId));

  revalidatePath("/admin/side");
  return { ok: true };
}
