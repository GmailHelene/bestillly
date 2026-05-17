import { escapeHtml } from "@/lib/html";

// En blokk i et nyhetsbrev. Editoren setter dem sammen i rekkefølge.
export type NewsletterBlock =
  | { type: "heading"; text: string }
  | { type: "text"; text: string }
  | { type: "image"; url: string }
  | { type: "button"; label: string; url: string };

// Leser en ukjent verdi trygt til en blokkliste (validering av input).
export function parseBlocks(raw: unknown): NewsletterBlock[] {
  if (!Array.isArray(raw)) return [];
  const blocks: NewsletterBlock[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const b = item as Record<string, unknown>;
    if (b.type === "heading" && typeof b.text === "string") {
      blocks.push({ type: "heading", text: b.text });
    } else if (b.type === "text" && typeof b.text === "string") {
      blocks.push({ type: "text", text: b.text });
    } else if (b.type === "image" && typeof b.url === "string") {
      blocks.push({ type: "image", url: b.url });
    } else if (
      b.type === "button" &&
      typeof b.label === "string" &&
      typeof b.url === "string"
    ) {
      blocks.push({ type: "button", label: b.label, url: b.url });
    }
  }
  return blocks;
}

// Flat tekstversjon — lagres som historikk-record.
export function blocksToPlainText(blocks: NewsletterBlock[]): string {
  return blocks
    .map((b) => {
      if (b.type === "heading" || b.type === "text") return b.text;
      if (b.type === "button") return `${b.label}: ${b.url}`;
      return "[bilde]";
    })
    .join("\n\n");
}

function blockToHtml(block: NewsletterBlock, accent: string): string {
  switch (block.type) {
    case "heading":
      return `<h2 style="font-size:20px;color:#111111;margin:24px 0 8px;">${escapeHtml(
        block.text,
      )}</h2>`;
    case "text":
      return `<p style="font-size:15px;line-height:1.6;color:#333333;margin:8px 0;">${escapeHtml(
        block.text,
      ).replace(/\n/g, "<br>")}</p>`;
    case "image":
      return block.url
        ? `<img src="${block.url}" alt="" style="display:block;max-width:100%;border-radius:8px;margin:12px 0;">`
        : "";
    case "button":
      return block.url
        ? `<p style="margin:16px 0;"><a href="${block.url}" style="display:inline-block;background:${accent};color:#ffffff;text-decoration:none;padding:11px 22px;border-radius:8px;font-size:14px;">${escapeHtml(
            block.label || "Les mer",
          )}</a></p>`
        : "";
  }
}

// Bygger et mobilvennlig e-post-HTML fra blokkene.
export function renderNewsletterEmail(params: {
  blocks: NewsletterBlock[];
  accentColor: string;
  businessName: string;
  unsubscribeUrl: string;
}): string {
  const body = params.blocks
    .map((b) => blockToHtml(b, params.accentColor))
    .join("");
  return `
    <div style="max-width:600px;width:100%;margin:0 auto;padding:8px 16px;font-family:Arial,Helvetica,sans-serif;">
      ${body}
      <hr style="margin-top:32px;border:none;border-top:1px solid #eeeeee;">
      <p style="font-size:12px;color:#999999;">
        Du får denne e-posten fordi du abonnerer på nyhetsbrevet fra
        ${escapeHtml(params.businessName)}.
        <a href="${params.unsubscribeUrl}" style="color:#999999;">Meld deg av</a>.
      </p>
    </div>
  `;
}
