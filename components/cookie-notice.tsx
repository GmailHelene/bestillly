"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Lite informasjonsbanner. Vi bruker kun nødvendige informasjonskapsler
// (innloggingscookie), så GDPR krever ikke samtykke — kun informasjon.
// Banneret huskes lokalt så det ikke dukker opp på hvert besøk.
const STORAGE_KEY = "bestilly-cookie-notice-dismissed-v1";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage kan være blokkert — la banneret bli liggende
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignorer
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Informasjon om informasjonskapsler"
      className="fixed bottom-3 left-3 right-3 z-50 mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-lg sm:bottom-6 sm:left-6 sm:right-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-gray-700">
          Vi bruker kun nødvendige informasjonskapsler (innloggings-cookie).
          Ingen sporing, ingen tredjeparter.{" "}
          <Link href="/personvern" className="underline hover:text-gray-900">
            Les mer
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Greit
        </button>
      </div>
    </div>
  );
}
