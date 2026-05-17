"use client";

import { useRef, useState, useTransition } from "react";
import { createPost } from "@/lib/actions/posts";
import { SingleImageUploader } from "@/components/single-image-uploader";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

export function AddPostForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createPost(undefined, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        setImageUrl("");
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="space-y-3 rounded-xl border border-gray-200 p-4"
    >
      <h2 className="font-semibold">Nytt innlegg</h2>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="space-y-1">
        <label htmlFor="title" className="text-sm font-medium">
          Tittel
        </label>
        <input id="title" name="title" type="text" required className={inputClass} />
      </div>
      <div className="space-y-1">
        <label htmlFor="content" className="text-sm font-medium">
          Innhold
        </label>
        <textarea
          id="content"
          name="content"
          rows={6}
          required
          className={inputClass}
        />
      </div>
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <SingleImageUploader
        value={imageUrl}
        onChange={setImageUrl}
        label="Bilde (valgfritt)"
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked />
        Publiser med en gang
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "Lagrer…" : "Legg til innlegg"}
      </button>
    </form>
  );
}
