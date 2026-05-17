import type { Metadata } from "next";
import Link from "next/link";
import { BackLink } from "@/components/back-link";

export const metadata: Metadata = {
  title: "Vilkår — bestilly",
  description: "Vilkår for bruk av bestilly, inkludert pris og betaling.",
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
          Bedriften må oppgi korrekt bedriftsnavn og organisasjonsnummer ved
          registrering, og er ansvarlig for å holde innloggingsinformasjonen
          trygg og for innholdet som legges inn. Tjenesten skal ikke brukes til
          ulovlig virksomhet.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">3. Pris og betaling</h2>
        <p className="text-sm text-gray-700">
          bestilly koster <strong>2490 kr per år</strong> per bedrift. Det er
          ingen oppstartsavgift og ingen gebyr per booking.
        </p>
        <p className="text-sm text-gray-700">
          Beløpet faktureres årlig. Faktura sendes på e-post til adressen
          bedriften har registrert, og betales til oppgitt kontonummer med
          KID innen <strong>14 dagers betalingsfrist</strong>. Abonnementet
          fornyes automatisk for ett år av gangen inntil det sies opp.
        </p>
        <p className="text-sm text-gray-700">
          Årsprisen inkluderer en månedlig pott med AI-kreditter til
          markedsføringshuben — for tekstinnhold og bildegenerering.
          Kredittpotten fornyes ved hvert månedsskifte og kan ikke spares
          opp. Behov ut over potten kan dekkes ved avtale. AI-genererte
          tekster og bilder er utkast bedriften selv er ansvarlig for å
          gjennomgå før publisering.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">4. Manglende betaling</h2>
        <p className="text-sm text-gray-700">
          Betales ikke fakturaen innen fristen, gjelder følgende:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-sm text-gray-700">
          <li>
            Det sendes en purring, og forsinkelsesrente og purregebyr etter
            norsk lov kan påløpe.
          </li>
          <li>
            Er fakturaen fortsatt ubetalt <strong>14 dager etter forfall</strong>,
            kan tjenesten settes på pause: den offentlige siden og
            bookingfunksjonen deaktiveres midlertidig. Bedriften varsles på
            e-post før dette skjer.
          </li>
          <li>
            Tjenesten gjenåpnes så snart utestående faktura er betalt.
          </li>
          <li>
            Forblir fakturaen ubetalt <strong>30 dager etter at tjenesten ble
            satt på pause</strong>, kan kontoen og tilhørende data slettes
            permanent.
          </li>
        </ul>
        <p className="text-sm text-gray-700">
          Bedriften er selv ansvarlig for å informere sine kunder dersom
          tjenesten settes på pause.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">5. Bedriftens ansvar</h2>
        <p className="text-sm text-gray-700">
          Bedriften er behandlingsansvarlig for personopplysningene den
          registrerer om sine egne kunder, og er ansvarlig for å informere
          kundene sine og ha gyldig grunnlag for behandlingen. Bedriften er
          også ansvarlig for at åpningstider, priser og annen informasjon er
          korrekt.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">6. Databehandling</h2>
        <p className="text-sm text-gray-700">
          bestilly opptrer som databehandler for opplysningene bedriften
          registrerer om sine kunder, og behandler dem kun for å levere
          tjenesten, slik det er beskrevet i{" "}
          <Link href="/personvern" className="underline">
            personvernerklæringen
          </Link>
          . Ved å akseptere disse vilkårene inngås også{" "}
          <Link href="/databehandleravtale" className="underline">
            databehandleravtalen
          </Link>{" "}
          mellom bedriften og bestilly, i tråd med personvernforordningen
          artikkel 28.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">7. bestillys ansvar</h2>
        <p className="text-sm text-gray-700">
          Vi tilstreber stabil drift, men kan ikke garantere at tjenesten til
          enhver tid er feilfri eller tilgjengelig. bestilly er ikke ansvarlig
          for indirekte tap som følge av feil, nedetid eller pause ved
          manglende betaling.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">8. Oppsigelse</h2>
        <p className="text-sm text-gray-700">
          Bedriften kan når som helst si opp kontoen. Tjenesten løper ut
          inneværende betalte periode, og det gis ikke refusjon for gjenstående
          tid. bestilly kan avslutte en konto ved vesentlig brudd på vilkårene.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">9. Endringer og lovvalg</h2>
        <p className="text-sm text-gray-700">
          Vi kan oppdatere vilkårene, og varsler bedriftskundene ved
          vesentlige endringer. Vilkårene reguleres av norsk rett.
        </p>
      </section>
    </main>
  );
}
