import type { MetadataRoute } from "next";
import { db } from "@/db";
import { businesses } from "@/db/schema";

// Genereres ved forespørsel (ikke ved bygging) — så den slipper å nå
// databasen under deploy, og alltid har ferske bedrifter med.
export const dynamic = "force-dynamic";

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
