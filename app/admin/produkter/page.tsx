import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses, products } from "@/db/schema";
import { requireBusinessId } from "@/lib/session";
import { BackLink } from "@/components/back-link";
import { AddProductForm } from "./add-product-form";
import { ProductRow } from "./product-row";
import { ShopSettingsForm } from "./shop-settings-form";

export default async function ProductsPage() {
  const businessId = await requireBusinessId();
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });
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
          Varene du selger i nettbutikken på siden din.
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

      <ShopSettingsForm
        settings={{
          vippsNumber: business?.vippsNumber ?? "",
          shippingFree: business?.shippingFree ?? true,
          shippingFee: business?.shippingFee ?? 99,
          shippingLabel: business?.shippingLabel ?? "",
        }}
      />
    </div>
  );
}
