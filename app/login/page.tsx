import Link from "next/link";
import { BackLink } from "@/components/back-link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <BackLink href="/" label="Tilbake til forsiden" />
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">Logg inn</h1>
          <p className="text-sm text-gray-500">Logg inn på bedriftens admin.</p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-gray-500">
          Har du ikke konto?{" "}
          <Link
            href="/registrer"
            className="font-medium text-gray-900 underline"
          >
            Registrer bedrift
          </Link>
        </p>
      </div>
    </main>
  );
}
