"use client";

import { useActionState } from "react";
import { updateMarketingProfile } from "@/lib/actions/marketing";
import { MARKETING_CHANNELS, type MarketingProfile } from "@/lib/marketing";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

export function MarketingProfileForm({
  profile,
}: {
  profile: MarketingProfile;
}) {
  const [state, action, pending] = useActionState(
    updateMarketingProfile,
    undefined,
  );
  const channels = profile.channels ?? [];

  return (
    <form
      action={action}
      className="space-y-3 rounded-xl border border-gray-200 p-4"
    >
      <h2 className="font-semibold">Markedsføringsprofil</h2>
      <p className="text-sm text-gray-500">
        Dette danner grunnlaget for analyser og innhold senere.
      </p>

      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state && "ok" in state && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Lagret.
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="audience" className="text-sm font-medium">
          Målgruppe
        </label>
        <textarea
          id="audience"
          name="audience"
          rows={2}
          defaultValue={profile.audience ?? ""}
          placeholder="Hvem er kundene dine? F.eks. kvinner 25–45 i Vikersund-området."
          className={inputClass}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="tone" className="text-sm font-medium">
            Tone og stil
          </label>
          <input
            id="tone"
            name="tone"
            type="text"
            defaultValue={profile.tone ?? ""}
            placeholder="F.eks. vennlig og uformell"
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="budgetNok" className="text-sm font-medium">
            Markedsføringsbudsjett (kr)
          </label>
          <input
            id="budgetNok"
            name="budgetNok"
            type="number"
            min={0}
            defaultValue={profile.budgetNok ?? ""}
            placeholder="Valgfritt"
            className={inputClass}
          />
        </div>
      </div>
      <div className="space-y-1">
        <label htmlFor="websiteUrl" className="text-sm font-medium">
          Nettside
        </label>
        <input
          id="websiteUrl"
          name="websiteUrl"
          type="url"
          defaultValue={profile.websiteUrl ?? ""}
          placeholder="https://… (valgfritt — brukes til analyse senere)"
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <span className="text-sm font-medium">Kanaler du vil satse på</span>
        <div className="flex flex-wrap gap-3">
          {MARKETING_CHANNELS.map((channel) => (
            <label
              key={channel.id}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                name={`channel-${channel.id}`}
                defaultChecked={channels.includes(channel.id)}
              />
              {channel.label}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "Lagrer…" : "Lagre profil"}
      </button>
    </form>
  );
}
