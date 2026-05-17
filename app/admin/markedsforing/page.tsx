import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { requireBusinessId } from "@/lib/session";
import { parseMarketingProfile } from "@/lib/marketing";
import { readUsage } from "@/lib/ai-quota";
import { DEMO_SLUG } from "@/lib/demo";
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
  const isDemo = business?.slug === DEMO_SLUG;
  const usage = readUsage({
    aiPeriod: business?.aiPeriod ?? null,
    aiTextUsed: business?.aiTextUsed ?? 0,
    aiImagesUsed: business?.aiImagesUsed ?? 0,
  });

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

      {isDemo && (
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          Dette er demomodus. Verktøyene viser ferdig eksempelinnhold, så du
          ser hvordan markedsføringshuben fungerer — uten at noe lagres. Med
          egen konto tilpasses alt din bedrift, og du kan lagre og bruke
          innholdet.
        </div>
      )}

      <div className="space-y-3 rounded-xl border border-gray-200 p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">AI-forbruk denne måneden</h2>
          <span className="text-xs text-gray-400">Fornyes ved månedsskifte</span>
        </div>
        <UsageBar
          label="AI-kreditter (tekst)"
          used={usage.textUsed}
          limit={usage.textLimit}
        />
        <UsageBar
          label="Bilder"
          used={usage.imagesUsed}
          limit={usage.imageLimit}
        />
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer font-medium text-gray-600">
            Slik fungerer AI-kreditter
          </summary>
          <div className="mt-2 space-y-2">
            <p>
              AI-kredittene er inkludert i årsprisen og fornyes automatisk
              ved hvert månedsskifte. Ubrukte kreditter spares ikke opp.
              Tekst og bilder telles hver for seg.
            </p>
            <ul className="space-y-0.5">
              <li>· Innlegg til sosiale medier: 1 kreditt per kanal</li>
              <li>· SEO-tekst (snippet): 2 kreditter</li>
              <li>· Blogginnlegg: 3 kreditter</li>
              <li>· SEO-anbefaling, markedsanalyse, publiseringsplan: 5 kreditter</li>
              <li>· Bildegenerering: 1 bilde fra bildekvoten</li>
            </ul>
            <p>
              Nettside-analysen er gratis og bruker ingen kreditter. Trenger
              du mer før måneden er omme, ta kontakt på{" "}
              <a href="mailto:support@bestilly.no" className="underline">
                support@bestilly.no
              </a>
              .
            </p>
          </div>
        </details>
      </div>

      <MarketingTabs tabs={tabs} />
    </div>
  );
}

function UsageBar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const full = used >= limit;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-gray-600">{label}</span>
        <span className={full ? "font-medium text-red-600" : "text-gray-500"}>
          {used} / {limit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${full ? "bg-red-500" : "bg-gray-900"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
