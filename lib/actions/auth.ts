"use server";

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { businesses, users } from "@/db/schema";
import { RESERVED_SLUGS, slugify } from "@/lib/slug";
import { rateLimit, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

export type AuthState = { error: string } | undefined;

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!(await rateLimit("register", 5, 60_000))) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const orgNumber = String(formData.get("orgNumber") ?? "").trim();

  if (!name || !email || !password || !orgNumber) {
    return { error: "Fyll ut alle feltene." };
  }
  if (!email.includes("@")) {
    return { error: "Ugyldig e-postadresse." };
  }
  if (password.length < 8) {
    return { error: "Passordet må være minst 8 tegn." };
  }
  if (!/^\d{9}$/.test(orgNumber.replace(/\s/g, ""))) {
    return { error: "Organisasjonsnummer må være 9 siffer." };
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) {
    return { error: "Det finnes allerede en konto med denne e-postadressen." };
  }

  // Finn en ledig slug — legg på tallsuffiks hvis navnet er opptatt eller reservert.
  const base = slugify(name);
  let slug = base;
  let suffix = 1;
  while (
    RESERVED_SLUGS.has(slug) ||
    (await db.query.businesses.findFirst({ where: eq(businesses.slug, slug) }))
  ) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  const [business] = await db
    .insert(businesses)
    .values({
      slug,
      name,
      email,
      onepageContent: { footer: { orgNumber } },
    })
    .returning();

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({ businessId: business.id, email, passwordHash });

  await signIn("credentials", { email, password, redirectTo: "/admin" });
  return undefined;
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!(await rateLimit("login", 8, 60_000))) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Fyll ut e-post og passord." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/admin" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Feil e-post eller passord." };
    }
    throw error;
  }
  return undefined;
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
