import { auth } from "@/auth";

// E-postadressen til bestilly-operatøren (deg). Settes som miljøvariabel.
// Brukes til adgangskontroll i /drift — IKKE som mottaker for kontaktskjemaer.
export function getOperatorEmail(): string | undefined {
  const value = process.env.OPERATOR_EMAIL?.trim().toLowerCase();
  return value || undefined;
}

// Innboksen som tar imot henvendelser fra kontaktskjemaet på forsiden.
// Foretrekker CONTACT_INBOX hvis satt, ellers EMAIL_FROM (Brevo-avsenderen,
// som vi vet er en verifisert mailbox). OPERATOR_EMAIL brukes ikke her
// — den kan være en privat Gmail, og avsenderen kan da bli avvist på SPF.
export function getContactInbox(): string | undefined {
  const explicit = process.env.CONTACT_INBOX?.trim();
  if (explicit) return explicit;
  const from = process.env.EMAIL_FROM?.trim();
  return from || undefined;
}

// Sjekker om innlogget bruker er bestilly-operatøren.
export async function isOperator(): Promise<boolean> {
  const operatorEmail = getOperatorEmail();
  if (!operatorEmail) return false;
  const session = await auth();
  return session?.user?.email?.toLowerCase() === operatorEmail;
}
