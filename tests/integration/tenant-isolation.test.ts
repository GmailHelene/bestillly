import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses, services } from "@/db/schema";

let aId: string;
let bId: string;

beforeAll(async () => {
  const [a] = await db
    .insert(businesses)
    .values({
      slug: `itest-tenant-a-${randomUUID()}`,
      name: "Bedrift A",
      email: "a@example.com",
    })
    .returning();
  const [b] = await db
    .insert(businesses)
    .values({
      slug: `itest-tenant-b-${randomUUID()}`,
      name: "Bedrift B",
      email: "b@example.com",
    })
    .returning();
  aId = a.id;
  bId = b.id;
  await db
    .insert(services)
    .values({
      businessId: aId,
      name: "A-tjeneste",
      durationMinutes: 30,
      priceNok: 100,
    });
  await db
    .insert(services)
    .values({
      businessId: bId,
      name: "B-tjeneste",
      durationMinutes: 30,
      priceNok: 200,
    });
});

afterAll(async () => {
  await db.delete(businesses).where(eq(businesses.id, aId));
  await db.delete(businesses).where(eq(businesses.id, bId));
});

describe("multi-tenant-isolasjon (integrasjon)", () => {
  it("en spørring scopet til én bedrift returnerer ikke andre bedrifters data", async () => {
    const aServices = await db.query.services.findMany({
      where: eq(services.businessId, aId),
    });
    expect(aServices).toHaveLength(1);
    expect(aServices[0].name).toBe("A-tjeneste");
    expect(aServices.every((s) => s.businessId === aId)).toBe(true);

    const bServices = await db.query.services.findMany({
      where: eq(services.businessId, bId),
    });
    expect(bServices).toHaveLength(1);
    expect(bServices[0].name).toBe("B-tjeneste");
  });
});
