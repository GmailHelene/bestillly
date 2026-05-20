import nodemailer from "nodemailer";

// Sender e-post via Brevo (SMTP). Hvis nøkler ikke er satt, hoppes
// sendingen over (logges) slik at booking fortsatt fungerer i utvikling.
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
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
      // Eksplisitte timeouts — uten disse kan SMTP-kallet henge nesten
      // ubegrenset hvis Brevo svarer tregt eller blokkerer. Det får
      // skjemaknappen til å stå fast på «Sender…». Med 10 sek per fase
      // feiler kallet kontrollert, og handlingen returnerer.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 10_000,
    });
    const info = await transporter.sendMail({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo,
    });
    console.log(
      `[e-post] Sendt til ${params.to} — messageId=${info.messageId}`,
    );
  } catch (error) {
    // En feilet e-post skal ikke velte selve bookingen.
    console.error("[e-post] Sending feilet:", error);
  }
}
