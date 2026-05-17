import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses, services, workingHours } from "@/db/schema";
import { requireBusinessId } from "@/lib/session";

const sections = [
  {
    title: "Behandlinger",
    description: "Tjenestene du tilbyr — navn, beskrivelse, varighet og pris.",
    href: "/admin/behandlinger",
  },
  {
    title: "Bookinger",
    description: "Kommende og tidligere avtaler, og åpningstidene dine.",
    href: "/admin/bookinger",
  },
  {
    title: "Regnskap",
    description: "Last ned bookinger og salg som regnskapsklar fil.",
    href: "/admin/regnskap",
  },
  {
    title: "Blogg",
    description: "Skriv innlegg og oppdateringer — bra for synlighet.",
    href: "/admin/blogg",
  },
  {
    title: "Markedsføring",
    description:
      "AI-verktøy for innlegg, SEO, blogg, bilder, nyhetsbrev og plan.",
    href: "/admin/markedsforing",
  },
  {
    title: "Min side",
    description: "Rediger den offentlige siden din, med SEO-sjekk.",
    href: "/admin/side",
  },
  {
    title: "Produktsalg",
    description: "Valgfri nettbutikk — produkter og bestillinger.",
    href: "/admin/produktsalg",
  },
];

export default async function AdminDashboard() {
  const businessId = await requireBusinessId();
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });
  const serviceList = await db.query.services.findMany({
    where: eq(services.businessId, businessId),
  });
  const wh = await db.query.workingHours.findMany({
    where: eq(workingHours.businessId, businessId),
  });

  const onboarding = [
    {
      label: "Legg til behandlinger",
      done: serviceList.length > 0,
      href: "/admin/behandlinger",
    },
    {
      label: "Sett åpningstider",
      done: wh.length > 0,
      href: "/admin/apningstider",
    },
    {
      label: "Tilpass den offentlige siden din",
      done: !!business?.description,
      href: "/admin/side",
    },
  ];
  const allDone = onboarding.every((step) => step.done);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Velkommen</h1>
        <p className="text-sm text-gray-500">
          Administrer bedriften din herfra.
        </p>
      </div>

      {allDone ? (
        <div className="rounded-xl bg-green-50 p-4 text-sm text-green-800">
          Alt er klart — den offentlige siden din er klar til bruk. Del lenken
          med kundene dine, så kan de booke selv.
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-gray-200 p-4">
          <div>
            <h2 className="font-semibold">Kom i gang</h2>
            <p className="text-sm text-gray-500">
              Tre steg, så er siden din klar til å ta imot bookinger.
            </p>
          </div>
          <ul className="space-y-2">
            {onboarding.map((step) => (
              <li key={step.label}>
                <Link
                  href={step.href}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className={
                      step.done
                        ? "font-medium text-green-600"
                        : "text-gray-300"
                    }
                  >
                    {step.done ? "✓" : "○"}
                  </span>
                  <span
                    className={
                      step.done ? "text-gray-500" : "font-medium underline"
                    }
                  >
                    {step.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Link key={section.title} href={section.href}>
            <div className="h-full rounded-xl border border-gray-200 p-4 transition-colors hover:border-gray-400">
              <h2 className="font-semibold">{section.title}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {section.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
