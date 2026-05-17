import { auth } from "@/auth";

// E-postadressen til bestilly-operatøren (deg). Settes som miljøvariabel.
function getOperatorEmail(): string | undefined {
  const value = process.env.OPERATOR_EMAIL?.trim().toLowerCase();
  return value || undefined;
}

// Sjekker om innlogget bruker er bestilly-operatøren.
export async function isOperator(): Promise<boolean> {
  const operatorEmail = getOperatorEmail();
  if (!operatorEmail) return false;
  const session = await auth();
  return session?.user?.email?.toLowerCase() === operatorEmail;
}
