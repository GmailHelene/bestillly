"use client";

import { useState, useTransition } from "react";
import { crawlWebsiteAction } from "@/lib/actions/marketing";
import type { WebsiteCrawl } from "@/lib/crawler";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CrawlPanel({
  websiteUrl,
  initialCrawl,
}: {
  websiteUrl?: string;
  initialCrawl?: WebsiteCrawl;
}) {
  const [crawl, setCrawl] = useState<WebsiteCrawl | undefined>(initialCrawl);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleCrawl() {
    setError(null);
    startTransition(async () => {
      const result = await crawlWebsiteAction();
      if (result && "ok" in result) {
        setCrawl(result.crawl);
      } else if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 p-4">
      <div>
        <h2 className="font-semibold">Nettside-analyse</h2>
        <p className="text-sm text-gray-500">
          Vi leser gjennom din egen nettside og henter ut tekst og nøkkelord.
          Dette brukes som grunnlag for SEO-forslag og innhold senere.
        </p>
      </div>

      {!websiteUrl && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Legg inn nettsiden din i profilen over og lagre — så kan du
          analysere den her.
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {websiteUrl && (
        <button
          type="button"
          onClick={handleCrawl}
          disabled={pending}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {pending
            ? "Analyserer…"
            : crawl
              ? "Analyser på nytt"
              : "Analyser nettsiden"}
        </button>
      )}

      {crawl && (
        <div className="space-y-3 rounded-lg bg-gray-50 p-3 text-sm">
          <p className="text-xs text-gray-500">
            Analysert {formatDate(crawl.crawledAt)} — {crawl.pagesCrawled}{" "}
            side(r) lest fra{" "}
            <span className="break-all">{crawl.url}</span>
          </p>

          {crawl.title && (
            <div>
              <span className="font-medium text-gray-700">Tittel: </span>
              {crawl.title}
            </div>
          )}
          {crawl.description && (
            <div>
              <span className="font-medium text-gray-700">
                Beskrivelse:{" "}
              </span>
              {crawl.description}
            </div>
          )}

          {crawl.keywords.length > 0 && (
            <div className="space-y-1">
              <span className="font-medium text-gray-700">Nøkkelord</span>
              <div className="flex flex-wrap gap-1.5">
                {crawl.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-600 ring-1 ring-gray-200"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          <details className="text-gray-600">
            <summary className="cursor-pointer font-medium text-gray-700">
              Vis tekst som ble hentet
            </summary>
            <p className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-gray-500">
              {crawl.text}
            </p>
          </details>
        </div>
      )}
    </div>
  );
}
