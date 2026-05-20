"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  generateBlogPostAction,
  saveGeneratedBlogPost,
} from "@/lib/actions/marketing";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

export function BlogPanel() {
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [hasDraft, setHasDraft] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genPending, startGen] = useTransition();
  const [savePending, startSave] = useTransition();

  function handleGenerate() {
    setError(null);
    setSaved(false);
    startGen(async () => {
      const result = await generateBlogPostAction(topic);
      if (result && "ok" in result) {
        setTitle(result.post.title);
        setContent(result.post.content);
        setMetaDescription(result.post.metaDescription);
        setHasDraft(true);
      } else if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  function handleSave() {
    setError(null);
    startSave(async () => {
      const result = await saveGeneratedBlogPost(title, content);
      if (result && "ok" in result) {
        setSaved(true);
      } else if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 p-4">
      <div>
        <h2 className="font-semibold">SEO-blogginnlegg</h2>
        <p className="text-sm text-gray-500">
          Skriv et tema, så lager vi et komplett, SEO-optimalisert
          blogginnlegg du kan lagre rett i bloggen din.
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="blog-topic" className="text-sm font-medium">
          Tema for blogginnlegget
        </label>
        <textarea
          id="blog-topic"
          rows={2}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="F.eks. «Slik forbereder du håret til sommeren» eller «5 tips for å få fargen til å vare»"
          className={inputClass}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="space-y-1">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={genPending}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {genPending
            ? "Skriver innlegg…"
            : hasDraft
              ? "Lag nytt innlegg"
              : "Lag blogginnlegg"}
        </button>
        {genPending && (
          <p className="text-xs text-gray-500">
            Et godt blogginnlegg tar 30–60 sekunder å skrive. Vent litt — du
            trenger ikke oppdatere siden.
          </p>
        )}
      </div>

      {hasDraft && (
        <div className="space-y-3 rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">
            Du kan finpusse teksten før du lagrer. Innlegget lagres som
            upublisert kladd — du publiserer det selv fra bloggen.
          </p>

          <div className="space-y-1">
            <label htmlFor="blog-title" className="text-sm font-medium">
              Tittel
            </label>
            <input
              id="blog-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="blog-content" className="text-sm font-medium">
              Innhold
            </label>
            <textarea
              id="blog-content"
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={inputClass}
            />
          </div>

          {metaDescription && (
            <p className="text-xs text-gray-500">
              <span className="font-medium">Forslag til meta-beskrivelse:</span>{" "}
              {metaDescription}
            </p>
          )}

          {saved ? (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              Lagret som kladd i bloggen.{" "}
              <Link href="/admin/blogg" className="font-semibold underline">
                Gå til bloggen for å publisere
              </Link>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={savePending}
              className="rounded-lg border border-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              {savePending ? "Lagrer…" : "Lagre i bloggen som kladd"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
