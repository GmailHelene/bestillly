"use client";

import { useState, useTransition } from "react";
import { generateSnippetAction } from "@/lib/actions/marketing";
import { SNIPPET_TYPES, getSnippetType } from "@/lib/snippet-types";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

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

export function SnippetPanel() {
  const [typeId, setTypeId] = useState<string>(SNIPPET_TYPES[0].id);
  const [extra, setExtra] = useState("");
  const [variants, setVariants] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const current = getSnippetType(typeId);

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateSnippetAction(typeId, extra);
      if (result && "ok" in result) {
        setVariants(result.variants);
      } else if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 p-4">
      <div>
        <h2 className="font-semibold">SEO-tekster</h2>
        <p className="text-sm text-gray-500">
          Korte, SEO-optimaliserte tekster til ulike steder — om-oss,
          ingress, meta-beskrivelse, produkttekst, Google-profil og annonser.
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="snippet-type" className="text-sm font-medium">
          Hva slags tekst?
        </label>
        <select
          id="snippet-type"
          value={typeId}
          onChange={(e) => {
            setTypeId(e.target.value);
            setVariants([]);
          }}
          className={inputClass}
        >
          {SNIPPET_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        {current && (
          <p className="text-xs text-gray-400">{current.guidance}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="snippet-extra" className="text-sm font-medium">
          Tilleggsinfo
        </label>
        <input
          id="snippet-extra"
          type="text"
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          placeholder={current?.placeholder ?? ""}
          className={inputClass}
        />
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
        {pending ? "Lager tekster…" : "Lag tekstforslag"}
      </button>

      {variants.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">
            Velg den du liker best:
          </p>
          {variants.map((variant, i) => (
            <div
              key={i}
              className="space-y-2 rounded-lg border border-gray-200 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">
                  Variant {i + 1}
                </span>
                <CopyButton text={variant} />
              </div>
              <p className="whitespace-pre-wrap text-sm text-gray-700">
                {variant}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
