import { eq } from "drizzle-orm";
import { db } from "@/db";
import { newsletters, subscribers } from "@/db/schema";
import { requireBusinessId } from "@/lib/session";
import { BackLink } from "@/components/back-link";
import { formatDateShort } from "@/lib/format";
import { ComposeForm } from "./compose-form";

export default async function NewsletterPage() {
  const businessId = await requireBusinessId();
  const subList = await db.query.subscribers.findMany({
    where: eq(subscribers.businessId, businessId),
  });
  const history = await db.query.newsletters.findMany({
    where: eq(newsletters.businessId, businessId),
    orderBy: (n, { desc }) => [desc(n.sentAt)],
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <BackLink href="/admin" label="Tilbake til oversikt" />
        <h1 className="text-2xl font-bold">Nyhetsbrev</h1>
        <p className="text-sm text-gray-500">
          Skriv nyhetsbrevet her — Bestilly sender det rett ut til
          abonnentene dine på e-post når du trykker «Send». Du trenger ingen
          ekstra Mailchimp- eller Brevo-konto.
        </p>
        <p className="text-sm text-gray-500">
          Du har <strong>{subList.length}</strong> abonnent(er). Slå på «Vis
          nyhetsbrev på siden» under Min side for å samle flere.
        </p>
      </div>

      <p>
        <a
          href="/admin/abonnenter"
          className="text-sm font-medium text-gray-900 underline"
        >
          Se og administrer abonnenter →
        </a>
      </p>

      <ComposeForm subscriberCount={subList.length} />

      {history.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Sendt tidligere</h2>
          {history.map((newsletter) => (
            <div
              key={newsletter.id}
              className="rounded-xl border border-gray-200 p-4"
            >
              <p className="font-medium">{newsletter.subject}</p>
              <p className="text-sm text-gray-500">
                {formatDateShort(newsletter.sentAt)} ·{" "}
                {newsletter.recipientCount} mottakere
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
