import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">Registrer bedrift</h1>
          <p className="text-sm text-gray-500">
            Opprett en konto for bedriften din.
          </p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-gray-500">
          Har du allerede konto?{" "}
          <Link href="/login" className="font-medium text-gray-900 underline">
            Logg inn
          </Link>
        </p>
      </div>
    </main>
  );
}
