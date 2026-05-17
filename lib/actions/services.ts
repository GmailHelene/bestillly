"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";
import { isDemoBusiness, requireBusinessId } from "@/lib/session";
import { DEMO_BLOCK_MESSAGE } from "@/lib/demo";

export type ServiceState = { error: string } | undefined;

type ParsedService =
  | { ok: true; name: string; description: string | null; durationMinutes: number; priceNok: number }
  | { ok: false; error: string };

function parseService(formData: FormData): ParsedService {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const durationMinutes = Number(formData.get("durationMinutes"));
  const priceNok = Number(formData.get("priceNok"));

  if (!name) return { ok: false, error: "Navn er påkrevd." };
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return { ok: false, error: "Varighet må være et positivt antall minutter." };
  }
  if (!Number.isFinite(priceNok) || priceNok < 0) {
    return { ok: false, error: "Pris må være 0 eller mer." };
  }
  return {
    ok: true,
    name,
    description: description || null,
    durationMinutes: Math.round(durationMinutes),
    priceNok: Math.round(priceNok),
  };
}

export async function createService(
  _prev: ServiceState,
  formData: FormData,
): Promise<ServiceState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };
  const parsed = parseService(formData);
  if (!parsed.ok) return { error: parsed.error };

  await db.insert(services).values({
    businessId,
    name: parsed.name,
    description: parsed.description,
    durationMinutes: parsed.durationMinutes,
    priceNok: parsed.priceNok,
  });
  revalidatePath("/admin/behandlinger");
  return undefined;
}

export async function updateService(
  _prev: ServiceState,
  formData: FormData,
): Promise<ServiceState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Mangler behandlings-ID." };

  const parsed = parseService(formData);
  if (!parsed.ok) return { error: parsed.error };

  await db
    .update(services)
    .set({
      name: parsed.name,
      description: parsed.description,
      durationMinutes: parsed.durationMinutes,
      priceNok: parsed.priceNok,
    })
    .where(and(eq(services.id, id), eq(services.businessId, businessId)));
  revalidatePath("/admin/behandlinger");
  return undefined;
}

export async function deleteService(formData: FormData) {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db
    .delete(services)
    .where(and(eq(services.id, id), eq(services.businessId, businessId)));
  revalidatePath("/admin/behandlinger");
}
