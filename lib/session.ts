import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { DEMO_SLUG } from "@/lib/demo";

// Henter innlogget bedrifts-ID, eller sender til innlogging hvis ingen sesjon.
export async function requireBusinessId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.businessId) {
    redirect("/login");
  }
  return session.user.businessId;
}

// Sjekker om en bedrift er demo-bedriften (endringer skal blokkeres).
export async function isDemoBusiness(businessId: string): Promise<boolean> {
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
    columns: { slug: true },
  });
  return business?.slug === DEMO_SLUG;
}
