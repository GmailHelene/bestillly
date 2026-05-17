import { eq } from "drizzle-orm";
import { db } from "@/db";
import { availabilityExceptions, workingHours } from "@/db/schema";
import { requireBusinessId } from "@/lib/session";
import { BackLink } from "@/components/back-link";
import { WorkingHoursForm } from "./working-hours-form";
import { ExceptionsSection } from "./exceptions-section";

export default async function OpeningHoursPage() {
  const businessId = await requireBusinessId();

  const hours = await db.query.workingHours.findMany({
    where: eq(workingHours.businessId, businessId),
  });
  const exceptions = await db.query.availabilityExceptions.findMany({
    where: eq(availabilityExceptions.businessId, businessId),
    orderBy: (e, { asc }) => [asc(e.date)],
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <BackLink href="/admin" label="Tilbake til oversikt" />
        <h1 className="text-2xl font-bold">Åpningstider</h1>
        <p className="text-sm text-gray-500">
          Den faste ukerytmen og eventuelle avvik styrer hvilke tider kunder
          kan booke.
        </p>
      </div>

      <WorkingHoursForm
        hours={hours.map((h) => ({
          weekday: h.weekday,
          startTime: h.startTime,
          endTime: h.endTime,
        }))}
      />

      <ExceptionsSection
        exceptions={exceptions.map((e) => ({
          id: e.id,
          date: e.date,
          type: e.type,
          startTime: e.startTime,
          endTime: e.endTime,
        }))}
      />
    </div>
  );
}
