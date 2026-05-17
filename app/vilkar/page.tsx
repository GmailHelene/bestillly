import type { Metadata } from "next";
import Link from "next/link";
import { BackLink } from "@/components/back-link";

export const metadata: Metadata = {
  title: "Vilkår — bestilly",
  description: "Vilkår for bruk av bestilly.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-6 py-12">
      <BackLink href="/" label="Tilbake til forsiden" />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Vilkår for bruk</h1>
        <p className="text-sm text-gray-500">Sist oppdatert 17. mai 2026</p>
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold">1. Om tjenesten</h2>
        <p className="text-sm text-gray-700">
          bestilly er et bookingsystem med tilhørende nettside for små
          bedrifter. Disse vilkårene gjelder mellom bestilly og bedriften som
          oppretter en konto.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">2. Konto og bruk</h2>
        <p className="text-sm text-gray-700">
          Bedriften er ansvarlig for å holde innloggingsinformasjonen sin
          trygg, og for innholdet som legges inn. Tjenesten skal ikke brukes
          til ulovlig virksomhet.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">3. Pris og betaling</h2>
        <p className="text-sm text-gray-700">
          bestilly koster 990 kr per år per bedrift. Beløpet faktureres
          årlig. Det er ingen oppstartsavgift og ingen gebyr per booking.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">4. Bedriftens ansvar</h2>
        <p className="text-sm text-gray-700">
          Bedriften er behandlingsansvarlig for personopplysningene den
          registrerer om sine egne kunder, og er ansvarlig for å informere
          kundene sine og ha gyldig grunnlag for behandlingen. Bedriften er
          også ansvarlig for at åpningstider, priser og annen informasjon er
          korrekt.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">5. Databehandling</h2>
        <p className="text-sm text-gray-700">
          bestilly opptrer som databehandler for opplysningene bedriften
          registrerer om sine kunder, og behandler dem kun for å levere
          tjenesten, slik det er beskrevet i{" "}
          <Link href="/personvern" className="underline">
            personvernerklæringen
          </Link>
          . Ved å akseptere disse vilkårene inngås også avtale om slik
          databehandling, inkludert bruk av de oppførte underleverandørene.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">6. bestillys ansvar</h2>
        <p className="text-sm text-gray-700">
          Vi tilstreber stabil drift, men kan ikke garantere at tjenesten til
          enhver tid er feilfri eller tilgjengelig. bestilly er ikke ansvarlig
          for indirekte tap som følge av feil eller nedetid.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">7. Oppsigelse</h2>
        <p className="text-sm text-gray-700">
          Bedriften kan når som helst si opp kontoen. Tjenesten løper ut
          inneværende betalte periode. bestilly kan avslutte en konto ved
          vesentlig brudd på vilkårene.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">8. Endringer og lovvalg</h2>
        <p className="text-sm text-gray-700">
          Vi kan oppdatere vilkårene, og varsler bedriftskundene ved
          vesentlige endringer. Vilkårene reguleres av norsk rett.
        </p>
      </section>
    </main>
  );
}
