import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { requireBusinessId } from "@/lib/session";
import { BackLink } from "@/components/back-link";
import { formatDateShort } from "@/lib/format";
import { DeleteSubscriberButton } from "./delete-button";

export default async function SubscribersPage() {
  const businessId = await requireBusinessId();
  const list = await db.query.subscribers.findMany({
    where: eq(subscribers.businessId, businessId),
    orderBy: (s, { desc }) => [desc(s.createdAt)],
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-3">
        <BackLink href="/admin/nyhetsbrev" label="Tilbake til nyhetsbrev" />
        <h1 className="text-2xl font-bold">Abonnenter</h1>
        <p className="text-sm text-gray-500">
          {list.length} abonnent(er). Nye kommer inn automatisk når noen
          melder seg på nyhetsbrevet på siden din.
        </p>
      </div>

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          Ingen abonnenter ennå.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
          {list.map((subscriber) => (
            <li
              key={subscriber.id}
              className="flex items-center justify-between gap-4 p-3 text-sm"
            >
              <div>
                <p className="font-medium">{subscriber.email}</p>
                <p className="text-gray-400">
                  Påmeldt {formatDateShort(subscriber.createdAt)}
                </p>
              </div>
              <DeleteSubscriberButton
                id={subscriber.id}
                email={subscriber.email}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
