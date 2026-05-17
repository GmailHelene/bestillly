import nodemailer from "nodemailer";

// Sender e-post via Brevo (SMTP). Hvis nøkler ikke er satt, hoppes
// sendingen over (logges) slik at booking fortsatt fungerer i utvikling.
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM;

  if (!host || !port || !user || !pass || !from) {
    console.warn(
      `[e-post] Hopper over sending til ${params.to} — SMTP-konfigurasjon mangler.`,
    );
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: false, // port 587 bruker STARTTLS
      auth: { user, pass },
    });
    await transporter.sendMail({
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
