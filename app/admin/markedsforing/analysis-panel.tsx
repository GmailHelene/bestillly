"use client";

import { useState, useTransition } from "react";
import { generateAnalysisAction } from "@/lib/actions/marketing";
import type { MarketAnalysis } from "@/lib/marketing-analysis";

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

export function AnalysisPanel({
  initialAnalysis,
  hasChannels,
}: {
  initialAnalysis?: MarketAnalysis;
  hasChannels: boolean;
}) {
  const [analysis, setAnalysis] = useState<MarketAnalysis | undefined>(
    initialAnalysis,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateAnalysisAction();
      if (result && "ok" in result) {
        setAnalysis(result.analysis);
      } else if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 p-4">
      <div>
        <h2 className="font-semibold">Markedsanalyse</h2>
        <p className="text-sm text-gray-500">
          Få en prioritert kanalplan, anbefalt postefrekvens og -tider, og en
          budsjettstrategi tilpasset bedriften din.
        </p>
      </div>

      {!hasChannels && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Velg hvilke kanaler du vil satse på i profilen over — da blir
          analysen mer treffsikker.
        </p>
      )}

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
          ? "Analyserer…"
          : analysis
            ? "Lag ny analyse"
            : "Lag markedsanalyse"}
      </button>

      {analysis && (
        <div className="space-y-4 rounded-lg bg-gray-50 p-3 text-sm">
          {analysis.generatedAt && (
            <p className="text-xs text-gray-500">
              Laget {formatDate(analysis.generatedAt)}
            </p>
          )}

          <p className="text-gray-700">{analysis.summary}</p>

          {analysis.channels.length > 0 && (
            <div className="space-y-2">
              <span className="font-medium text-gray-700">
                Kanaler — prioritert rekkefølge
              </span>
              {analysis.channels.map((ch) => (
                <div
                  key={ch.channelId}
                  className="rounded-md bg-white p-3 ring-1 ring-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                      {ch.priority}
                    </span>
                    <span className="font-medium text-gray-800">
                      {ch.name}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-600">{ch.rationale}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    <span className="font-medium">Frekvens:</span>{" "}
                    {ch.recommendedFrequency}
                  </p>
                  {ch.bestTimes.length > 0 && (
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Tider:</span>{" "}
                      {ch.bestTimes.join(" · ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {analysis.budgetStrategy && (
            <div className="space-y-1">
              <span className="font-medium text-gray-700">
                Budsjettstrategi
              </span>
              <p className="text-gray-600">{analysis.budgetStrategy}</p>
            </div>
          )}

          {analysis.organicVsPaid && (
            <div className="space-y-1">
              <span className="font-medium text-gray-700">
                Organisk vs. betalt
              </span>
              <p className="text-gray-600">{analysis.organicVsPaid}</p>
            </div>
          )}

          {analysis.quickWins.length > 0 && (
            <div className="space-y-1">
              <span className="font-medium text-gray-700">
                Raske grep denne uka
              </span>
              <ul className="list-disc space-y-1 pl-5 text-gray-600">
                {analysis.quickWins.map((win, i) => (
                  <li key={i}>{win}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
