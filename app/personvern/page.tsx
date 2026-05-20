import type { Metadata } from "next";
import { BackLink } from "@/components/back-link";

export const metadata: Metadata = {
  title: "Personvernerklæring — Bestilly",
  description: "Hvordan Bestilly behandler personopplysninger.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-6 py-12">
      <BackLink href="/" label="Tilbake til forsiden" />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Personvernerklæring</h1>
        <p className="text-sm text-gray-500">Sist oppdatert 17. mai 2026</p>
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold">1. Behandlingsansvarlig</h2>
        <p className="text-sm text-gray-700">
          Bestilly leverer et bookingsystem for små bedrifter. For
          personopplysninger om bedriftene som er kunder hos oss, er Bestilly
          behandlingsansvarlig. Spørsmål kan rettes til oss via kontaktsiden.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">2. Hvilke opplysninger vi behandler</h2>
        <p className="text-sm text-gray-700">
          <strong>Om bedriftskunder:</strong> navn på bedrift og kontaktperson,
          e-postadresse, telefonnummer og adresse.
        </p>
        <p className="text-sm text-gray-700">
          <strong>Om sluttkunder (de som booker time, handler eller tar
          kontakt):</strong> navn, e-postadresse og telefonnummer oppgitt ved
          booking eller bestilling i nettbutikken, e-postadresse til
          nyhetsbrev-abonnenter, og innhold i meldinger sendt via
          kontaktskjema. Disse opplysningene behandler vi på vegne av bedriften
          — se punkt 4.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">3. Formål og rettslig grunnlag</h2>
        <p className="text-sm text-gray-700">
          Opplysningene brukes til å levere booking-tjenesten: opprette og
          administrere bookinger, sende bekreftelser og varsler, og drifte
          bedriftens side. Rettslig grunnlag er å oppfylle avtalen med
          bedriften, samt vår berettigede interesse i å levere tjenesten.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">4. Bestilly som databehandler</h2>
        <p className="text-sm text-gray-700">
          Når en bedrift bruker Bestilly til å håndtere sine egne kunder, er
          bedriften behandlingsansvarlig for disse opplysningene, og Bestilly
          er databehandler. Vi behandler opplysningene kun etter bedriftens
          instruks og for å levere tjenesten. Vilkårene for denne
          databehandlingen inngår i vilkårene for tjenesten.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">5. Underleverandører</h2>
        <p className="text-sm text-gray-700">
          For å levere tjenesten bruker vi følgende underleverandører:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-sm text-gray-700">
          <li>Neon — database (lagring innenfor EU)</li>
          <li>Railway — drift av applikasjonen</li>
          <li>Cloudinary — lagring av bilder lastet opp av bedriften</li>
          <li>Brevo — utsending av e-postvarsler</li>
          <li>
            Anthropic — AI-tekstgenerering i markedsføringsverktøyet (se
            punkt 6)
          </li>
          <li>
            Replicate — AI-bildegenerering i markedsføringsverktøyet (se
            punkt 6)
          </li>
        </ul>
        <p className="text-sm text-gray-700">
          Enkelte underleverandører behandler data utenfor EU/EØS. Slik
          overføring skjer på grunnlag av EU-kommisjonens standardvilkår (SCC).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">6. Markedsføringsverktøyet (AI)</h2>
        <p className="text-sm text-gray-700">
          Bestilly har et valgfritt markedsføringsverktøy som bruker
          AI-tjenester. Når bedriften bruker dette, sendes opplysninger
          bedriften selv legger inn — bedriftsinfo, behandlinger, produkter og
          tekst fra bedriftens egen nettside — til Anthropic for
          tekstgenerering, og bildebeskrivelser til Replicate for
          bildegenerering. Det sendes ikke sluttkunders personopplysninger til
          disse tjenestene. Verktøyet er valgfritt å bruke.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">7. Lagringstid</h2>
        <p className="text-sm text-gray-700">
          Opplysninger lagres så lenge bedriften har en aktiv konto hos
          Bestilly. Booking- og ordredata oppbevares i inntil 3 år for å
          dokumentere avtalene. Nyhetsbrev-abonnenter lagres til de melder seg
          av. Når en bedrift sletter kontoen sin, slettes alle tilhørende
          opplysninger umiddelbart.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">8. Dine rettigheter</h2>
        <p className="text-sm text-gray-700">
          Du har rett til innsyn i, retting og sletting av opplysninger om deg,
          og til å klage til Datatilsynet. Gjelder henvendelsen opplysninger en
          bedrift har registrert om deg som kunde, tar du kontakt med
          bedriften. Ellers kan du kontakte oss via kontaktsiden.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">9. Informasjonskapsler</h2>
        <p className="text-sm text-gray-700">
          Bestilly bruker kun nødvendige informasjonskapsler — en
          innloggingskapsel som holder bedriften innlogget i adminpanelet. Vi
          bruker ikke informasjonskapsler til sporing eller markedsføring.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">10. Endringer</h2>
        <p className="text-sm text-gray-700">
          Vi kan oppdatere denne erklæringen. Ved vesentlige endringer
          informerer vi bedriftskundene våre.
        </p>
      </section>
    </main>
  );
}
