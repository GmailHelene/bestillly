"use client";

import { useState, useTransition } from "react";
import { generateSeoAction } from "@/lib/actions/marketing";
import type { SeoResult } from "@/lib/marketing-seo";

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

export function SeoPanel({ initialSeo }: { initialSeo?: SeoResult }) {
  const [seo, setSeo] = useState<SeoResult | undefined>(initialSeo);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateSeoAction();
      if (result && "ok" in result) {
        setSeo(result.seo);
      } else if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 p-4">
      <div>
        <h2 className="font-semibold">SEO-anbefaling</h2>
        <p className="text-sm text-gray-500">
          Få konkrete søkeord, forslag til meta-tittel og -beskrivelse, og råd
          om innhold — basert på profilen din og nettside-analysen.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={pending}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending
          ? "Lager anbefaling…"
          : seo
            ? "Lag ny anbefaling"
            : "Lag SEO-anbefaling"}
      </button>

      {seo && (
        <div className="space-y-4 rounded-lg bg-gray-50 p-3 text-sm">
          {seo.generatedAt && (
            <p className="text-xs text-gray-500">
              Laget {formatDate(seo.generatedAt)}
            </p>
          )}

          <p className="text-gray-700">{seo.summary}</p>

          <div className="space-y-1">
            <span className="font-medium text-gray-700">Meta-tittel</span>
            <p className="rounded-md bg-white px-3 py-2 ring-1 ring-gray-200">
              {seo.metaTitle}
              <span className="ml-2 text-xs text-gray-400">
                ({seo.metaTitle.length} tegn)
              </span>
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-medium text-gray-700">Meta-beskrivelse</span>
            <p className="rounded-md bg-white px-3 py-2 ring-1 ring-gray-200">
              {seo.metaDescription}
              <span className="ml-2 text-xs text-gray-400">
                ({seo.metaDescription.length} tegn)
              </span>
            </p>
          </div>

          {seo.keywords.length > 0 && (
            <div className="space-y-1">
              <span className="font-medium text-gray-700">
                Søkeord å satse på
              </span>
              <div className="flex flex-wrap gap-1.5">
                {seo.keywords.map((kw) => (
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

          {seo.contentTips.length > 0 && (
            <div className="space-y-1">
              <span className="font-medium text-gray-700">Innholdsråd</span>
              <ul className="list-disc space-y-1 pl-5 text-gray-600">
                {seo.contentTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Tips: meta-tittel og -beskrivelse kan du legge inn under «Min side»
            → SEO.
          </p>
        </div>
      )}
    </div>
  );
}
