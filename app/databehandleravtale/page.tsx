import type { Metadata } from "next";
import { BackLink } from "@/components/back-link";

export const metadata: Metadata = {
  title: "Databehandleravtale — bestilly",
  description:
    "Databehandleravtale mellom bestilly og bedrifter som bruker tjenesten, i tråd med personvernforordningen artikkel 28.",
};

export default function DpaPage() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-6 py-12">
      <BackLink href="/vilkar" label="Tilbake til vilkår" />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Databehandleravtale</h1>
        <p className="text-sm text-gray-500">Sist oppdatert 17. mai 2026</p>
      </div>

      <p className="text-sm text-gray-700">
        Denne databehandleravtalen («Avtalen») gjelder mellom bedriften som
        bruker bestilly («Behandlingsansvarlig») og bestilly («Databehandler»),
        og inngås som en del av vilkårene for tjenesten. Avtalen oppfyller
        kravene i personvernforordningen (GDPR) artikkel 28.
      </p>

      <section className="space-y-2">
        <h2 className="font-semibold">1. Formål og behandlingens art</h2>
        <p className="text-sm text-gray-700">
          Databehandler behandler personopplysninger på vegne av
          Behandlingsansvarlig utelukkende for å levere bookingtjenesten:
          mottak og administrasjon av bookinger og bestillinger, utsending av
          bekreftelser og varsler, drift av bedriftens offentlige side, og
          valgfrie tilleggsfunksjoner som nyhetsbrev og markedsføringsverktøy.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">
          2. Kategorier av registrerte og opplysninger
        </h2>
        <p className="text-sm text-gray-700">
          <strong>Registrerte:</strong> Behandlingsansvarliges kunder og
          kontakter — de som booker time, handler i nettbutikken, melder seg
          på nyhetsbrev eller sender melding via kontaktskjema.
        </p>
        <p className="text-sm text-gray-700">
          <strong>Personopplysninger:</strong> navn, e-postadresse,
          telefonnummer, bookinger og bestillinger, samt innhold den
          registrerte selv oppgir. Tjenesten er ikke ment for særlige
          kategorier personopplysninger (sensitive opplysninger).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">3. Databehandlers plikter</h2>
        <ul className="ml-5 list-disc space-y-1 text-sm text-gray-700">
          <li>
            Behandle personopplysninger kun etter dokumenterte instrukser fra
            Behandlingsansvarlig. Bruk av tjenesten utgjør slike instrukser.
          </li>
          <li>
            Sikre at personer med tilgang til opplysningene er underlagt
            taushetsplikt.
          </li>
          <li>
            Gjennomføre egnede tekniske og organisatoriske sikkerhetstiltak
            (se punkt 4).
          </li>
          <li>
            Bistå Behandlingsansvarlig med å oppfylle plikter ved
            henvendelser fra registrerte og ved avvikshåndtering.
          </li>
          <li>
            Varsle Behandlingsansvarlig uten ugrunnet opphold ved brudd på
            personopplysningssikkerheten.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">4. Sikkerhet</h2>
        <p className="text-sm text-gray-700">
          Opplysningene lagres i database innenfor EU/EØS, overføres kryptert
          (HTTPS), og tilgang er begrenset til det som er nødvendig for å
          drifte tjenesten. Passord lagres kryptert (hashet). Hver bedrifts
          data er logisk adskilt fra andre bedrifters data.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">5. Underdatabehandlere</h2>
        <p className="text-sm text-gray-700">
          Behandlingsansvarlig samtykker til at Databehandler bruker følgende
          underdatabehandlere:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-sm text-gray-700">
          <li>Neon — databaselagring (innenfor EU)</li>
          <li>Railway — drift av applikasjonen</li>
          <li>Cloudinary — lagring av opplastede bilder</li>
          <li>Brevo — utsending av e-post</li>
          <li>
            Anthropic — AI-tekstgenerering, kun ved bruk av
            markedsføringsverktøyet
          </li>
          <li>
            Replicate — AI-bildegenerering, kun ved bruk av
            markedsføringsverktøyet
          </li>
        </ul>
        <p className="text-sm text-gray-700">
          Overføring til underdatabehandlere utenfor EU/EØS skjer på grunnlag
          av EU-kommisjonens standardvilkår (SCC). Ved bytte av
          underdatabehandler oppdateres denne listen, og Behandlingsansvarlig
          informeres ved vesentlige endringer.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">6. De registrertes rettigheter</h2>
        <p className="text-sm text-gray-700">
          Databehandler stiller funksjonalitet til rådighet slik at
          Behandlingsansvarlig kan oppfylle de registrertes rettigheter —
          blant annet sletting av abonnenter, avbestilling av bookinger,
          avmelding av nyhetsbrev, og sletting av hele kontoen med tilhørende
          data.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">7. Sletting ved opphør</h2>
        <p className="text-sm text-gray-700">
          Når Behandlingsansvarlig sletter kontoen sin, slettes alle
          tilhørende personopplysninger umiddelbart. Behandlingsansvarlig er
          selv ansvarlig for å eksportere data som skal beholdes (f.eks.
          regnskapsgrunnlag) før sletting.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">8. Varighet</h2>
        <p className="text-sm text-gray-700">
          Avtalen gjelder så lenge Behandlingsansvarlig bruker bestilly, og
          avsluttes når kontoen slettes.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">9. Lovvalg</h2>
        <p className="text-sm text-gray-700">
          Avtalen er underlagt norsk rett. Spørsmål kan rettes til bestilly
          via kontaktsiden.
        </p>
      </section>
    </main>
  );
}
