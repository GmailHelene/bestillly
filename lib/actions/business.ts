"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { signOut } from "@/auth";
import { isDemoBusiness, requireBusinessId } from "@/lib/session";
import { DEMO_BLOCK_MESSAGE } from "@/lib/demo";
import { DEFAULT_THEME, isThemeId } from "@/lib/themes";
import { sanitizeImageUrl } from "@/lib/cloudinary";
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
      logoUrl: sanitizeImageUrl(field("logoUrl")) ?? undefined,
      gallery: formData
        .getAll("galleryImage")
        .map(String)
        .map((u) => sanitizeImageUrl(u))
        .filter((u): u is string => u !== null),
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

export type DeleteAccountState = { error: string } | undefined;

// Sletter bedriftens konto og ALLE tilhørende data (cascade i schemaet),
// og logger brukeren ut. Krever at brukeren skriver «SLETT» for å bekrefte.
export async function deleteBusinessAccount(
  _prev: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };

  const confirm = String(formData.get("confirm") ?? "").trim();
  if (confirm !== "SLETT") {
    return { error: "Skriv SLETT i feltet for å bekrefte." };
  }

  // Cascade-sletting i schemaet fjerner brukere, behandlinger, bookinger,
  // produkter, ordrer, innlegg, abonnenter og nyhetsbrev automatisk.
  await db.delete(businesses).where(eq(businesses.id, businessId));
  await signOut({ redirectTo: "/" });
  return undefined;
}
