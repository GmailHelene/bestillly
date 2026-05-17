import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { logoutAction } from "@/lib/actions/auth";
import { DEMO_SLUG } from "@/lib/demo";
import { Logo } from "@/components/logo";

const NAV_LINKS = [
  { href: "/admin", label: "Oversikt" },
  { href: "/admin/behandlinger", label: "Behandlinger" },
  { href: "/admin/apningstider", label: "Åpningstider" },
  { href: "/admin/bookinger", label: "Bookinger" },
  { href: "/admin/produkter", label: "Produkter" },
  { href: "/admin/bestillinger", label: "Bestillinger" },
  { href: "/admin/blogg", label: "Blogg" },
  { href: "/admin/nyhetsbrev", label: "Nyhetsbrev" },
  { href: "/admin/side", label: "Min side" },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.businessId) {
    redirect("/login");
  }

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, session.user.businessId),
  });

  return (
    <div className="flex min-h-full flex-col">
      {business?.slug === DEMO_SLUG && (
        <div className="bg-amber-100 px-6 py-2 text-center text-sm text-amber-900">
          Du utforsker bestilly i demomodus — endringer lagres ikke.{" "}
          <Link href="/registrer" className="font-semibold underline">
            Opprett din egen konto
          </Link>
        </div>
      )}
      {business?.status === "paused" && (
        <div className="bg-red-100 px-6 py-2 text-center text-sm text-red-900">
          Kontoen din er satt på pause grunnet manglende betaling. Den
          offentlige siden er utilgjengelig til fakturaen er betalt.
        </div>
      )}

      <header className="border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-3">
          <Link href="/admin">
            <Logo />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {business && (
              <a
                href={`/${business.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden text-gray-600 hover:text-gray-900 sm:inline"
              >
                Vis din side ↗
              </a>
            )}
            <span className="hidden text-gray-500 sm:inline">
              {business?.name ?? "Min bedrift"}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium hover:bg-gray-50"
              >
                Logg ut
              </button>
            </form>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
