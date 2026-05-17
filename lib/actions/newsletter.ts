"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { businesses, newsletters, subscribers } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { isDemoBusiness, requireBusinessId } from "@/lib/session";
import { DEMO_BLOCK_MESSAGE, DEMO_SLUG } from "@/lib/demo";
import { resolveTheme } from "@/lib/themes";
import { rateLimit, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import {
  blocksToPlainText,
  parseBlocks,
  renderNewsletterEmail,
  type NewsletterBlock,
} from "@/lib/newsletter-blocks";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SubscribeState = { error: string } | { ok: true } | undefined;

export async function subscribe(
  slug: string,
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  if (!(await rateLimit("subscribe", 6, 60_000))) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Fyll inn en gyldig e-postadresse." };
  }
  if (formData.get("consent") == null) {
    return { error: "Du må samtykke for å melde deg på nyhetsbrevet." };
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

export async function sendNewsletter(input: {
  subject: string;
  blocks: NewsletterBlock[];
}): Promise<NewsletterState> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return { error: DEMO_BLOCK_MESSAGE };

  const subject = String(input.subject ?? "").trim();
  const blocks = parseBlocks(input.blocks);
  if (!subject) return { error: "Emne er påkrevd." };
  if (blocks.length === 0) {
    return { error: "Legg til minst én blokk med innhold." };
  }

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });
  if (!business) return { error: "Fant ikke bedriften." };

  const list = await db.query.subscribers.findMany({
    where: eq(subscribers.businessId, businessId),
  });
  if (list.length === 0) {
    return { error: "Du har ingen abonnenter ennå." };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const accentColor = resolveTheme(business.template).accent;

  for (const subscriber of list) {
    await sendEmail({
      to: subscriber.email,
      subject,
      html: renderNewsletterEmail({
        blocks,
        accentColor,
        businessName: business.name,
        unsubscribeUrl: `${baseUrl}/avmeld/${subscriber.unsubscribeToken}`,
      }),
    });
  }

  await db.insert(newsletters).values({
    businessId,
    subject,
    content: blocksToPlainText(blocks),
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

// Fjerner en abonnent fra bedriftens admin.
export async function deleteSubscriber(formData: FormData): Promise<void> {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db
    .delete(subscribers)
    .where(
      and(eq(subscribers.id, id), eq(subscribers.businessId, businessId)),
    );
  revalidatePath("/admin/abonnenter");
}
