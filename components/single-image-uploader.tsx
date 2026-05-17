"use client";

import { useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

export function SingleImageUploader({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      onChange(await uploadToCloudinary(file));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Opplasting feilet. Prøv igjen.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-1">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-14 w-14 rounded-lg border border-gray-200 object-cover"
          />
        )}
        <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
          {uploading ? "Laster opp…" : value ? "Bytt bilde" : "Last opp bilde"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            className="sr-only"
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
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
