"use client";

import { useRef, useState, useTransition } from "react";
import { createProduct } from "@/lib/actions/products";
import { SingleImageUploader } from "@/components/single-image-uploader";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

export function AddProductForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createProduct(undefined, formData);
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
      <h2 className="font-semibold">Nytt produkt</h2>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            Navn
          </label>
          <input id="name" name="name" type="text" required className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="priceNok" className="text-sm font-medium">
            Pris (kr)
          </label>
          <input
            id="priceNok"
            name="priceNok"
            type="number"
            min={0}
            required
            className={inputClass}
          />
        </div>
      </div>
      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">
          Beskrivelse <span className="text-gray-400">(valgfritt)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          className={inputClass}
        />
      </div>
      <SingleImageUploader
        value={imageUrl}
        onChange={setImageUrl}
        label="Produktbilde (valgfritt)"
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="inStock" defaultChecked />
        På lager
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "Legger til…" : "Legg til produkt"}
      </button>
    </form>
  );
}
