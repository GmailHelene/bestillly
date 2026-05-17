"use client";

import { deleteSubscriber } from "@/lib/actions/newsletter";

export function DeleteSubscriberButton({
  id,
  email,
}: {
  id: string;
  email: string;
}) {
  return (
    <form
      action={deleteSubscriber}
      onSubmit={(e) => {
        if (!confirm(`Fjerne abonnenten ${email}?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-sm font-medium text-red-600 hover:text-red-700"
      >
        Fjern
      </button>
    </form>
  );
}
