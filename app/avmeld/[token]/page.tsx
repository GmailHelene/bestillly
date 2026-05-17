import type { ReactNode } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { unsubscribe } from "@/lib/actions/newsletter";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-md space-y-4 px-6 py-16 text-center">
      {children}
    </main>
  );
}

export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!UUID_PATTERN.test(token)) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold">Ugyldig lenke</h1>
        <p className="text-gray-600">Avmeldingslenken er ugyldig.</p>
      </Shell>
    );
  }

  const subscriber = await db.query.subscribers.findFirst({
    where: eq(subscribers.unsubscribeToken, token),
  });

  if (!subscriber) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold">Du er meldt av</h1>
        <p className="text-gray-600">
          Du mottar ikke flere nyhetsbrev.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold">Meld deg av nyhetsbrevet</h1>
      <p className="text-gray-600">
        Vil du melde {subscriber.email} av nyhetsbrevet?
      </p>
      <form action={unsubscribe}>
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Meld meg av
        </button>
      </form>
    </Shell>
  );
}
