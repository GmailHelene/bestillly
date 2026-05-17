import { Resend } from "resend";

// Sender e-post via Resend. Hvis nøkler ikke er satt, hoppes sendingen
// over (logges) slik at booking fortsatt fungerer i utvikling.
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn(
      `[e-post] Hopper over sending til ${params.to} — RESEND_API_KEY/EMAIL_FROM mangler.`,
    );
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  } catch (error) {
    // En feilet e-post skal ikke velte selve bookingen.
    console.error("[e-post] Sending feilet:", error);
  }
}
