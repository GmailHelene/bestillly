"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { isDemoBusiness, requireBusinessId } from "@/lib/session";
import { DEMO_BLOCK_MESSAGE } from "@/lib/demo";
import { sanitizeImageUrl } from "@/lib/cloudinary";

export type ProductState = { error: string } | undefined;

type ParsedProduct =
  | {
      ok: true;
      name: string;
      description: string | null;
      priceNok: number;
      imageUrl: string | null;
      inStock: boolean;
    }
  | { ok: false; error: string };

function parseProduct(formData: FormData): ParsedProduct {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceNok = Number(formData.get("priceNok"));
  const imageUrl = sanitizeImageUrl(String(formData.get("imageUrl") ?? ""));
  const inStock = formData.get("inStock") != null;

  if (!name) return { ok: false, error: "Navn er påkrevd." };
  if (!Number.isFinite(priceNok) || priceNok < 0) {
    return { ok: false, error: "Pris må være 0 eller mer." };
  }
  return {
    ok: true,
    name,
    description: description || null,
    priceNok: Math.round(priceNok),
    imageUrl,
    inStock,
  };
}

export async function createProduct(
  _prev: ProductState,
  formData: FormData,
): Promise<ProductState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };

  const parsed = parseProduct(formData);
  if (!parsed.ok) return { error: parsed.error };

  await db.insert(products).values({
    businessId,
    name: parsed.name,
    description: parsed.description,
    priceNok: parsed.priceNok,
    imageUrl: parsed.imageUrl,
    inStock: parsed.inStock,
  });
  revalidatePath("/admin/produkter");
  return undefined;
}

export async function updateProduct(
  _prev: ProductState,
  formData: FormData,
): Promise<ProductState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Mangler produkt-ID." };

  const parsed = parseProduct(formData);
  if (!parsed.ok) return { error: parsed.error };

  await db
    .update(products)
    .set({
      name: parsed.name,
      description: parsed.description,
      priceNok: parsed.priceNok,
      imageUrl: parsed.imageUrl,
      inStock: parsed.inStock,
    })
    .where(and(eq(products.id, id), eq(products.businessId, businessId)));
  revalidatePath("/admin/produkter");
  return undefined;
}

export async function deleteProduct(formData: FormData) {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db
    .delete(products)
    .where(and(eq(products.id, id), eq(products.businessId, businessId)));
  revalidatePath("/admin/produkter");
}
