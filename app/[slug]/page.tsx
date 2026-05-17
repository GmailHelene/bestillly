import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses, posts, products, services, workingHours } from "@/db/schema";
import { resolveTheme } from "@/lib/themes";
import { parseOnepageContent } from "@/lib/onepage";
import { OnepageHero } from "@/components/onepage-hero";
import { OnepageFooter } from "@/components/onepage-footer";
import { BookingWidget } from "./booking-widget";
import { Shop } from "./shop";
import { ContactSection } from "./contact-section";
import { NewsletterSignup } from "./newsletter-signup";

const WEEKDAYS: [number, string][] = [
  [1, "Mandag"],
  [2, "Tirsdag"],
  [3, "Onsdag"],
  [4, "Torsdag"],
  [5, "Fredag"],
  [6, "Lørdag"],
  [7, "Søndag"],
];

// cache() dedupliserer kallet — generateMetadata og siden deler ett oppslag.
const getBusiness = cache(async (slug: string) => {
  return db.query.businesses.findFirst({ where: eq(businesses.slug, slug) });
});

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

  if (business.status === "paused") {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Siden er midlertidig utilgjengelig
          </h1>
          <p className="mt-3 text-gray-600">
            Denne siden er for øyeblikket ikke tilgjengelig for booking. Ta
            gjerne kontakt med {business.name} direkte.
          </p>
        </div>
      </div>
    );
  }

  const serviceList = await db.query.services.findMany({
    where: and(
      eq(services.businessId, business.id),
      eq(services.active, true),
    ),
    orderBy: (s, { asc }) => [asc(s.createdAt)],
  });

  const productList = await db.query.products.findMany({
    where: eq(products.businessId, business.id),
    orderBy: (p, { asc }) => [asc(p.createdAt)],
  });

  const postList = await db.query.posts.findMany({
    where: and(
      eq(posts.businessId, business.id),
      eq(posts.published, true),
    ),
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });

  const theme = resolveTheme(business.template);
  const content = parseOnepageContent(business.onepageContent);
  const social = content.social ?? {};
  const tagline = content.header?.tagline;
  const logoUrl = content.media?.logoUrl;
  const gallery = content.media?.gallery ?? [];
  const aboutText = content.sections?.aboutText;
  const showOpeningHours = content.sections?.showOpeningHours ?? false;
  const showContactForm = content.sections?.showContactForm ?? false;
  const showBlog = content.sections?.showBlog ?? false;
  const showNewsletter = content.sections?.showNewsletter ?? false;
  const hours = showOpeningHours
    ? await db.query.workingHours.findMany({
        where: eq(workingHours.businessId, business.id),
      })
    : [];
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
      <main className="mx-auto w-full max-w-4xl space-y-8 px-5 py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <OnepageHero
          business={business}
          theme={theme}
          tagline={tagline}
          logoUrl={logoUrl}
        />

      {aboutText && (
        <section className="space-y-2">
          <h2
          className="text-lg font-semibold"
          style={{ fontFamily: theme.headingFont }}
        >Om oss</h2>
          <p className="whitespace-pre-line text-gray-600">{aboutText}</p>
        </section>
      )}

      <section className="space-y-3">
        <h2
          className="text-lg font-semibold"
          style={{ fontFamily: theme.headingFont }}
        >Behandlinger</h2>
        {serviceList.length === 0 ? (
          <p className="text-sm text-gray-500">
            Ingen behandlinger er lagt ut ennå.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {serviceList.map((service) => (
              <div
                key={service.id}
                className={`flex items-start justify-between gap-4 border border-gray-200 bg-white p-4 ${theme.radius}`}
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
              </div>
            ))}
          </div>
        )}
      </section>

      {gallery.length > 0 && (
        <section className="space-y-3">
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: theme.headingFont }}
          >
            Bilder
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt=""
                className={`aspect-square w-full object-cover ${theme.radius}`}
              />
            ))}
          </div>
        </section>
      )}

      {showOpeningHours && (
        <section className="space-y-3">
          <h2
          className="text-lg font-semibold"
          style={{ fontFamily: theme.headingFont }}
        >Åpningstider</h2>
          <ul
            className={`max-w-md divide-y divide-gray-200 border border-gray-200 bg-white ${theme.radius}`}
          >
            {WEEKDAYS.map(([weekday, label]) => {
              const wh = hours.find((h) => h.weekday === weekday);
              return (
                <li
                  key={weekday}
                  className="flex justify-between p-3 text-sm"
                >
                  <span>{label}</span>
                  <span className="text-gray-500">
                    {wh
                      ? `${wh.startTime.slice(0, 5)}–${wh.endTime.slice(0, 5)}`
                      : "Stengt"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section
        className={`space-y-3 border border-gray-200 bg-white p-5 ${theme.radius}`}
      >
        <h2
          className="text-lg font-semibold"
          style={{ fontFamily: theme.headingFont }}
        >Bestill time</h2>
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

      {productList.length > 0 && (
        <section className="space-y-3">
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: theme.headingFont }}
          >
            Butikk
          </h2>
          <Shop
            slug={business.slug}
            accentColor={theme.accent}
            radius={theme.radius}
            shipping={{
              free: business.shippingFree,
              fee: business.shippingFee,
              label: business.shippingLabel ?? "",
            }}
            products={productList.map((p) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              priceNok: p.priceNok,
              imageUrl: p.imageUrl,
              inStock: p.inStock,
            }))}
          />
        </section>
      )}

      {showBlog && postList.length > 0 && (
        <section className="space-y-3">
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: theme.headingFont }}
          >
            Aktuelt
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {postList.map((post) => (
              <Link
                key={post.id}
                href={`/${business.slug}/${post.slug}`}
                className={`block border border-gray-200 bg-white p-4 ${theme.radius}`}
              >
                {post.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.imageUrl}
                    alt=""
                    className={`mb-3 aspect-video w-full object-cover ${theme.radius}`}
                  />
                )}
                <p className="font-medium">{post.title}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {post.content.slice(0, 120)}
                  {post.content.length > 120 ? "…" : ""}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showNewsletter && (
        <section className="space-y-3">
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: theme.headingFont }}
          >
            Nyhetsbrev
          </h2>
          <p className="text-sm text-gray-600">
            Meld deg på, så holder vi deg oppdatert.
          </p>
          <NewsletterSignup
            slug={business.slug}
            accentColor={theme.accent}
          />
        </section>
      )}

      {showContactForm && (
        <section className="space-y-3">
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: theme.headingFont }}
          >
            Kontakt oss
          </h2>
          <ContactSection slug={business.slug} accentColor={theme.accent} />
        </section>
      )}

      <OnepageFooter
        business={business}
        social={social}
        orgNumber={content.footer?.orgNumber}
        note={content.footer?.note}
      />
      </main>
    </div>
  );
}
