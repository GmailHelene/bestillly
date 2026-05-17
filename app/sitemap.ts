import type { MetadataRoute } from "next";
import { db } from "@/db";
import { businesses } from "@/db/schema";

// Regenereres hver time så nye bedrifter kommer med i sitemap.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const all = await db.query.businesses.findMany({
    columns: { slug: true },
  });

  return [
    { url: baseUrl, lastModified: new Date() },
    ...all.map((b) => ({
      url: `${baseUrl}/${b.slug}`,
      lastModified: new Date(),
    })),
  ];
}
