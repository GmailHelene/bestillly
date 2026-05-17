import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { requireBusinessId } from "@/lib/session";
import { BackLink } from "@/components/back-link";
import { ShopToggle } from "./shop-toggle";

export default async function ProduktsalgPage() {
  const businessId = await requireBusinessId();
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });
  if (!business) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <BackLink href="/admin" label="Tilbake til oversikt" />
        <h1 className="text-2xl font-bold">Produktsalg</h1>
        <p className="text-sm text-gray-500">
          Vil du selge produkter på den offentlige siden din? Slå på
          nettbutikken her. Den er av som standard — mange enkeltpersonforetak
          trenger den ikke.
        </p>
      </div>

      <ShopToggle enabled={business.shopEnabled} />

      {business.shopEnabled ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/produkter"
            className="rounded-xl border border-gray-200 p-4 transition-colors hover:border-gray-400"
          >
            <h2 className="font-semibold">Produkter</h2>
            <p className="mt-1 text-sm text-gray-500">
              Varene du selger — navn, pris, bilde og lagerstatus.
            </p>
          </Link>
          <Link
            href="/admin/bestillinger"
            className="rounded-xl border border-gray-200 p-4 transition-colors hover:border-gray-400"
          >
            <h2 className="font-semibold">Bestillinger</h2>
            <p className="mt-1 text-sm text-gray-500">
              Ordrer fra nettbutikken din.
            </p>
          </Link>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          Når du slår på nettbutikken, dukker Produkter og Bestillinger opp
          her — og kundene kan handle på siden din.
        </p>
      )}
    </div>
  );
}
