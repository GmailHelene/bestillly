import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses, posts, services, workingHours } from "@/db/schema";
import { requireBusinessId } from "@/lib/session";
import { parseOnepageContent } from "@/lib/onepage";
import { parseMarketingProfile } from "@/lib/marketing";
import { auditSeo } from "@/lib/seo-audit";
import { BackLink } from "@/components/back-link";
import { ProfileForm } from "./profile-form";
import { SeoAudit } from "./seo-audit";

export default async function SidePage() {
  const businessId = await requireBusinessId();

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });
  if (!business) redirect("/login");

  const serviceList = await db.query.services.findMany({
    where: eq(services.businessId, businessId),
  });
  const wh = await db.query.workingHours.findMany({
    where: eq(workingHours.businessId, businessId),
  });
  const publishedPosts = await db.query.posts.findMany({
    where: and(eq(posts.businessId, businessId), eq(posts.published, true)),
    columns: { id: true },
  });

  const content = parseOnepageContent(business.onepageContent);
  const marketing = parseMarketingProfile(business.marketingProfile);

  const audit = auditSeo({
    description: business.description,
    address: business.address,
    phone: business.phone,
    metaTitle: content.seo?.metaTitle,
    metaDescription: content.seo?.metaDescription,
    keywords: content.seo?.keywords,
    aboutText: content.sections?.aboutText,
    logoUrl: content.media?.logoUrl,
    galleryCount: content.media?.gallery?.length ?? 0,
    serviceCount: serviceList.length,
    hasOpeningHours: wh.length > 0,
    publishedPostCount: publishedPosts.length,
    hasMarketingSeo: Boolean(marketing.seo),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <BackLink href="/admin" label="Tilbake til oversikt" />
        <h1 className="text-2xl font-bold">Min side</h1>
        <p className="text-sm text-gray-500">
          Rediger den offentlige siden din, og gjør den lett å finne på nett.
        </p>
      </div>

      <ProfileForm
        profile={{
          name: business.name,
          email: business.email,
          showContactForm: content.sections?.showContactForm ?? false,
          showBlog: content.sections?.showBlog ?? false,
          showNewsletter: content.sections?.showNewsletter ?? false,
          description: business.description,
          address: business.address,
          phone: business.phone,
          template: business.template,
          instagram: content.social?.instagram ?? "",
          facebook: content.social?.facebook ?? "",
          tiktok: content.social?.tiktok ?? "",
          metaTitle: content.seo?.metaTitle ?? "",
          metaDescription: content.seo?.metaDescription ?? "",
          keywords: content.seo?.keywords ?? "",
          aboutText: content.sections?.aboutText ?? "",
          showOpeningHours: content.sections?.showOpeningHours ?? false,
          tagline: content.header?.tagline ?? "",
          orgNumber: content.footer?.orgNumber ?? "",
          footerNote: content.footer?.note ?? "",
          logoUrl: content.media?.logoUrl ?? "",
          gallery: content.media?.gallery ?? [],
        }}
      />

      <SeoAudit audit={audit} />

      <div className="space-y-2 rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold">Bli synlig på Google</h2>
        <p className="text-sm text-gray-600">
          Det viktigste enkelttiltaket for å bli funnet lokalt er en gratis
          Google-bedriftsprofil. Den gjør at bedriften din kan vises i
          Google-søk og på Google Maps når noen i nærområdet søker etter
          tjenestene dine.
        </p>
        <a
          href="https://business.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-medium text-gray-900 underline"
        >
          Opprett Google-bedriftsprofil ↗
        </a>
      </div>
    </div>
  );
}
