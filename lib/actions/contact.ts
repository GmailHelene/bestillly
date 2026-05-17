"use server";

import { sendEmail } from "@/lib/email";

export type ContactState = { error: string } | { ok: true } | undefined;

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name) return { error: "Fyll inn navnet ditt." };
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Fyll inn en gyldig e-postadresse." };
  }
  if (!message) return { error: "Skriv en melding." };

  const to = process.env.EMAIL_FROM;
  if (!to) {
    return { error: "Kontaktskjemaet er ikke satt opp ennå. Prøv igjen senere." };
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
