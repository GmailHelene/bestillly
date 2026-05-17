"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { isOperator } from "@/lib/operator";

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Registrerer en betaling: aktiverer kontoen og forlenger med ett år.
export async function registerPayment(formData: FormData): Promise<void> {
  if (!(await isOperator())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, id),
  });
  if (!business) return;

  const today = new Date();
  const current = business.activeUntil
    ? new Date(business.activeUntil)
    : today;
  const base = current > today ? current : today;
  const newUntil = new Date(base);
  newUntil.setFullYear(newUntil.getFullYear() + 1);

  await db
    .update(businesses)
    .set({ status: "active", activeUntil: toDateString(newUntil) })
    .where(eq(businesses.id, id));
  revalidatePath("/drift");
}

// Setter en konto på pause (manglende betaling).
export async function pauseBusiness(formData: FormData): Promise<void> {
  if (!(await isOperator())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db
    .update(businesses)
    .set({ status: "paused" })
    .where(eq(businesses.id, id));
  revalidatePath("/drift");
}

// Aktiverer en konto igjen uten å endre betalt-til-dato.
export async function activateBusiness(formData: FormData): Promise<void> {
  if (!(await isOperator())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db
    .update(businesses)
    .set({ status: "active" })
    .where(eq(businesses.id, id));
  revalidatePath("/drift");
}
