import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses, posts } from "@/db/schema";

// Genereres ved forespørsel (ikke ved bygging) — så den slipper å nå
// databasen under deploy, og alltid har ferske bedrifter/innlegg med.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const allBusinesses = await db.query.businesses.findMany({
    columns: { id: true, slug: true },
  });
  const slugById = new Map(allBusinesses.map((b) => [b.id, b.slug]));

  const allPosts = await db.query.posts.findMany({
    where: eq(posts.published, true),
    columns: { businessId: true, slug: true },
  });

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/bookingsystem`, lastModified: new Date() },
    ...allBusinesses.map((b) => ({
      url: `${baseUrl}/${b.slug}`,
      lastModified: new Date(),
    })),
    ...allPosts
      .filter((p) => slugById.has(p.businessId))
      .map((p) => ({
        url: `${baseUrl}/${slugById.get(p.businessId)}/${p.slug}`,
        lastModified: new Date(),
      })),
  ];
}
