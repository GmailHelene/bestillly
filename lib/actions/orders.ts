"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { businesses, orders, products } from "@/db/schema";
import type { OrderItem } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { escapeHtml } from "@/lib/html";
import { isDemoBusiness, requireBusinessId } from "@/lib/session";
import { DEMO_SLUG } from "@/lib/demo";
import { rateLimit, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export type OrderResult =
  | {
      ok: true;
      orderNumber: number;
      totalNok: number;
      vippsNumber: string | null;
    }
  | { error: string };

export type CreateOrderInput = {
  slug: string;
  items: { productId: string; qty: number }[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

export async function createOrder(
  input: CreateOrderInput,
): Promise<OrderResult> {
  if (!(await rateLimit("order", 10, 60_000))) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  const customerName = String(input.customerName ?? "").trim();
  const customerEmail = String(input.customerEmail ?? "")
    .trim()
    .toLowerCase();
  const customerPhone = String(input.customerPhone ?? "").trim();

  if (!customerName) return { error: "Fyll inn navnet ditt." };
  if (!EMAIL_PATTERN.test(customerEmail)) {
    return { error: "Fyll inn en gyldig e-postadresse." };
  }
  if (!customerPhone) return { error: "Fyll inn telefonnummeret ditt." };

  const cartItems = (input.items ?? []).filter((i) => i && i.qty > 0);
  if (cartItems.length === 0) return { error: "Handlekurven er tom." };

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.slug, String(input.slug)),
  });
  if (!business) return { error: "Fant ikke bedriften." };
  if (business.status === "paused") {
    return { error: "Butikken er ikke tilgjengelig for øyeblikket." };
  }

  const found = await db.query.products.findMany({
    where: and(
      eq(products.businessId, business.id),
      inArray(
        products.id,
        cartItems.map((i) => String(i.productId)),
      ),
    ),
  });
  const byId = new Map(found.map((p) => [p.id, p]));

  const orderItems: OrderItem[] = [];
  for (const cartItem of cartItems) {
    const product = byId.get(String(cartItem.productId));
    if (!product || !product.inStock) continue;
    orderItems.push({
      name: product.name,
      priceNok: product.priceNok,
      qty: Math.max(1, Math.round(cartItem.qty)),
    });
  }
  if (orderItems.length === 0) {
    return { error: "Ingen av varene er tilgjengelige." };
  }

  const subtotalNok = orderItems.reduce(
    (sum, item) => sum + item.priceNok * item.qty,
    0,
  );
  const shippingNok = business.shippingFree ? 0 : business.shippingFee;
  const totalNok = subtotalNok + shippingNok;

  // Demo-bedriften: vis vellykket bestilling uten å lagre eller sende e-post.
  if (business.slug === DEMO_SLUG) {
    return {
      ok: true,
      orderNumber: 1042,
      totalNok,
      vippsNumber: business.vippsNumber,
    };
  }

  const [order] = await db
    .insert(orders)
    .values({
      businessId: business.id,
      customerName,
      customerEmail,
      customerPhone,
      items: orderItems,
      subtotalNok,
      shippingNok,
      totalNok,
    })
    .returning();

  const itemsHtml = orderItems
    .map(
      (i) =>
        `<li>${i.qty} × ${escapeHtml(i.name)} — ${i.priceNok * i.qty} kr</li>`,
    )
    .join("");
  const vippsLine = business.vippsNumber
    ? `Betal <strong>${totalNok} kr</strong> med Vipps til <strong>${business.vippsNumber}</strong>, og merk betalingen med «ordre #${order.orderNumber}».`
    : `${escapeHtml(business.name)} tar kontakt med deg om betaling.`;

  await sendEmail({
    to: customerEmail,
    subject: `Ordrebekreftelse #${order.orderNumber} — ${business.name}`,
    html: `
      <h2>Takk for bestillingen!</h2>
      <p>Ordre #${order.orderNumber} hos ${escapeHtml(business.name)}:</p>
      <ul>${itemsHtml}</ul>
      <p>Frakt: ${shippingNok === 0 ? "Gratis" : `${shippingNok} kr`}</p>
      <p><strong>Totalt: ${totalNok} kr</strong></p>
      <p>${vippsLine}</p>
    `,
  });
  await sendEmail({
    to: business.email,
    subject: `Ny ordre #${order.orderNumber}`,
    html: `
      <h2>Ny ordre #${order.orderNumber}</h2>
      <ul>${itemsHtml}</ul>
      <p>Frakt: ${shippingNok === 0 ? "Gratis" : `${shippingNok} kr`} · Totalt: ${totalNok} kr</p>
      <p><strong>Kunde:</strong> ${escapeHtml(customerName)}, ${escapeHtml(customerEmail)}, ${escapeHtml(customerPhone)}</p>
    `,
  });

  revalidatePath("/admin/bestillinger");
  return {
    ok: true,
    orderNumber: order.orderNumber,
    totalNok,
    vippsNumber: business.vippsNumber,
  };
}

export async function markOrderPaid(formData: FormData) {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db
    .update(orders)
    .set({ status: "paid" })
    .where(and(eq(orders.id, id), eq(orders.businessId, businessId)));
  revalidatePath("/admin/bestillinger");
}

export async function cancelOrder(formData: FormData) {
  const businessId = await requireBusinessId();
  if (await isDemoBusiness(businessId)) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db
    .update(orders)
    .set({ status: "cancelled" })
    .where(and(eq(orders.id, id), eq(orders.businessId, businessId)));
  revalidatePath("/admin/bestillinger");
}
