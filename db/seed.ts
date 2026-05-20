import { config } from "dotenv";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./index";
import {
  bookings,
  businesses,
  newsletters,
  posts,
  products,
  services,
  subscribers,
  users,
  workingHours,
} from "./schema";
import type { OnepageContent } from "../lib/onepage";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../lib/demo";
import { buildDemoMarketingProfile } from "../lib/demo-marketing";

config({ path: ".env.local" });

function bookingDate(daysFromNow: number, hour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d;
}

// Oppretter (eller gjenoppretter) en komplett demo-bedrift på /demo som
// viser hele løsningen: booking, nettbutikk, blogg og nyhetsbrev.
async function seed() {
  const existing = await db.query.businesses.findFirst({
    where: eq(businesses.slug, "demo"),
  });
  if (existing) {
    await db.delete(businesses).where(eq(businesses.id, existing.id));
  }

  const onepageContent: OnepageContent = {
    header: { tagline: "Frisør & velvære i Vikersund" },
    sections: {
      aboutText:
        "Hos Demo Frisør & Velvære er du i trygge hender. Vi tar oss tid til hver enkelt kunde, og målet vårt er at du går herfra med et smil. Velkommen innom!",
      showOpeningHours: true,
      showContactForm: true,
      showBlog: true,
      showNewsletter: true,
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
      email: DEMO_EMAIL,
      phone: "12 34 56 78",
      address: "Eksempelgata 1, 3370 Vikersund",
      description:
        "Dette er en demoside som viser hvordan Bestilly ser ut for kundene dine. Prøv gjerne å booke en time eller handle i butikken!",
      template: "eleganse",
      onepageContent,
      vippsNumber: "123456",
      shippingFree: false,
      shippingFee: 79,
      shopEnabled: true,
      marketingProfile: buildDemoMarketingProfile(),
    })
    .returning();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  await db
    .insert(users)
    .values({ businessId: demo.id, email: DEMO_EMAIL, passwordHash });

  const insertedServices = await db
    .insert(services)
    .values([
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
    ])
    .returning();

  await db.insert(workingHours).values(
    [1, 2, 3, 4, 5].map((weekday) => ({
      businessId: demo.id,
      weekday,
      startTime: "09:00",
      endTime: "16:00",
    })),
  );

  await db.insert(products).values([
    {
      businessId: demo.id,
      name: "Hårpleiesett",
      description: "Sjampo og balsam for daglig pleie.",
      priceNok: 349,
    },
    {
      businessId: demo.id,
      name: "Profesjonell hårføner",
      description: "Den vi bruker i salongen.",
      priceNok: 899,
    },
    {
      businessId: demo.id,
      name: "Gavekort",
      description: "Perfekt gave — kan brukes på alle behandlinger.",
      priceNok: 500,
    },
  ]);

  await db.insert(posts).values([
    {
      businessId: demo.id,
      slug: "velkommen",
      title: "Velkommen til vår nye nettside!",
      content:
        "Nå kan du booke time hos oss døgnet rundt, rett her på nettsiden. Du finner også nettbutikken vår med utvalgte produkter. Velkommen innom!",
      published: true,
    },
    {
      businessId: demo.id,
      slug: "sommertips-for-haret",
      title: "Sommertips for håret",
      content:
        "Sol, salt og klor sliter på håret om sommeren. Vårt beste tips: bruk en god leave-in-balsam, og skyll håret med ferskvann etter bading. Stikk innom for en klipp før ferien!",
      published: true,
    },
  ]);

  await db.insert(subscribers).values(
    ["kari@eksempel.no", "per@eksempel.no", "anne@eksempel.no"].map(
      (email) => ({ businessId: demo.id, email }),
    ),
  );

  await db.insert(newsletters).values({
    businessId: demo.id,
    subject: "Sommertilbud hos oss",
    content:
      "Bestill klipp i juni og få 15 % rabatt. Vi gleder oss til å se deg!",
    recipientCount: 3,
  });

  const [klipp, farging, vipper] = insertedServices;
  const demoBookings = [
    {
      service: klipp,
      customerName: "Anne Hansen",
      customerEmail: "anne@eksempel.no",
      customerPhone: "911 22 333",
      daysFromNow: 2,
      hour: 11,
      status: "confirmed" as const,
    },
    {
      service: farging,
      customerName: "Per Olsen",
      customerEmail: "per@eksempel.no",
      customerPhone: "922 33 444",
      daysFromNow: 4,
      hour: 13,
      status: "confirmed" as const,
    },
    {
      service: vipper,
      customerName: "Kari Berg",
      customerEmail: "kari@eksempel.no",
      customerPhone: "933 44 555",
      daysFromNow: 6,
      hour: 10,
      status: "cancelled" as const,
    },
    {
      service: klipp,
      customerName: "Ola Nordmann",
      customerEmail: "ola@eksempel.no",
      customerPhone: "944 55 666",
      daysFromNow: -5,
      hour: 14,
      status: "confirmed" as const,
    },
  ];

  await db.insert(bookings).values(
    demoBookings.map((b) => {
      const startsAt = bookingDate(b.daysFromNow, b.hour);
      return {
        businessId: demo.id,
        serviceId: b.service.id,
        customerName: b.customerName,
        customerEmail: b.customerEmail,
        customerPhone: b.customerPhone,
        startsAt,
        endsAt: new Date(
          startsAt.getTime() + b.service.durationMinutes * 60_000,
        ),
        status: b.status,
      };
    }),
  );

  console.log(
    `Demo-bedrift opprettet på /demo — admin-innlogging: ${DEMO_EMAIL}`,
  );
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
