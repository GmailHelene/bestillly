import Link from "next/link";
import { THEMES } from "@/lib/themes";
import { ProductPreview } from "@/components/product-preview";
import { Logo } from "@/components/logo";
import { enterDemo } from "@/lib/actions/demo";
import { safeJsonLd } from "@/lib/html";
import { ANNUAL_PRICE_NOK } from "@/lib/pricing";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Bestilly",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Bookingsystem laget for enkeltpersonforetak — booking, kalender, regnskapseksport og markedsføringsverktøy. Én fast årspris.",
  offers: {
    "@type": "Offer",
    price: String(ANNUAL_PRICE_NOK),
    priceCurrency: "NOK",
  },
};

const steps = [
  {
    number: "1",
    title: "Registrer bedriften",
    description: "Opprett en konto på et par minutter — gratis å prøve.",
  },
  {
    number: "2",
    title: "Sett opp tilbudet ditt",
    description: "Legg inn behandlinger, priser, bilder og åpningstider.",
  },
  {
    number: "3",
    title: "Del lenken din",
    description: "Kundene booker selv, døgnet rundt. Du får alt på e-post.",
  },
];

const features = [
  {
    title: "Kunder booker selv",
    description:
      "Kundene bestiller time når det passer dem — uten at telefonen ringer.",
  },
  {
    title: "Regnskapsklar eksport",
    description:
      "Last ned bookinger og salg som fil regnskapsføreren kan bruke — eller importere i regnskapsprogrammet ditt.",
  },
  {
    title: "Full oversikt",
    description:
      "Alle bookinger i en ryddig kalender. Sett åpningstider og ferie selv.",
  },
  {
    title: "Automatiske e-poster",
    description:
      "Bekreftelse og varsel til både deg og kunden. Avbestilling med ett klikk.",
  },
  {
    title: "Din egen nettside",
    description:
      "En pen side for bedriften, med valgbare design, logo og bildegalleri.",
  },
  {
    title: "Klar for Google",
    description:
      "Siden er bygget for søk, så nye kunder lettere finner bedriften din.",
  },
];

const included = [
  "Bookingsystem og kalender",
  "Regnskapsklar eksport av bookinger og salg",
  "Egen nettside med designvalg",
  "Ubegrenset antall bookinger",
  "E-postvarsling til deg og kundene",
  "Nettbutikk, blogg og nyhetsbrev (sendes rett fra Bestilly)",
  "AI-markedsføringshub med kredittpott inkludert",
  "Ingen oppstartsavgift eller gebyr per booking",
];

const marketingTools = [
  {
    title: "SEO-analyse",
    description:
      "Søkeord og konkrete forslag som hjelper deg å bli funnet på Google.",
  },
  {
    title: "Innlegg til sosiale medier",
    description:
      "Ferdige innlegg tilpasset Facebook, Instagram, TikTok, Snapchat og YouTube — skreddersydd for hver kanal.",
  },
  {
    title: "Blogg og SEO-tekster",
    description:
      "SEO-optimaliserte blogginnlegg rett i bloggen din, og korte tekster til nettsiden.",
  },
  {
    title: "AI-bilder",
    description:
      "Bildeforslag som passer innlegget, i riktig format for hver kanal.",
  },
  {
    title: "Markedsanalyse",
    description:
      "Hvilke kanaler du bør satse på, hvor ofte du bør poste, og hva budsjettet bør gå til.",
  },
  {
    title: "Publiseringsplan",
    description:
      "En ferdig plan for hva du bør poste, og når — på tvers av kanalene.",
  },
];

const faq = [
  {
    q: "Hva koster Bestilly?",
    a: "Bestilly koster 2490 kroner i året — alt er inkludert. Ingen oppstartsavgift, ingen månedspris og ingen gebyr per booking. Årsprisen dekker bookingsystem, kalender, nettside, regnskapsklar eksport og AI-markedsføringshub.",
  },
  {
    q: "Passer Bestilly for enkeltpersonforetak?",
    a: "Ja — Bestilly er laget nettopp for enkeltpersonforetak og deg som driver alene. Frisører, neglteknikere, massører, terapeuter og andre som tar imot timeavtaler. Én person, én kalender, full kontroll. Du trenger ingen ansatte eller egen IT-kunnskap.",
  },
  {
    q: "Hjelper Bestilly med regnskapet?",
    a: "Ja. Du kan når som helst laste ned en oversikt over bookinger og salg for en valgt periode, som en fil regnskapsføreren din kan ta imot — eller som du importerer i regnskapsprogrammet ditt. Time inn, kvittering ut, ferdig regnskapsgrunnlag.",
  },
  {
    q: "Kan kundene bestille time selv?",
    a: "Ja. Kundene ser ledige tider og booker selv, døgnet rundt — uten at telefonen ringer. Du og kunden får automatisk bekreftelse på e-post, og kunden kan avbestille med ett klikk.",
  },
  {
    q: "Trenger jeg en egen nettside i tillegg?",
    a: "Nei. En enkel, pen nettside for bedriften følger med. Du velger design, legger inn behandlinger, priser, bilder og åpningstider, og deler din egen lenke med kundene.",
  },
  {
    q: "Hvordan kommer jeg i gang?",
    a: "Du registrerer bedriften på et par minutter, legger inn behandlingene og åpningstidene dine, og deler lenken din. Da kan kundene booke time med en gang. Du kan prøve gratis før du bestemmer deg.",
  },
  {
    q: "Hva er AI-markedsføringshuben?",
    a: "I tillegg til bookingsystemet får du en markedsføringshub. Den lager innlegg til sosiale medier, SEO-tekster, blogginnlegg, markedsanalyser og bildeforslag — tilpasset bedriften din. Hver konto har en kredittpott inkludert i årsprisen, som fornyes hver måned.",
  },
  {
    q: "Er det bindingstid?",
    a: "Du betaler én fast årspris på 2490 kroner. Det er ingen lang bindingstid og ingen skjulte kostnader — du vet nøyaktig hva systemet koster hele året.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
      />
      <header className="flex items-center justify-between px-6 py-4">
        <Logo />
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Logg inn
          </Link>
          <Link
            href="/registrer"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Kom i gang
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#fdf3ee]">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#f6d9c9] opacity-60 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#e7ddf7] opacity-60 blur-3xl"
          />
          <div className="relative mx-auto max-w-5xl px-6 py-20">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="text-center lg:text-left">
                <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                  Bookingsystem for enkeltpersonforetak
                </p>
                <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                  Bookingsystem laget for enkeltpersonforetak
                </h1>
                <p className="mt-5 text-balance text-lg text-gray-600">
                  Time inn, kvittering ut, ferdig regnskapsgrunnlag. Bestilly
                  samler booking, kalender, regnskapseksport og markedsføring
                  — laget for deg som driver alene. Én fast årspris, ingen
                  månedlige overraskelser.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                  <Link
                    href="/registrer"
                    className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700"
                  >
                    Kom i gang
                  </Link>
                  <Link
                    href="/demo"
                    className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium hover:bg-gray-50"
                  >
                    Se en demo
                  </Link>
                </div>
              </div>
              <div className="space-y-2">
                <ProductPreview />
                <p className="text-center text-xs text-gray-500">
                  Slik ser kundesiden din ut
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Booking og regnskap */}
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight">
            Booking og regnskapsgrunnlag på ett sted
          </h2>
          <div className="mt-4 space-y-4 text-gray-600">
            <p>
              Driver du alene, går tiden til kundene — ikke til papirarbeid.
              Bestilly lar kundene se kalenderen din og bestille time selv, så
              du slipper å svare på telefon og meldinger om ledige tider hele
              dagen.
            </p>
            <p>
              Og når året er omme, er halve regnskapsjobben gjort: hver
              booking og hvert salg samles, og du laster ned en oversikt
              regnskapsføreren din kan ta imot — eller importerer den rett i
              regnskapsprogrammet ditt. Time inn, kvittering ut, ferdig
              grunnlag.
            </p>
          </div>
        </section>

        {/* Markedsføring */}
        <section className="bg-[#f5f3ff]">
          <div className="mx-auto max-w-4xl px-6 py-20">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Markedsføring uten å være markedsfører
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-gray-600">
                Driver du alene, er markedsføring ofte det første som ryker.
                Bestilly har en AI-markedsføringshub innebygd — så du slipper å
                stirre på et blankt felt.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {marketingTools.map((tool) => (
                <div
                  key={tool.title}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >
                  <h3 className="font-semibold">{tool.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {tool.description}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-gray-500">
              Inkludert i årsprisen, med en månedlig kredittpott.
            </p>
          </div>
        </section>

        {/* Slik kommer du i gang */}
        <section className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Slik kommer du i gang
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-lg font-bold text-white">
                  {step.number}
                </div>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Prøv selv */}
        <section className="bg-[#fdf3ee]">
          <div className="mx-auto max-w-4xl px-6 py-20">
            <h2 className="text-center text-3xl font-bold tracking-tight">
              Prøv Bestilly selv
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-gray-600">
              Klikk deg gjennom et ekte eksempel — både slik kundene ser det,
              og slik du styrer bedriften.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="font-semibold">Kundesiden</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Se hvordan kundene dine finner fram og booker time.
                </p>
                <Link
                  href="/demo"
                  className="mt-4 inline-block rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                >
                  Åpne kundedemo →
                </Link>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="font-semibold">Adminpanelet</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Se hvordan du styrer behandlinger, åpningstider og
                  bookinger.
                </p>
                <form action={enterDemo}>
                  <button
                    type="submit"
                    className="mt-4 inline-block rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                  >
                    Åpne admin-demo →
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Funksjoner */}
        <section className="bg-[#f5f3ff]">
          <div className="mx-auto max-w-4xl px-6 py-20">
            <h2 className="text-center text-3xl font-bold tracking-tight">
              Alt du trenger — ingenting du ikke trenger
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Designvalg */}
        <section className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Velg et design som passer bedriften din
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-gray-600">
            Åtte ferdige design — bytt når du vil, med ett klikk.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {Object.values(THEMES).map((theme) => (
              <div
                key={theme.id}
                className="overflow-hidden rounded-2xl border border-gray-200"
              >
                <div
                  className="flex h-32 items-center justify-center px-4"
                  style={{
                    background:
                      theme.heroStyle === "gradient"
                        ? theme.heroGradient
                        : theme.heroStyle === "band"
                          ? theme.accentSoft
                          : theme.pageBg,
                  }}
                >
                  <p
                    className="text-xl font-bold"
                    style={{
                      fontFamily: theme.headingFont,
                      color:
                        theme.heroStyle === "gradient"
                          ? "#ffffff"
                          : theme.accent,
                    }}
                  >
                    Din bedrift
                  </p>
                </div>
                <div className="bg-white p-3 text-center">
                  <p className="text-sm font-medium">{theme.name}</p>
                  <p className="text-xs text-gray-500">{theme.tagline}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Laget for små bedrifter */}
        <section className="bg-[#f5f3ff]">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Spesialisten på den minste bedriften
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-balance text-gray-600">
              De store bookingsystemene er bygget for kjeder med mange
              ansatte — og koster deretter. Bestilly gjør det motsatte: én
              person, én kalender, full kontroll. Ingen kompleksitet du ikke
              trenger, og en fast, forutsigbar årspris.
            </p>
          </div>
        </section>

        {/* Pris */}
        <section className="mx-auto max-w-3xl px-6 py-20">
          <div className="rounded-3xl bg-[#fdf3ee] p-8 text-center sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
              Pris
            </p>
            <p className="mt-2 text-5xl font-bold">{ANNUAL_PRICE_NOK} kr</p>
            <p className="mt-1 text-gray-600">i året — det er alt</p>
            <ul className="mx-auto mt-8 grid max-w-md gap-2.5 text-left text-sm">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="font-semibold text-green-600">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/registrer"
              className="mt-9 inline-block rounded-xl bg-gray-900 px-7 py-3 text-sm font-medium text-white hover:bg-gray-700"
            >
              Kom i gang i dag
            </Link>
          </div>
        </section>

        {/* Tillitslinje */}
        <section className="mx-auto max-w-3xl px-6 pb-4">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-center text-sm text-gray-500">
            <span>Data lagret i EU</span>
            <span aria-hidden>·</span>
            <span>GDPR-tilpasset</span>
            <span aria-hidden>·</span>
            <span>Utviklet i Norge, på norsk</span>
            <span aria-hidden>·</span>
            <span>Ingen gebyr per booking</span>
          </div>
          <p className="mt-2 text-center text-xs text-gray-400">
            Les mer i{" "}
            <Link href="/personvern" className="underline">
              personvernerklæringen
            </Link>{" "}
            og{" "}
            <Link href="/databehandleravtale" className="underline">
              databehandleravtalen
            </Link>
            .
          </p>
        </section>

        {/* Ofte stilte spørsmål */}
        <section className="bg-[#f5f3ff]">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <h2 className="text-center text-3xl font-bold tracking-tight">
              Ofte stilte spørsmål
            </h2>
            <div className="mt-10 space-y-3">
              {faq.map((item) => (
                <details
                  key={item.q}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >
                  <summary className="cursor-pointer font-semibold">
                    {item.q}
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Om oss */}
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight">Om oss</h2>
          <div className="mt-4 space-y-4 text-gray-600">
            <p>
              Bestilly ble til av en enkel tanke: Hver liten bedrift fortjener
              et enkelt og rimelig bookingverktøy. Gründer Helene Grønberg,
              utvikler fra Modum, så at de fleste bookingsystemene var
              overdimensjonerte og for dyre for dem som driver alene —
              Frisører, terapeuter, konsulenter. Månedsgebyr på flere hundre
              kroner og kostnad per booking spiser fort opp marginene.
            </p>
            <p>
              Resultatet ble Bestilly: Et rent, enkelt verktøy bygget fra
              bunnen av for de minste bedriftene. Du slipper å betale for
              funksjonalitet du ikke trenger, og prisen er forutsigbar. Alt er
              utviklet i Norge, på norsk — Så support og veiledning alltid er
              på ditt eget språk.
            </p>
            <p>
              Filosofien er like enkel som den er viktig: Teknologien skal
              forenkle hverdagen for små tjenesteytere — Ikke være en ekstra
              belastning. Vi har stor respekt for gründere som satser på det de
              brenner for, og vil gjøre det lettere for dem å bruke tiden på
              nettopp det. Fra én gründer til en annen — Velkommen til Bestilly.
            </p>
          </div>
        </section>

        {/* Pilotprogram */}
        <section className="mx-auto max-w-3xl px-6 pb-20">
          <div className="rounded-3xl border-2 border-gray-900 p-8 text-center sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
              Pilotprogram
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Bli en av de 10 første
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-balance text-gray-600">
              Bestilly er nytt, og vi tar inn 10 enkeltpersonforetak som
              pilotbedrifter. Du får bruke hele Bestilly gratis i 3 måneder,
              en direkte linje til utvikleren, og reell mulighet til å forme
              produktet. Til gjengjeld ber vi om at du faktisk bruker det, gir
              ærlig tilbakemelding — og lar oss bruke deg som referanse.
            </p>
            <Link
              href="/kontakt"
              className="mt-8 inline-block rounded-xl bg-gray-900 px-7 py-3 text-sm font-medium text-white hover:bg-gray-700"
            >
              Bli pilotbedrift
            </Link>
          </div>
        </section>

        {/* Avsluttende CTA */}
        <section className="bg-gray-900">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Klar til å la kundene booke selv?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-gray-300">
              Sett opp bedriften din på noen minutter.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/registrer"
                className="rounded-xl bg-white px-7 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100"
              >
                Kom i gang
              </Link>
              <Link
                href="/demo"
                className="rounded-xl border border-gray-600 px-7 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                Se en demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col items-center gap-2 px-6 py-8 text-center text-sm text-gray-500">
        <span className="font-semibold text-gray-900">Bestilly</span>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/bookingsystem" className="hover:text-gray-900">
            Bookingsystem
          </Link>
          <Link href="/hvorfor-bestilly" className="hover:text-gray-900">
            Hvorfor Bestilly
          </Link>
          <Link href="/kontakt" className="hover:text-gray-900">
            Kontakt
          </Link>
          <Link href="/personvern" className="hover:text-gray-900">
            Personvern
          </Link>
          <Link href="/vilkar" className="hover:text-gray-900">
            Vilkår
          </Link>
          <Link href="/login" className="hover:text-gray-900">
            Logg inn
          </Link>
        </div>
        <span>Bookingsystem for enkeltpersonforetak</span>
      </footer>
    </div>
  );
}
