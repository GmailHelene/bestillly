import { redirect } from "next/navigation";
import { db } from "@/db";
import { isOperator } from "@/lib/operator";
import { parseOnepageContent } from "@/lib/onepage";
import {
  activateBusiness,
  pauseBusiness,
  registerPayment,
} from "@/lib/actions/operator";
import { BackLink } from "@/components/back-link";

const btnDark =
  "rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700";
const btnOutline =
  "rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50";

export default async function DriftPage() {
  if (!(await isOperator())) redirect("/");

  const all = await db.query.businesses.findMany({
    orderBy: (b, { asc }) => [asc(b.name)],
  });

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-6 py-12">
      <BackLink href="/admin" label="Til admin" />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Drift — kontostatus</h1>
        <p className="text-sm text-gray-500">
          Oversikt over alle bedrifter. Registrer betaling, eller sett kontoer
          på pause ved manglende betaling.
        </p>
      </div>

      <div className="space-y-3">
        {all.map((business) => {
          const orgNumber = parseOnepageContent(business.onepageContent).footer
            ?.orgNumber;
          const paused = business.status === "paused";
          return (
            <div
              key={business.id}
              className="rounded-xl border border-gray-200 p-4"
            >
              <div>
                <p className="font-medium">
                  {business.name}
                  {paused && (
                    <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                      På pause
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500">{business.email}</p>
                {orgNumber && (
                  <p className="text-sm text-gray-500">Org.nr {orgNumber}</p>
                )}
                <p className="text-sm text-gray-400">
                  Betalt til: {business.activeUntil ?? "—"} · /{business.slug}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                <form action={registerPayment}>
                  <input type="hidden" name="id" value={business.id} />
                  <button type="submit" className={btnDark}>
                    Registrer betaling (+1 år)
                  </button>
                </form>
                {paused ? (
                  <form action={activateBusiness}>
                    <input type="hidden" name="id" value={business.id} />
                    <button type="submit" className={btnOutline}>
                      Aktiver konto
                    </button>
                  </form>
                ) : (
                  <form action={pauseBusiness}>
                    <input type="hidden" name="id" value={business.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Sett på pause
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
