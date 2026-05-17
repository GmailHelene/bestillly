import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireBusinessId } from "@/lib/session";
import { BackLink } from "@/components/back-link";
import { AddProductForm } from "./add-product-form";
import { ProductRow } from "./product-row";

export default async function ProductsPage() {
  const businessId = await requireBusinessId();
  const list = await db.query.products.findMany({
    where: eq(products.businessId, businessId),
    orderBy: (p, { asc }) => [asc(p.createdAt)],
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <BackLink href="/admin" label="Tilbake til oversikt" />
        <h1 className="text-2xl font-bold">Produkter</h1>
        <p className="text-sm text-gray-500">
          Varer du selger. Selve nettbutikken på siden din kommer i et senere
          steg — her legger du inn produktene allerede nå.
        </p>
      </div>

      <AddProductForm />

      <div className="space-y-3">
        <h2 className="font-semibold">
          Dine produkter <span className="text-gray-400">({list.length})</span>
        </h2>
        {list.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            Ingen produkter ennå. Legg til det første over.
          </p>
        ) : (
          list.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  );
}
