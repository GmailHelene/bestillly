"use client";

import { useActionState } from "react";
import { updateBusinessProfile } from "@/lib/actions/business";
import { DEFAULT_THEME, THEMES, isThemeId } from "@/lib/themes";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

type Profile = {
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  template: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  aboutText: string;
  showOpeningHours: boolean;
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState(
    updateBusinessProfile,
    undefined,
  );
  const currentTheme = isThemeId(profile.template)
    ? profile.template
    : DEFAULT_THEME;

  return (
    <form
      action={action}
      className="space-y-3 rounded-xl border border-gray-200 p-4"
    >
      <h2 className="font-semibold">Innhold på siden</h2>

      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state && "ok" in state && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Siden er oppdatert.
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Bedriftsnavn
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={profile.name}
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">
          Beskrivelse
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={profile.description ?? ""}
          placeholder="Kort om bedriften — vises øverst på siden din."
          className={inputClass}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="address" className="text-sm font-medium">
            Adresse
          </label>
          <input
            id="address"
            name="address"
            type="text"
            defaultValue={profile.address ?? ""}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="phone" className="text-sm font-medium">
            Telefon
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile.phone ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-gray-100 pt-4">
        <span className="text-sm font-medium">Seksjoner</span>
        <div className="space-y-1">
          <label htmlFor="aboutText" className="text-sm text-gray-600">
            «Om oss»-tekst
          </label>
          <textarea
            id="aboutText"
            name="aboutText"
            rows={4}
            defaultValue={profile.aboutText}
            placeholder="Fortell litt mer om bedriften. Vises som egen seksjon på siden hvis den er fylt ut."
            className={inputClass}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="showOpeningHours"
            defaultChecked={profile.showOpeningHours}
          />
          Vis åpningstider på siden
        </label>
      </div>

      <div className="space-y-1">
        <span className="text-sm font-medium">Fargetema</span>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(THEMES).map((theme) => (
            <label key={theme.id} className="cursor-pointer">
              <input
                type="radio"
                name="template"
                value={theme.id}
                defaultChecked={currentTheme === theme.id}
                className="peer sr-only"
              />
              <div className="rounded-lg border border-gray-300 p-3 peer-checked:border-gray-900 peer-checked:ring-1 peer-checked:ring-gray-900">
                <div className="flex gap-1">
                  <span
                    className="h-5 w-5 rounded-full border border-gray-200"
                    style={{ background: theme.pageBg }}
                  />
                  <span
                    className="h-5 w-5 rounded-full"
                    style={{ background: theme.accent }}
                  />
                </div>
                <p className="mt-2 text-sm font-medium">{theme.name}</p>
                <p className="text-xs text-gray-400">{theme.tagline}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3 border-t border-gray-100 pt-4">
        <span className="text-sm font-medium">Sosiale medier</span>
        <div className="space-y-1">
          <label htmlFor="instagram" className="text-sm text-gray-600">
            Instagram
          </label>
          <input
            id="instagram"
            name="instagram"
            type="url"
            defaultValue={profile.instagram}
            placeholder="https://instagram.com/bedriften"
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="facebook" className="text-sm text-gray-600">
            Facebook
          </label>
          <input
            id="facebook"
            name="facebook"
            type="url"
            defaultValue={profile.facebook}
            placeholder="https://facebook.com/bedriften"
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="tiktok" className="text-sm text-gray-600">
            TikTok
          </label>
          <input
            id="tiktok"
            name="tiktok"
            type="url"
            defaultValue={profile.tiktok}
            placeholder="https://tiktok.com/@bedriften"
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-gray-100 pt-4">
        <div>
          <span className="text-sm font-medium">Synlighet på nett (SEO)</span>
          <p className="text-xs text-gray-400">
            Valgfritt — overstyrer hvordan siden vises i Google-søk.
          </p>
        </div>
        <div className="space-y-1">
          <label htmlFor="metaTitle" className="text-sm text-gray-600">
            Tittel i søkeresultat
          </label>
          <input
            id="metaTitle"
            name="metaTitle"
            type="text"
            defaultValue={profile.metaTitle}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="metaDescription" className="text-sm text-gray-600">
            Beskrivelse i søkeresultat
          </label>
          <textarea
            id="metaDescription"
            name="metaDescription"
            rows={2}
            defaultValue={profile.metaDescription}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="keywords" className="text-sm text-gray-600">
            Nøkkelord
          </label>
          <input
            id="keywords"
            name="keywords"
            type="text"
            defaultValue={profile.keywords}
            placeholder="frisør, klipp, vippeforlengelse, Oslo"
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "Lagrer…" : "Lagre"}
      </button>
    </form>
  );
}
