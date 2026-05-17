"use client";

import { useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

const buttonClass =
  "cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50";

export function LogoUploader({ initialUrl }: { initialUrl: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      setUrl(await uploadToCloudinary(file));
    } catch {
      setError("Opplasting feilet. Prøv igjen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">Logo</span>
      <input type="hidden" name="logoUrl" value={url} />
      <div className="flex items-center gap-3">
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Logo"
            className="h-14 w-14 rounded-lg border border-gray-200 object-contain"
          />
        )}
        <label className={buttonClass}>
          {uploading ? "Laster opp…" : url ? "Bytt logo" : "Last opp logo"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="sr-only"
          />
        </label>
        {url && (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Fjern
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function GalleryUploader({ initialUrls }: { initialUrls: string[] }) {
  const [urls, setUrls] = useState(initialUrls);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await uploadToCloudinary(file);
      setUrls((prev) => [...prev, uploaded]);
    } catch {
      setError("Opplasting feilet. Prøv igjen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">Bildegalleri</span>
      {urls.map((u) => (
        <input key={u} type="hidden" name="galleryImage" value={u} />
      ))}
      {urls.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {urls.map((u, i) => (
            <div key={u} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={u}
                alt=""
                className="h-24 w-full rounded-lg border border-gray-200 object-cover"
              />
              <button
                type="button"
                onClick={() => setUrls(urls.filter((_, idx) => idx !== i))}
                aria-label="Fjern bilde"
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <label className={buttonClass}>
        {uploading ? "Laster opp…" : "Last opp bilde"}
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="sr-only"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
