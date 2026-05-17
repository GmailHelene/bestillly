import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Nødvendig for hosting utenfor Vercel (f.eks. Railway).
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-post", type: "email" },
        password: { label: "Passord", type: "password" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, businessId: user.businessId };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.businessId = user.businessId;
        if (user.email) token.email = user.email;
        token.checkedAt = Date.now();
        return token;
      }

      // Re-verifiser mot databasen med jevne mellomrom. Fanger opp slettede
      // kontoer (token slutter å gi tilgang) og endret e-post.
      const checkedAt =
        typeof token.checkedAt === "number" ? token.checkedAt : 0;
      if (token.businessId && Date.now() - checkedAt > 5 * 60_000) {
        const current = token.sub
          ? await db.query.users.findFirst({
              where: eq(users.id, token.sub),
            })
          : undefined;
        if (!current) {
          token.businessId = undefined; // ugyldiggjør admin-tilgang
        } else {
          token.businessId = current.businessId;
          token.email = current.email;
        }
        token.checkedAt = Date.now();
      }
      return token;
    },
    session({ session, token }) {
      session.user.businessId = token.businessId as string | undefined;
      if (token.email) session.user.email = token.email;
      return session;
    },
  },
});
