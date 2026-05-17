import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { businesses, services, workingHours } from "./schema";

config({ path: ".env.local" });

// Oppretter (eller gjenoppretter) en demo-bedrift på /demo som besøkende
// kan klikke seg rundt i fra salgssiden.
async function seed() {
  const existing = await db.query.businesses.findFirst({
    where: eq(businesses.slug, "demo"),
  });
  if (existing) {
    // Sletting kaskaderer til behandlinger, åpningstider og bookinger.
    await db.delete(businesses).where(eq(businesses.id, existing.id));
  }

  const [demo] = await db
    .insert(businesses)
    .values({
      slug: "demo",
      name: "Demo Frisør & Velvære",
      email: "demo@bestilly.no",
      phone: "12 34 56 78",
      address: "Eksempelgata 1, 0123 Oslo",
      description:
        "Dette er en demoside som viser hvordan bestilly ser ut for kundene dine. Prøv gjerne å booke en time!",
    })
    .returning();

  await db.insert(services).values([
    {
      businessId: demo.id,
      name: "Klipp",
      description: "Klipp og styling tilpasset deg.",
      durationMinutes: 45,
      priceNok: 550,
    },
    {
      businessId: demo.id,
      name: "Farging",
      description: "Helfarge med profesjonelle produkter.",
      durationMinutes: 90,
      priceNok: 1200,
    },
    {
      businessId: demo.id,
      name: "Vippeforlengelse",
      description: "Et fyldig og naturlig blikk.",
      durationMinutes: 60,
      priceNok: 800,
    },
  ]);

  await db.insert(workingHours).values(
    [1, 2, 3, 4, 5].map((weekday) => ({
      businessId: demo.id,
      weekday,
      startTime: "09:00",
      endTime: "16:00",
    })),
  );

  console.log("Demo-bedrift opprettet på /demo");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
