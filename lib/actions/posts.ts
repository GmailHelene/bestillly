"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { isDemoBusiness, requireBusinessId } from "@/lib/session";
import { DEMO_BLOCK_MESSAGE } from "@/lib/demo";
import { slugify } from "@/lib/slug";
import { sanitizeImageUrl } from "@/lib/cloudinary";

export type PostState = { error: string } | undefined;

function parsePost(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
    imageUrl: sanitizeImageUrl(String(formData.get("imageUrl") ?? "")),
    published: formData.get("published") != null,
  };
}

export async function createPost(
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };

  const { title, content, imageUrl, published } = parsePost(formData);
  if (!title) return { error: "Tittel er påkrevd." };
  if (!content) return { error: "Innhold er påkrevd." };

  // Finn en ledig innleggs-slug innenfor bedriften.
  const base = slugify(title);
  let slug = base;
  let suffix = 1;
  while (
    await db.query.posts.findFirst({
      where: and(eq(posts.businessId, businessId), eq(posts.slug, slug)),
    })
  ) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  await db
    .insert(posts)
    .values({ businessId, slug, title, content, imageUrl, published });
  revalidatePath("/admin/blogg");
  return undefined;
}

export async function updatePost(
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Mangler innleggs-ID." };

  const { title, content, imageUrl, published } = parsePost(formData);
  if (!title) return { error: "Tittel er påkrevd." };
  if (!content) return { error: "Innhold er påkrevd." };

  // Slug-en endres ikke ved redigering — så URL-en holder seg stabil.
  await db
    .update(posts)
    .set({ title, content, imageUrl, published })
    .where(and(eq(posts.id, id), eq(posts.businessId, businessId)));
  revalidatePath("/admin/blogg");
  return undefined;
}

export async function deletePost(formData: FormData) {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db
    .delete(posts)
    .where(and(eq(posts.id, id), eq(posts.businessId, businessId)));
  revalidatePath("/admin/blogg");
}
