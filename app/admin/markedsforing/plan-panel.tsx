"use client";

import { useState, useTransition } from "react";
import { generatePlanAction } from "@/lib/actions/marketing";
import { CHANNEL_STRATEGIES, type ChannelId } from "@/lib/marketing-platforms";
import type { PostingPlan, PlanItem } from "@/lib/marketing-plan";

const PERIODS = [
  { weeks: 1, label: "1 uke" },
  { weeks: 2, label: "2 uker" },
  { weeks: 4, label: "1 måned" },
];

function channelUrl(channelId: string): string | null {
  return channelId in CHANNEL_STRATEGIES
    ? CHANNEL_STRATEGIES[channelId as ChannelId].postUrl
    : null;
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
}

function weekIndex(itemDate: string, startDate: string): number {
  const a = new Date(itemDate + "T00:00:00Z").getTime();
  const b = new Date(startDate + "T00:00:00Z").getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 1;
  return Math.floor((a - b) / (7 * 24 * 3600 * 1000)) + 1;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // clipboard kan være blokkert
        }
      }}
      className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium hover:bg-gray-50"
    >
      {copied ? "Kopiert ✓" : "Kopier"}
    </button>
  );
}

function itemText(item: PlanItem): string {
  const tags = item.hashtags.map((h) => `#${h}`).join(" ");
  return [item.caption, tags].filter(Boolean).join("\n\n");
}

function downloadCsv(plan: PostingPlan) {
  const header = [
    "Dato",
    "Ukedag",
    "Tid",
    "Kanal",
    "Type",
    "Tema",
    "Bildetekst",
    "Hashtags",
  ];
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = plan.items.map((i) =>
    [
      i.date,
      i.weekday,
      i.time,
      i.channelName,
      i.postType,
      i.theme,
      i.caption,
      i.hashtags.map((h) => `#${h}`).join(" "),
    ]
      .map(esc)
      .join(","),
  );
  const csv = "﻿" + [header.map(esc).join(","), ...rows].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `publiseringsplan-${plan.startDate}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function PlanItemRow({ item }: { item: PlanItem }) {
  const url = channelUrl(item.channelId);
  return (
    <div className="space-y-2 rounded-lg border border-gray-200 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-800">
            {formatDate(item.date)}
          </span>
          <span className="text-xs text-gray-500">
            {item.weekday} {item.time}
          </span>
          <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white">
            {item.channelName}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {item.postType}
          </span>
        </div>
        <CopyButton text={itemText(item)} />
      </div>

      {item.theme && (
        <p className="text-xs font-medium text-gray-500">{item.theme}</p>
      )}
      <p className="whitespace-pre-wrap rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
        {item.caption}
      </p>

      {item.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.hashtags.map((h) => (
            <span
              key={h}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            >
              #{h}
            </span>
          ))}
        </div>
      )}

      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs font-medium text-gray-600 underline hover:text-gray-900"
        >
          Åpne {item.channelName} for å publisere ↗
        </a>
      )}
    </div>
  );
}

export function PlanPanel({
  initialPlan,
}: {
  initialPlan?: PostingPlan;
}) {
  const [plan, setPlan] = useState<PostingPlan | undefined>(initialPlan);
  const [weeks, setWeeks] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generatePlanAction(weeks);
      if (result && "ok" in result) {
        setPlan(result.plan);
      } else if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  const weekGroups = plan
    ? Array.from(
        plan.items.reduce((map, item) => {
          const w = weekIndex(item.date, plan.startDate);
          const list = map.get(w) ?? [];
          list.push(item);
          map.set(w, list);
          return map;
        }, new Map<number, PlanItem[]>()),
      ).sort((a, b) => a[0] - b[0])
    : [];

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 p-4">
      <div>
        <h2 className="font-semibold">Publiseringsplan</h2>
        <p className="text-sm text-gray-500">
          En helhetlig plan på tvers av kanalene dine — hva du bør poste når,
          fordelt utover perioden. Klar til å eksportere.
        </p>
      </div>

      <div className="space-y-1">
        <span className="text-sm font-medium">Periode</span>
        <div className="flex flex-wrap gap-3">
          {PERIODS.map((p) => (
            <label key={p.weeks} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="period"
                checked={weeks === p.weeks}
                onChange={() => setWeeks(p.weeks)}
              />
              {p.label}
            </label>
          ))}
        </div>
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
          ? "Lager plan…"
          : plan
            ? "Lag ny plan"
            : "Lag publiseringsplan"}
      </button>

      {plan && (
        <div className="space-y-4">
          {plan.summary && (
            <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
              {plan.summary}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-gray-500">
              {plan.items.length} innlegg over {plan.periodWeeks} uke(r)
            </span>
            <button
              type="button"
              onClick={() => downloadCsv(plan)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
            >
              Last ned som CSV
            </button>
          </div>

          {weekGroups.map(([week, items]) => (
            <div key={week} className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">
                Uke {week}
              </h3>
              {items.map((item, i) => (
                <PlanItemRow key={`${item.date}-${i}`} item={item} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
