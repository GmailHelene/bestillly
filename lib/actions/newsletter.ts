"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { businesses, newsletters, subscribers } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { isDemoBusiness, requireBusinessId } from "@/lib/session";
import { DEMO_BLOCK_MESSAGE, DEMO_SLUG } from "@/lib/demo";
import { escapeHtml } from "@/lib/html";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SubscribeState = { error: string } | { ok: true } | undefined;

export async function subscribe(
  slug: string,
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Fyll inn en gyldig e-postadresse." };
  }

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.slug, slug),
  });
  if (!business) return { error: "Fant ikke bedriften." };
  if (business.slug === DEMO_SLUG) return { ok: true };

  const existing = await db.query.subscribers.findFirst({
    where: and(
      eq(subscribers.businessId, business.id),
      eq(subscribers.email, email),
    ),
  });
  if (!existing) {
    await db.insert(subscribers).values({ businessId: business.id, email });
  }
  return { ok: true };
}

export type NewsletterState =
  | { error: string }
  | { ok: true; count: number }
  | undefined;

export async function sendNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };

  const subject = String(formData.get("subject") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!subject) return { error: "Emne er påkrevd." };
  if (!content) return { error: "Innhold er påkrevd." };

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });
  const list = await db.query.subscribers.findMany({
    where: eq(subscribers.businessId, businessId),
  });
  if (list.length === 0) {
    return { error: "Du har ingen abonnenter ennå." };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const contentHtml = escapeHtml(content).replace(/\n/g, "<br>");

  for (const subscriber of list) {
    const unsubscribeUrl = `${baseUrl}/avmeld/${subscriber.unsubscribeToken}`;
    await sendEmail({
      to: subscriber.email,
      subject,
      html: `
        <h2>${escapeHtml(subject)}</h2>
        <p>${contentHtml}</p>
        <hr>
        <p style="font-size:12px;color:#888">
          Du får denne e-posten fordi du abonnerer på nyhetsbrevet fra
          ${business?.name ?? "bedriften"}.
          <a href="${unsubscribeUrl}">Meld deg av</a>.
        </p>
      `,
    });
  }

  await db.insert(newsletters).values({
    businessId,
    subject,
    content,
    recipientCount: list.length,
  });
  revalidatePath("/admin/nyhetsbrev");
  return { ok: true, count: list.length };
}

export async function unsubscribe(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  if (!UUID_PATTERN.test(token)) return;
  await db
    .delete(subscribers)
    .where(eq(subscribers.unsubscribeToken, token));
  revalidatePath(`/avmeld/${token}`);
}
