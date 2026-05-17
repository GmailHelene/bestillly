import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, businesses, services } from "@/db/schema";

let businessId: string;
let serviceId: string;

beforeAll(async () => {
  const [b] = await db
    .insert(businesses)
    .values({
      slug: `itest-booking-${randomUUID()}`,
      name: "Integrasjonstest",
      email: "itest@example.com",
    })
    .returning();
  businessId = b.id;
  const [s] = await db
    .insert(services)
    .values({
      businessId,
      name: "Klipp",
      durationMinutes: 30,
      priceNok: 500,
    })
    .returning();
  serviceId = s.id;
});

afterAll(async () => {
  await db.delete(businesses).where(eq(businesses.id, businessId));
});

describe("dobbeltbooking (integrasjon)", () => {
  it("databasen blokkerer to bekreftede bookinger på samme tid", async () => {
    const startsAt = new Date("2099-09-09T10:00:00Z");
    const endsAt = new Date("2099-09-09T10:30:00Z");
    const base = {
      businessId,
      serviceId,
      customerEmail: "kunde@example.com",
      startsAt,
      endsAt,
    };

    await db.insert(bookings).values({ ...base, customerName: "Kunde A" });

    let blockedWith23505 = false;
    try {
      await db.insert(bookings).values({ ...base, customerName: "Kunde B" });
    } catch (err) {
      const e = err as { code?: string; cause?: { code?: string } };
      blockedWith23505 = e?.code === "23505" || e?.cause?.code === "23505";
    }
    expect(blockedWith23505).toBe(true);
  });

  it("tillater ny booking på samme tid når den forrige er kansellert", async () => {
    const startsAt = new Date("2099-09-10T10:00:00Z");
    const endsAt = new Date("2099-09-10T10:30:00Z");
    const base = {
      businessId,
      serviceId,
      customerEmail: "kunde@example.com",
      startsAt,
      endsAt,
    };

    await db
      .insert(bookings)
      .values({ ...base, customerName: "Kunde A", status: "cancelled" });
    // Det partielle indekset dekker kun bekreftede bookinger — dette skal gå.
    await db.insert(bookings).values({ ...base, customerName: "Kunde B" });
    expect(true).toBe(true);
  });
});
