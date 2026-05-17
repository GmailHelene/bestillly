import { eq } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";
import { requireBusinessId } from "@/lib/session";
import { BackLink } from "@/components/back-link";
import { AddServiceForm } from "./add-service-form";
import { ServiceRow } from "./service-row";

export default async function ServicesPage() {
  const businessId = await requireBusinessId();
  const list = await db.query.services.findMany({
    where: eq(services.businessId, businessId),
    orderBy: (s, { asc }) => [asc(s.createdAt)],
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <BackLink href="/admin" label="Tilbake til oversikt" />
        <h1 className="text-2xl font-bold">Behandlinger</h1>
        <p className="text-sm text-gray-500">
          Tjenestene du tilbyr — navn, varighet og pris. Disse blir valgbare
          når kunder booker time.
        </p>
      </div>

      <AddServiceForm />

      <div className="space-y-3">
        <h2 className="font-semibold">
          Dine behandlinger{" "}
          <span className="text-gray-400">({list.length})</span>
        </h2>
        {list.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            Ingen behandlinger ennå. Legg til den første over.
          </p>
        ) : (
          list.map((service) => (
            <ServiceRow key={service.id} service={service} />
          ))
        )}
      </div>
    </div>
  );
}
