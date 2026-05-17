"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { requireBusinessId } from "@/lib/session";

export type ProfileState = { error: string } | { ok: true } | undefined;

export async function updateBusinessProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const businessId = await requireBusinessId();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name) return { error: "Bedriftsnavn er påkrevd." };

  await db
    .update(businesses)
    .set({
      name,
      description: description || null,
      address: address || null,
      phone: phone || null,
    })
    .where(eq(businesses.id, businessId));

  revalidatePath("/admin/side");
  return { ok: true };
}
