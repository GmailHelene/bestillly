"use client";

import { useActionState, useState } from "react";
import type { Post } from "@/db/schema";
import { deletePost, updatePost } from "@/lib/actions/posts";
import { SingleImageUploader } from "@/components/single-image-uploader";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

export function PostRow({ post }: { post: Post }) {
  const [state, action, pending] = useActionState(updatePost, undefined);
  const [imageUrl, setImageUrl] = useState(post.imageUrl ?? "");
  const deleteFormId = `delete-post-${post.id}`;

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <form
        id={deleteFormId}
        action={deletePost}
        className="hidden"
        onSubmit={(e) => {
          if (!confirm(`Slette innlegget «${post.title}»?`)) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={post.id} />
      </form>

      <form action={action} className="space-y-3">
        <input type="hidden" name="id" value={post.id} />
        <input type="hidden" name="imageUrl" value={imageUrl} />
        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}
        {!post.published && (
          <p className="text-xs font-medium text-amber-700">Kladd (ikke publisert)</p>
        )}
        <div className="space-y-1">
          <label className="text-sm font-medium">Tittel</label>
          <input
            name="title"
            type="text"
            required
            defaultValue={post.title}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Innhold</label>
          <textarea
            name="content"
            rows={6}
            required
            defaultValue={post.content}
            className={inputClass}
          />
        </div>
        <SingleImageUploader
          value={imageUrl}
          onChange={setImageUrl}
          label="Bilde"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked={post.published}
          />
          Publisert
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
