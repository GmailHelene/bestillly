import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { requireBusinessId } from "@/lib/session";
import { parseMarketingProfile } from "@/lib/marketing";
import { BackLink } from "@/components/back-link";
import { MarketingProfileForm } from "./profile-form";
import { CrawlPanel } from "./crawl-panel";
import { SeoPanel } from "./seo-panel";
import { AnalysisPanel } from "./analysis-panel";
import { ContentPanel } from "./content-panel";
import { PlanPanel } from "./plan-panel";
import { BlogPanel } from "./blog-panel";
import { SnippetPanel } from "./snippet-panel";
import { MarketingTabs, type MarketingTab } from "./marketing-tabs";

export default async function MarketingPage() {
  const businessId = await requireBusinessId();
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });
  const profile = parseMarketingProfile(business?.marketingProfile);

  const tabs: MarketingTab[] = [
    {
      id: "grunnlag",
      label: "Grunnlag",
      intro:
        "Start her. Profilen og nettside-analysen danner grunnlaget for alt det andre.",
      content: (
        <>
          <MarketingProfileForm profile={profile} />
          <CrawlPanel
            websiteUrl={profile.websiteUrl}
            initialCrawl={profile.websiteCrawl}
          />
        </>
      ),
    },
    {
      id: "analyse",
      label: "Analyse",
      intro:
        "SEO-anbefaling og markedsanalyse — hva du bør satse på, og hvor.",
      content: (
        <>
          <SeoPanel initialSeo={profile.seo} />
          <AnalysisPanel
            initialAnalysis={profile.analysis}
            hasChannels={(profile.channels ?? []).length > 0}
          />
        </>
      ),
    },
    {
      id: "innhold",
      label: "Innhold",
      intro:
        "Lag innlegg, blogginnlegg og korte SEO-tekster — klart til å publisere.",
      content: (
        <>
          <ContentPanel defaultChannels={profile.channels ?? []} />
          <BlogPanel />
          <SnippetPanel />
        </>
      ),
    },
    {
      id: "plan",
      label: "Plan",
      intro:
        "En helhetlig publiseringsplan på tvers av kanalene dine.",
      content: <PlanPanel initialPlan={profile.postingPlan} />,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <BackLink href="/admin" label="Tilbake til oversikt" />
        <h1 className="text-2xl font-bold">Markedsføring</h1>
        <p className="text-sm text-gray-500">
          Verktøy for innhold, analyse og publiseringsplan — samlet på ett
          sted. Gå gjennom fanene fra venstre til høyre.
        </p>
      </div>

      <MarketingTabs tabs={tabs} />
    </div>
  );
}
