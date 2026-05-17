import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Henter innlogget bedrifts-ID, eller sender til innlogging hvis ingen sesjon.
export async function requireBusinessId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.businessId) {
    redirect("/login");
  }
  return session.user.businessId;
}
