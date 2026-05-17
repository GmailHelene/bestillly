"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { isDemoBusiness, requireBusinessId } from "@/lib/session";
import { DEMO_BLOCK_MESSAGE } from "@/lib/demo";

export type ShopSettingsState =
  | { error: string }
  | { ok: true }
  | undefined;

export async function updateShopSettings(
  _prev: ShopSettingsState,
  formData: FormData,
): Promise<ShopSettingsState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };

  const vippsNumber = String(formData.get("vippsNumber") ?? "").trim();
  const shippingFree = formData.get("shippingFree") != null;
  const feeInput = Number(formData.get("shippingFee"));
  const shippingFee =
    Number.isFinite(feeInput) && feeInput >= 0 ? Math.round(feeInput) : 99;
  const shippingLabel = String(formData.get("shippingLabel") ?? "").trim();

  await db
    .update(businesses)
    .set({
      vippsNumber: vippsNumber || null,
      shippingFree,
      shippingFee,
      shippingLabel: shippingLabel || null,
    })
    .where(eq(businesses.id, businessId));

  revalidatePath("/admin/produkter");
  return { ok: true };
}
