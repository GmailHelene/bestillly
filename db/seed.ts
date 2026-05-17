import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { businesses, services, workingHours } from "./schema";
import type { OnepageContent } from "../lib/onepage";

config({ path: ".env.local" });

// Oppretter (eller gjenoppretter) en komplett demo-bedrift på /demo som
// besøkende kan klikke seg rundt i fra salgssiden.
async function seed() {
  const existing = await db.query.businesses.findFirst({
    where: eq(businesses.slug, "demo"),
  });
  if (existing) {
    // Sletting kaskaderer til behandlinger, åpningstider og bookinger.
    await db.delete(businesses).where(eq(businesses.id, existing.id));
  }

  const onepageContent: OnepageContent = {
    header: {
      tagline: "Frisør & velvære i Vikersund",
    },
    sections: {
      aboutText:
        "Hos Demo Frisør & Velvære er du i trygge hender. Vi tar oss tid til hver enkelt kunde, og målet vårt er at du går herfra med et smil. Velkommen innom!",
      showOpeningHours: true,
    },
    seo: {
      keywords: "frisør, klipp, farging, vippeforlengelse, Vikersund",
    },
    social: {
      instagram: "https://instagram.com/",
      facebook: "https://facebook.com/",
    },
    footer: {
      orgNumber: "999 888 777",
      note: "Drop-in når vi har ledig tid — eller book enkelt på nett.",
    },
  };

  const [demo] = await db
    .insert(businesses)
    .values({
      slug: "demo",
      name: "Demo Frisør & Velvære",
      email: "demo@bestilly.no",
      phone: "12 34 56 78",
      address: "Eksempelgata 1, 3370 Vikersund",
      description:
        "Dette er en demoside som viser hvordan bestilly ser ut for kundene dine. Prøv gjerne å booke en time!",
      template: "eleganse",
      onepageContent,
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
    {
      businessId: demo.id,
      name: "Styling før fest",
      description: "Oppsett og styling til den store anledningen.",
      durationMinutes: 45,
      priceNok: 650,
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
