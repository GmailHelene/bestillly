"use client";

import { useState, useTransition } from "react";
import {
  generateContentAction,
  generateImageAction,
} from "@/lib/actions/marketing";
import { MARKETING_CHANNELS } from "@/lib/marketing";
import {
  CHANNEL_STRATEGIES,
  type ChannelId,
} from "@/lib/marketing-platforms";
import type { GeneratedPost } from "@/lib/marketing-content";

function channelPostUrl(channelId: string): string | null {
  return channelId in CHANNEL_STRATEGIES
    ? CHANNEL_STRATEGIES[channelId as ChannelId].postUrl
    : null;
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

function CopyButton({ text, label }: { text: string; label: string }) {
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
          // utelat — clipboard kan være blokkert
        }
      }}
      className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium hover:bg-gray-50"
    >
      {copied ? "Kopiert ✓" : label}
    </button>
  );
}

function PostImage({
  prompt,
  channelId,
}: {
  prompt: string;
  channelId: string;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateImageAction(prompt, channelId);
      if (result && "ok" in result) {
        setImageUrl(result.imageUrl);
      } else if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      {imageUrl ? (
        <div className="space-y-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="AI-generert bildeforslag"
            className="w-full max-w-xs rounded-lg border border-gray-200"
          />
          <div className="flex gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium hover:bg-gray-50"
            >
              Åpne / last ned
            </a>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={pending}
              className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {pending ? "Lager…" : "Nytt forslag"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={pending}
          className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          {pending ? "Lager bilde…" : "Generer bildeforslag"}
        </button>
      )}
    </div>
  );
}

function PostCard({ post }: { post: GeneratedPost }) {
  const hashtagText = post.hashtags.map((h) => `#${h}`).join(" ");
  const fullText = [
    post.title,
    post.caption,
    post.callToAction,
    hashtagText,
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800">
            {post.channelName}
          </span>
          <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white">
            {post.postType}
          </span>
        </div>
        <span className="text-xs text-gray-400">{post.pixelSize}</span>
      </div>

      {post.title && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-gray-500">Tittel</span>
          <p className="rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800">
            {post.title}
          </p>
        </div>
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">
            Bildetekst
          </span>
          <CopyButton text={fullText} label="Kopier alt" />
        </div>
        <p className="whitespace-pre-wrap rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
          {post.caption}
        </p>
      </div>

      {post.callToAction && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-gray-500">
            Oppfordring (CTA)
          </span>
          <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
            {post.callToAction}
          </p>
        </div>
      )}

      {post.linkSuggestion && (
        <p className="text-xs text-gray-500">
          <span className="font-medium">Lenke / mål:</span>{" "}
          {post.linkSuggestion}
        </p>
      )}

      {post.goal && (
        <p className="text-xs text-gray-500">
          <span className="font-medium">Mål med innlegget:</span> {post.goal}
        </p>
      )}

      {post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.hashtags.map((h) => (
            <span
              key={h}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            >
              #{h}
            </span>
          ))}
        </div>
      )}

      {post.imageIdea && (
        <div className="space-y-1 text-sm">
          <span className="text-xs font-medium text-gray-500">Bildeidé</span>
          <p className="text-gray-600">{post.imageIdea}</p>
          {post.imagePrompt && (
            <p className="text-xs text-gray-400">
              Bilde-prompt: {post.imagePrompt}
            </p>
          )}
        </div>
      )}

      {post.imagePrompt && (
        <PostImage prompt={post.imagePrompt} channelId={post.channelId} />
      )}

      {post.bestTime && (
        <p className="text-xs text-gray-500">
          <span className="font-medium">Beste tidspunkt:</span>{" "}
          {post.bestTime}
        </p>
      )}

      {post.tips.length > 0 && (
        <ul className="list-disc space-y-0.5 pl-5 text-xs text-gray-500">
          {post.tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      )}

      {channelPostUrl(post.channelId) && (
        <a
          href={channelPostUrl(post.channelId) as string}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs font-medium text-gray-600 underline hover:text-gray-900"
        >
          Åpne {post.channelName} for å publisere ↗
        </a>
      )}
    </div>
  );
}

export function ContentPanel({
  defaultChannels,
}: {
  defaultChannels: string[];
}) {
  const [topic, setTopic] = useState("");
  const [selected, setSelected] = useState<string[]>(
    defaultChannels.length
      ? defaultChannels
      : MARKETING_CHANNELS.map((c) => c.id),
  );
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleGenerate() {
    setError(null);
    setNote(null);
    startTransition(async () => {
      const result = await generateContentAction(topic, selected);
      if (result && "ok" in result) {
        setPosts(result.posts);
        if (result.failedChannels.length > 0) {
          setNote(
            `Klarte ikke å lage innhold for: ${result.failedChannels.join(
              ", ",
            )}. Prøv igjen for disse.`,
          );
        }
      } else if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 p-4">
      <div>
        <h2 className="font-semibold">Innholdsgenerator</h2>
        <p className="text-sm text-gray-500">
          Skriv et tema, velg kanaler — så lager vi ett innlegg tilpasset hver
          kanal, med bildetekst, hashtags og bildeidé.
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="topic" className="text-sm font-medium">
          Tema for innholdet
        </label>
        <textarea
          id="topic"
          rows={2}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="F.eks. «Vi har ledige timer denne uka» eller «Tips: slik holder du fargen lenger»"
          className={inputClass}
        />
      </div>

      <div className="space-y-1">
        <span className="text-sm font-medium">Kanaler</span>
        <div className="flex flex-wrap gap-3">
          {MARKETING_CHANNELS.map((channel) => (
            <label
              key={channel.id}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={selected.includes(channel.id)}
                onChange={() => toggle(channel.id)}
              />
              {channel.label}
            </label>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {note && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {note}
        </p>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={pending}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "Lager innhold…" : "Lag innhold"}
      </button>

      {posts.length > 0 && (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.channelId} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
