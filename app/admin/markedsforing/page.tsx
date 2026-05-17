import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { requireBusinessId } from "@/lib/session";
import { parseMarketingProfile } from "@/lib/marketing";
import { BackLink } from "@/components/back-link";
import { MarketingProfileForm } from "./profile-form";
import { CrawlPanel } from "./crawl-panel";

export default async function MarketingPage() {
  const businessId = await requireBusinessId();
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });
  const profile = parseMarketingProfile(business?.marketingProfile);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <BackLink href="/admin" label="Tilbake til oversikt" />
        <h1 className="text-2xl font-bold">Markedsføring</h1>
        <p className="text-sm text-gray-500">
          Her bygger vi etter hvert verktøy for innhold, analyse og
          publiseringsplan. Første steg er å fylle ut profilen din — den
          danner grunnlaget for resten.
        </p>
      </div>

      <MarketingProfileForm profile={profile} />

      <CrawlPanel
        websiteUrl={profile.websiteUrl}
        initialCrawl={profile.websiteCrawl}
      />

      <p className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
        Kommer: SEO-analyse, markedsanalyse, innholdsgenerator og
        publiseringsplan.
      </p>
    </div>
  );
}
