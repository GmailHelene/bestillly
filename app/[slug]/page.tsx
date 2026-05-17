import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses, services } from "@/db/schema";
import { resolveTheme } from "@/lib/themes";
import { parseOnepageContent } from "@/lib/onepage";
import { SocialLinks } from "@/components/social-links";
import { BookingWidget } from "./booking-widget";

async function getBusiness(slug: string) {
  return db.query.businesses.findFirst({ where: eq(businesses.slug, slug) });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusiness(slug);
  if (!business) return { title: "Siden finnes ikke" };

  const content = parseOnepageContent(business.onepageContent);
  const title =
    content.seo?.metaTitle ?? `${business.name} — bestill time`;
  const description =
    content.seo?.metaDescription ??
    business.description ??
    `Bestill time hos ${business.name} enkelt på nett.`;

  return {
    title,
    description,
    keywords: content.seo?.keywords,
    alternates: { canonical: `/${business.slug}` },
    openGraph: { title, description, type: "website" },
  };
}

export default async function PublicBusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await getBusiness(slug);
  if (!business) notFound();

  const serviceList = await db.query.services.findMany({
    where: and(
      eq(services.businessId, business.id),
      eq(services.active, true),
    ),
    orderBy: (s, { asc }) => [asc(s.createdAt)],
  });

  const theme = resolveTheme(business.template);
  const content = parseOnepageContent(business.onepageContent);
  const social = content.social ?? {};
  const hasSocial = !!(social.instagram || social.facebook || social.tiktok);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    url: `${baseUrl}/${business.slug}`,
    ...(business.description ? { description: business.description } : {}),
    ...(business.phone ? { telephone: business.phone } : {}),
    ...(business.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: business.address,
          },
        }
      : {}),
  };

  return (
    <div className="flex-1" style={{ backgroundColor: theme.pageBg }}>
      <main className="mx-auto w-full max-w-2xl space-y-8 px-5 py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <header className="space-y-2">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: theme.accent }}
          >
            {business.name}
          </h1>
        {business.description && (
          <p className="text-gray-600">{business.description}</p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
          {business.address && <span>{business.address}</span>}
          {business.phone && <span>{business.phone}</span>}
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Behandlinger</h2>
        {serviceList.length === 0 ? (
          <p className="text-sm text-gray-500">
            Ingen behandlinger er lagt ut ennå.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
            {serviceList.map((service) => (
              <li
                key={service.id}
                className="flex items-start justify-between gap-4 p-4"
              >
                <div>
                  <p className="font-medium">{service.name}</p>
                  {service.description && (
                    <p className="text-sm text-gray-500">
                      {service.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-400">
                    {service.durationMinutes} min
                  </p>
                </div>
                <span className="shrink-0 font-medium">
                  {service.priceNok} kr
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3 rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold">Bestill time</h2>
        <BookingWidget
          slug={business.slug}
          accentColor={theme.accent}
          services={serviceList.map((s) => ({
            id: s.id,
            name: s.name,
            durationMinutes: s.durationMinutes,
          }))}
        />
      </section>

      {hasSocial && (
        <footer className="flex flex-col items-center gap-3 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">Følg oss</p>
          <SocialLinks social={social} />
        </footer>
      )}
      </main>
    </div>
  );
}
