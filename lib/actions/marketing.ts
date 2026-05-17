"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { isDemoBusiness, requireBusinessId } from "@/lib/session";
import { DEMO_BLOCK_MESSAGE } from "@/lib/demo";
import { MARKETING_CHANNELS, type MarketingProfile } from "@/lib/marketing";

export type MarketingProfileState =
  | { error: string }
  | { ok: true }
  | undefined;

export async function updateMarketingProfile(
  _prev: MarketingProfileState,
  formData: FormData,
): Promise<MarketingProfileState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };

  const audience = String(formData.get("audience") ?? "").trim();
  const tone = String(formData.get("tone") ?? "").trim();
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim();
  const budgetRaw = Number(formData.get("budgetNok"));
  const budgetNok =
    Number.isFinite(budgetRaw) && budgetRaw > 0
      ? Math.round(budgetRaw)
      : undefined;
  const channels = MARKETING_CHANNELS.map((c) => c.id).filter(
    (id) => formData.get(`channel-${id}`) != null,
  );

  const marketingProfile: MarketingProfile = {
    audience: audience || undefined,
    tone: tone || undefined,
    budgetNok,
    websiteUrl: websiteUrl || undefined,
    channels,
  };

  await db
    .update(businesses)
    .set({ marketingProfile })
    .where(eq(businesses.id, businessId));
  revalidatePath("/admin/markedsforing");
  return { ok: true };
}
