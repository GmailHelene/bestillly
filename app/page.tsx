import Link from "next/link";
import { THEMES } from "@/lib/themes";
import { ProductPreview } from "@/components/product-preview";
import { Logo } from "@/components/logo";
import { enterDemo } from "@/lib/actions/demo";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "bestilly",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Enkelt bookingsystem og nettside for små bedrifter — én fast årspris.",
  offers: {
    "@type": "Offer",
    price: "1599",
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
    title: "Full oversikt",
    description:
      "Alle bookinger i en ryddig kalender. Sett åpningstider og ferie selv.",
  },
  {
    title: "Klar for Google",
    description:
      "Siden er bygget for søk, så nye kunder lettere finner bedriften din.",
  },
  {
    title: "Egen nettbutikk",
    description:
      "Selg produkter på siden din — kundene betaler enkelt med Vipps.",
  },
  {
    title: "Blogg og oppdateringer",
    description:
      "Skriv innlegg som får egne sider — bra for synligheten i Google.",
  },
  {
    title: "Nyhetsbrev",
    description: "Samle abonnenter og hold kontakt med kundene dine.",
  },
  {
    title: "AI-markedsføringshub",
    description:
      "Lag innlegg til sosiale medier, SEO-tekster, blogginnlegg og bilder — med en kredittpott inkludert.",
  },
  {
    title: "Ingen app å installere",
    description: "Alt skjer i nettleseren — for deg og for kundene dine.",
  },
];

const included = [
  "Bookingsystem og kalender",
  "Egen nettside med designvalg",
  "Ubegrenset antall bookinger",
  "E-postvarsling til deg og kundene",
  "Nettbutikk, blogg og nyhetsbrev",
  "AI-markedsføringshub med kredittpott inkludert",
  "Logo og bildegalleri",
  "Ingen oppstartsavgift eller gebyr per booking",
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
                  Bookingsystem for små bedrifter
                </p>
                <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                  Et komplett bookingsystem til én fast årspris
                </h1>
                <p className="mt-5 text-balance text-lg text-gray-600">
                  Bestilly gir frisøren, salongen eller
                  enkeltpersonforetaket et bookingsystem, en egen nettside og
                  en AI-markedsføringshub — for 1599 kr i året. Ingen
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
              Prøv bestilly selv
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
            Tre ferdige design — bytt når du vil, med ett klikk.
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
              Laget for deg som akkurat har startet
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-balance text-gray-600">
              De store bookingsystemene koster flere hundre kroner i måneden.
              Bestilly er laget for små bedrifter med stram økonomi som
              trenger forutsigbarhet — du vet nøyaktig hva det koster, hele
              året.
            </p>
          </div>
        </section>

        {/* Pris */}
        <section className="mx-auto max-w-3xl px-6 py-20">
          <div className="rounded-3xl bg-[#fdf3ee] p-8 text-center sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
              Pris
            </p>
            <p className="mt-2 text-5xl font-bold">1599 kr</p>
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
        <span className="font-semibold text-gray-900">bestilly</span>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/bookingsystem" className="hover:text-gray-900">
            Bookingsystem
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
        <span>Enkelt bookingsystem for små bedrifter</span>
      </footer>
    </div>
  );
}
