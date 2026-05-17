"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { escapeHtml } from "@/lib/html";
import { DEMO_SLUG } from "@/lib/demo";

export type BusinessContactState =
  | { error: string }
  | { ok: true }
  | undefined;

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Sender en melding fra kontaktskjemaet på en bedrifts onepage til bedriften.
export async function sendBusinessMessage(
  slug: string,
  _prev: BusinessContactState,
  formData: FormData,
): Promise<BusinessContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name) return { error: "Fyll inn navnet ditt." };
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Fyll inn en gyldig e-postadresse." };
  }
  if (!message) return { error: "Skriv en melding." };

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.slug, slug),
  });
  if (!business) return { error: "Fant ikke bedriften." };

  // Demo-bedriften: vis vellykket uten å sende.
  if (business.slug === DEMO_SLUG) return { ok: true };

  await sendEmail({
    to: business.email,
    replyTo: email,
    subject: `Melding fra siden din: ${name}`,
    html: `
      <h2>Ny melding fra kontaktskjemaet</h2>
      <p><strong>Navn:</strong> ${escapeHtml(name)}</p>
      <p><strong>E-post:</strong> ${escapeHtml(email)}</p>
      <p><strong>Melding:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    `,
  });

  return { ok: true };
}
