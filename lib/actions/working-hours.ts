"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { availabilityExceptions, workingHours } from "@/db/schema";
import { isDemoBusiness, requireBusinessId } from "@/lib/session";
import { DEMO_BLOCK_MESSAGE } from "@/lib/demo";

export type ActionState = { error: string } | { ok: true } | undefined;

const DAY_NAMES = [
  "",
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
  "søndag",
];

export async function saveWorkingHours(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };

  const rows: {
    businessId: string;
    weekday: number;
    startTime: string;
    endTime: string;
  }[] = [];

  for (let weekday = 1; weekday <= 7; weekday++) {
    if (formData.get(`open-${weekday}`) == null) continue;
    const startTime = String(formData.get(`start-${weekday}`) ?? "");
    const endTime = String(formData.get(`end-${weekday}`) ?? "");
    if (!startTime || !endTime) {
      return { error: `Fyll ut tider for ${DAY_NAMES[weekday]}.` };
    }
    if (startTime >= endTime) {
      return {
        error: `Sluttid må være etter starttid for ${DAY_NAMES[weekday]}.`,
      };
    }
    rows.push({ businessId, weekday, startTime, endTime });
  }

  // Erstatt hele ukerytmen: slett eksisterende, sett inn de åpne dagene.
  await db.delete(workingHours).where(eq(workingHours.businessId, businessId));
  if (rows.length > 0) {
    await db.insert(workingHours).values(rows);
  }
  revalidatePath("/admin/apningstider");
  return { ok: true };
}

export async function addException(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };
  const date = String(formData.get("date") ?? "");
  const type = String(formData.get("type") ?? "");

  if (!date) return { error: "Velg en dato." };
  if (type !== "closed" && type !== "custom_hours") {
    return { error: "Velg en gyldig type." };
  }

  const existing = await db.query.availabilityExceptions.findFirst({
    where: and(
      eq(availabilityExceptions.businessId, businessId),
      eq(availabilityExceptions.date, date),
    ),
  });
  if (existing) {
    return { error: "Det finnes allerede et avvik for denne datoen." };
  }

  if (type === "custom_hours") {
    const startTime = String(formData.get("startTime") ?? "");
    const endTime = String(formData.get("endTime") ?? "");
    if (!startTime || !endTime) {
      return { error: "Fyll ut tider for egne åpningstider." };
    }
    if (startTime >= endTime) {
      return { error: "Sluttid må være etter starttid." };
    }
    await db
      .insert(availabilityExceptions)
      .values({ businessId, date, type, startTime, endTime });
  } else {
    await db.insert(availabilityExceptions).values({ businessId, date, type });
  }
  revalidatePath("/admin/apningstider");
  return { ok: true };
}

export async function deleteException(formData: FormData) {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db
    .delete(availabilityExceptions)
    .where(
      and(
        eq(availabilityExceptions.id, id),
        eq(availabilityExceptions.businessId, businessId),
      ),
    );
  revalidatePath("/admin/apningstider");
}
