import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses, services, workingHours } from "@/db/schema";
import { requireBusinessId } from "@/lib/session";
import { BackLink } from "@/components/back-link";
import { ProfileForm } from "./profile-form";
import { SeoChecklist } from "./seo-checklist";

export default async function SidePage() {
  const businessId = await requireBusinessId();

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });
  if (!business) redirect("/login");

  const serviceList = await db.query.services.findMany({
    where: eq(services.businessId, businessId),
  });
  const wh = await db.query.workingHours.findMany({
    where: eq(workingHours.businessId, businessId),
  });

  const checks = [
    { label: "Beskrivelse fylt ut", done: !!business.description },
    { label: "Adresse fylt ut", done: !!business.address },
    { label: "Telefonnummer fylt ut", done: !!business.phone },
    { label: "Minst 3 behandlinger lagt til", done: serviceList.length >= 3 },
    { label: "Åpningstider satt opp", done: wh.length > 0 },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <BackLink href="/admin" label="Tilbake til oversikt" />
        <h1 className="text-2xl font-bold">Min side</h1>
        <p className="text-sm text-gray-500">
          Rediger den offentlige siden din, og gjør den lett å finne på nett.
        </p>
      </div>

      <ProfileForm
        profile={{
          name: business.name,
          description: business.description,
          address: business.address,
          phone: business.phone,
          template: business.template,
        }}
      />

      <SeoChecklist checks={checks} />

      <div className="space-y-2 rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold">Bli synlig på Google</h2>
        <p className="text-sm text-gray-600">
          Det viktigste enkelttiltaket for å bli funnet lokalt er en gratis
          Google-bedriftsprofil. Den gjør at bedriften din kan vises i
          Google-søk og på Google Maps når noen i nærområdet søker etter
          tjenestene dine.
        </p>
        <a
          href="https://business.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-medium text-gray-900 underline"
        >
          Opprett Google-bedriftsprofil ↗
        </a>
      </div>
    </div>
  );
}
