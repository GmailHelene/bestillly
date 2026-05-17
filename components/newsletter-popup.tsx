"use client";

import { useEffect, useState } from "react";
import { NewsletterSignup } from "@/components/newsletter-signup";

// Viser en nyhetsbrev-popup én gang per besøkende (lagres i localStorage).
export function NewsletterPopup({
  slug,
  businessName,
  accentColor,
}: {
  slug: string;
  businessName: string;
  accentColor: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const key = `bestilly-newsletter-${slug}`;
    if (localStorage.getItem(key)) return;
    const timer = setTimeout(() => {
      localStorage.setItem(key, "1");
      setOpen(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [slug]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="font-semibold">Meld deg på nyhetsbrevet</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Lukk"
            className="text-xl leading-none text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Få nyheter og tilbud fra {businessName}.
        </p>
        <div className="mt-3">
          <NewsletterSignup slug={slug} accentColor={accentColor} />
        </div>
      </div>
    </div>
  );
}
