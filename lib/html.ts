// Escaper brukerinput for trygg innsetting i e-post-HTML.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Serialiserer et objekt til JSON for trygg innsetting i en <script type=
// "application/ld+json">-blokk. JSON.stringify escaper ikke "<", så et
// "</script>" i brukerdata kunne ellers bryte ut av script-taggen.
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
