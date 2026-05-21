"use server";

import { sendEmail } from "@/lib/email";
import { escapeHtml } from "@/lib/html";
import { getContactInbox } from "@/lib/operator";
import { rateLimit, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

export type ContactState = { error: string } | { ok: true } | undefined;

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  if (!(await rateLimit("contact", 5, 60_000))) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name) return { error: "Fyll inn navnet ditt." };
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Fyll inn en gyldig e-postadresse." };
  }
  if (!message) return { error: "Skriv en melding." };

  // Henvendelser fra forsidens kontaktskjema havner i CONTACT_INBOX hvis
  // satt, ellers i EMAIL_FROM (support@codemedic.no — Brevo-verifisert).
  // OPERATOR_EMAIL er bare for /drift-tilgang, ikke for inngående post.
  const to = getContactInbox();
  if (!to) {
    return {
      error: "Kontaktskjemaet er ikke satt opp ennå. Prøv igjen senere.",
    };
  }

  await sendEmail({
    to,
    replyTo: email,
    subject: `Kontaktskjema: ${name}`,
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
