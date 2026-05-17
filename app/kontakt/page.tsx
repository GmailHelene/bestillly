import type { Metadata } from "next";
import { BackLink } from "@/components/back-link";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Kontakt oss — bestilly",
  description: "Har du spørsmål om bestilly? Send oss en melding.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-lg space-y-6 px-6 py-12">
      <BackLink href="/" label="Tilbake til forsiden" />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Kontakt oss</h1>
        <p className="text-sm text-gray-500">
          Har du spørsmål om bestilly? Fyll ut skjemaet, så hører du fra oss.
        </p>
      </div>
      <ContactForm />
    </main>
  );
}
