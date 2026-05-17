"use client";

import { useState, useTransition } from "react";
import { sendNewsletter } from "@/lib/actions/newsletter";
import type { NewsletterBlock } from "@/lib/newsletter-blocks";
import { SingleImageUploader } from "@/components/single-image-uploader";

type EditorBlock = NewsletterBlock & { _id: string };

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";
const addBtn =
  "rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50";

const BLOCK_LABEL: Record<NewsletterBlock["type"], string> = {
  heading: "Overskrift",
  text: "Tekst",
  image: "Bilde",
  button: "Knapp",
};

function newBlock(type: NewsletterBlock["type"]): EditorBlock {
  const _id = crypto.randomUUID();
  if (type === "heading") return { _id, type: "heading", text: "" };
  if (type === "text") return { _id, type: "text", text: "" };
  if (type === "image") return { _id, type: "image", url: "" };
  return { _id, type: "button", label: "", url: "" };
}

function toBlock(b: EditorBlock): NewsletterBlock {
  if (b.type === "heading") return { type: "heading", text: b.text };
  if (b.type === "text") return { type: "text", text: b.text };
  if (b.type === "image") return { type: "image", url: b.url };
  return { type: "button", label: b.label, url: b.url };
}

const TEMPLATES: {
  id: string;
  label: string;
  subject: string;
  blocks: NewsletterBlock[];
}[] = [
  {
    id: "tilbud",
    label: "Tilbud",
    subject: "Et tilbud til deg",
    blocks: [
      { type: "heading", text: "Ukens tilbud" },
      {
        type: "text",
        text: "Denne uka har vi et godt tilbud til deg som kunde. Velkommen innom!",
      },
      { type: "button", label: "Bestill time", url: "" },
    ],
  },
  {
    id: "nyhet",
    label: "Nyhet",
    subject: "Nytt hos oss",
    blocks: [
      { type: "heading", text: "Vi har en nyhet å dele" },
      { type: "text", text: "Skriv litt om hva som er nytt hos dere." },
    ],
  },
  {
    id: "sesong",
    label: "Sesonghilsen",
    subject: "En hilsen fra oss",
    blocks: [
      { type: "heading", text: "God sesong!" },
      { type: "text", text: "En liten hilsen til kundene våre." },
      { type: "button", label: "Se ledige tider", url: "" },
    ],
  },
];

export function ComposeForm({
  subscriberCount,
}: {
  subscriberCount: number;
}) {
  const [subject, setSubject] = useState("");
  const [blocks, setBlocks] = useState<EditorBlock[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  function updateBlock(
    id: string,
    patch: { text?: string; url?: string; label?: string },
  ) {
    setBlocks((prev) =>
      prev.map((b) => (b._id === id ? ({ ...b, ...patch } as EditorBlock) : b)),
    );
  }

  function moveBlock(index: number, dir: -1 | 1) {
    setBlocks((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function applyTemplate(template: (typeof TEMPLATES)[number]) {
    setSubject(template.subject);
    setBlocks(
      template.blocks.map((b) => ({ ...b, _id: crypto.randomUUID() })),
    );
  }

  function handleSend() {
    if (!confirm(`Sende nyhetsbrevet til ${subscriberCount} abonnent(er)?`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await sendNewsletter({
        subject,
        blocks: blocks.map(toBlock),
      });
      if (result && "ok" in result) {
        setSentCount(result.count);
        setSubject("");
        setBlocks([]);
      } else if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  if (sentCount !== null) {
    return (
      <div className="space-y-3 rounded-xl border border-gray-200 p-4">
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Nyhetsbrevet ble sendt til {sentCount} abonnent(er).
        </p>
        <button
          type="button"
          onClick={() => setSentCount(null)}
          className={addBtn}
        >
          Skriv nytt nyhetsbrev
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 p-4">
      <h2 className="font-semibold">Skriv nyhetsbrev</h2>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="space-y-1">
        <p className="text-sm font-medium">Start fra en mal</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => applyTemplate(template)}
              className={addBtn}
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="subject" className="text-sm font-medium">
          Emne
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Innhold</p>
        {blocks.length === 0 && (
          <p className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
            Ingen blokker ennå — legg til under, eller velg en mal.
          </p>
        )}
        {blocks.map((block, index) => (
          <div
            key={block._id}
            className="space-y-2 rounded-lg border border-gray-200 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                {BLOCK_LABEL[block.type]}
              </span>
              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => moveBlock(index, -1)}
                  aria-label="Flytt opp"
                  className="text-gray-500 hover:text-gray-900"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(index, 1)}
                  aria-label="Flytt ned"
                  className="text-gray-500 hover:text-gray-900"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setBlocks((prev) =>
                      prev.filter((b) => b._id !== block._id),
                    )
                  }
                  className="font-medium text-red-600 hover:text-red-700"
                >
                  Fjern
                </button>
              </div>
            </div>

            {block.type === "heading" && (
              <input
                type="text"
                value={block.text}
                onChange={(e) =>
                  updateBlock(block._id, { text: e.target.value })
                }
                placeholder="Overskrift"
                className={inputClass}
              />
            )}
            {block.type === "text" && (
              <textarea
                value={block.text}
                onChange={(e) =>
                  updateBlock(block._id, { text: e.target.value })
                }
                rows={4}
                placeholder="Skriv teksten her…"
                className={inputClass}
              />
            )}
            {block.type === "image" && (
              <SingleImageUploader
                value={block.url}
                onChange={(url) => updateBlock(block._id, { url })}
                label="Bilde"
              />
            )}
            {block.type === "button" && (
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  type="text"
                  value={block.label}
                  onChange={(e) =>
                    updateBlock(block._id, { label: e.target.value })
                  }
                  placeholder="Knappetekst"
                  className={inputClass}
                />
                <input
                  type="url"
                  value={block.url}
                  onChange={(e) =>
                    updateBlock(block._id, { url: e.target.value })
                  }
                  placeholder="https://lenke"
                  className={inputClass}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setBlocks((p) => [...p, newBlock("heading")])}
          className={addBtn}
        >
          + Overskrift
        </button>
        <button
          type="button"
          onClick={() => setBlocks((p) => [...p, newBlock("text")])}
          className={addBtn}
        >
          + Tekst
        </button>
        <button
          type="button"
          onClick={() => setBlocks((p) => [...p, newBlock("image")])}
          className={addBtn}
        >
          + Bilde
        </button>
        <button
          type="button"
          onClick={() => setBlocks((p) => [...p, newBlock("button")])}
          className={addBtn}
        >
          + Knapp
        </button>
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={pending || subscriberCount === 0}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "Sender…" : `Send til ${subscriberCount} abonnent(er)`}
      </button>
    </div>
  );
}
