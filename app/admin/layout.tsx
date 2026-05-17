import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { logoutAction } from "@/lib/actions/auth";

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
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-semibold">
            bestilly
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link
              href="/admin"
              className="text-gray-600 hover:text-gray-900"
            >
              Oversikt
            </Link>
            <Link
              href="/admin/behandlinger"
              className="text-gray-600 hover:text-gray-900"
            >
              Behandlinger
            </Link>
            <Link
              href="/admin/apningstider"
              className="text-gray-600 hover:text-gray-900"
            >
              Åpningstider
            </Link>
            <Link
              href="/admin/bookinger"
              className="text-gray-600 hover:text-gray-900"
            >
              Bookinger
            </Link>
            <Link
              href="/admin/side"
              className="text-gray-600 hover:text-gray-900"
            >
              Min side
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {business && (
            <a
              href={`/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              Vis din side ↗
            </a>
          )}
          <span className="text-gray-500">
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
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
