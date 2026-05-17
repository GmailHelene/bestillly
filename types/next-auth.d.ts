import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    businessId?: string;
  }
  interface Session {
    user: {
      businessId?: string;
    } & DefaultSession["user"];
  }
}

