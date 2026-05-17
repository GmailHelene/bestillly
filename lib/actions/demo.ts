"use server";

import { signIn } from "@/auth";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo";

// Logger besøkende automatisk inn i demo-bedriftens adminpanel.
export async function enterDemo() {
  await signIn("credentials", {
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    redirectTo: "/admin",
  });
}
