"use client";

import { useActionState, useState } from "react";
import type { Product } from "@/db/schema";
import { deleteProduct, updateProduct } from "@/lib/actions/products";
import { SingleImageUploader } from "@/components/single-image-uploader";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

export function ProductRow({ product }: { product: Product }) {
  const [state, action, pending] = useActionState(updateProduct, undefined);
  const [imageUrl, setImageUrl] = useState(product.imageUrl ?? "");
  const deleteFormId = `delete-product-${product.id}`;

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <form
        id={deleteFormId}
        action={deleteProduct}
        className="hidden"
        onSubmit={(e) => {
          if (!confirm(`Slette produktet «${product.name}»?`)) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={product.id} />
      </form>

      <form action={action} className="space-y-3">
        <input type="hidden" name="id" value={product.id} />
        <input type="hidden" name="imageUrl" value={imageUrl} />
        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Navn</label>
            <input
              name="name"
              type="text"
              required
              defaultValue={product.name}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Pris (kr)</label>
            <input
              name="priceNok"
              type="number"
              min={0}
              required
              defaultValue={product.priceNok}
              className={inputClass}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Beskrivelse <span className="text-gray-400">(valgfritt)</span>
          </label>
          <textarea
            name="description"
            rows={2}
            defaultValue={product.description ?? ""}
            className={inputClass}
          />
        </div>
        <SingleImageUploader
          value={imageUrl}
          onChange={setImageUrl}
          label="Produktbilde"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="inStock"
            defaultChecked={product.inStock}
          />
          På lager
        </label>
        <div className="flex items-center justify-between pt-1">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {pending ? "Lagrer…" : "Lagre endringer"}
          </button>
          <button
            type="submit"
            form={deleteFormId}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Slett
          </button>
        </div>
      </form>
    </div>
  );
}
