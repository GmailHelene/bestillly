import Script from "next/script";

// Plausible Analytics, GDPR-vennlig, ingen cookies, ingen persondata.
// Aktiveres ved å sette NEXT_PUBLIC_PLAUSIBLE_DOMAIN i miljøvariabler.
// Hvis variabelen ikke er satt, lastes ingenting.
export function Plausible() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
