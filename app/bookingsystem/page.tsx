import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";

const title =
  "Bookingsystem for frisører, salonger og små bedrifter | bestilly";
const description =
  "Bestilly er et enkelt og rimelig bookingsystem for frisører, salonger og enkeltpersonforetak. La kundene bestille time selv — 1599 kr i året, alt inkludert.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/bookingsystem" },
  openGraph: {
    title,
    description,
    type: "website",
    locale: "nb_NO",
  },
};

// Spørsmål og svar — også lagt inn som FAQPage-strukturerte data nedenfor.
const faq = [
  {
    q: "Hva koster et bookingsystem?",
    a: "Bestilly koster 1599 kroner i året — alt er inkludert. Ingen oppstartsavgift, ingen månedspris og ingen gebyr per booking. De fleste bookingsystemer tar flere hundre kroner i måneden, så for en liten bedrift blir bestilly langt rimeligere.",
  },
  {
    q: "Passer bestilly for enkeltpersonforetak?",
    a: "Ja. Bestilly er laget nettopp for små bedrifter og enkeltpersonforetak — frisører, neglteknikere, massører, terapeuter og andre som tar imot timeavtaler. Du trenger ingen ansatte eller egen IT-kunnskap for å komme i gang.",
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
    q: "Hvordan kommer jeg i gang med bookingsystemet?",
    a: "Du registrerer bedriften på et par minutter, legger inn behandlingene og åpningstidene dine, og deler lenken din. Da kan kundene booke time med en gang. Du kan prøve gratis før du bestemmer deg.",
  },
  {
    q: "Kan jeg ta imot betaling gjennom bestilly?",
    a: "Bestilly har en innebygd nettbutikk der kundene kan kjøpe produkter og betale med Vipps. Selve timebestillingen er gratis for kunden — betaling for behandlingen skjer som vanlig hos deg.",
  },
  {
    q: "Er det bindingstid?",
    a: "Du betaler én fast årspris på 1599 kroner. Det er ingen lang bindingstid og ingen skjulte kostnader — du vet nøyaktig hva systemet koster hele året.",
  },
  {
    q: "Hva er AI-markedsføringshuben?",
    a: "I tillegg til bookingsystemet får du en markedsføringshub. Den lager innlegg til sosiale medier, SEO-tekster, blogginnlegg, markedsanalyser og bildeforslag — tilpasset bedriften din. Hver konto har en kredittpott inkludert i årsprisen, som fornyes hver måned.",
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

const audience = [
  {
    title: "Frisører",
    text: "La kundene bestille klipp og farge selv, og hold full oversikt over dagen.",
  },
  {
    title: "Negl- og skjønnhetssalonger",
    text: "Vis behandlinger og priser, og fyll kalenderen uten å svare på meldinger hele dagen.",
  },
  {
    title: "Massasje og terapi",
    text: "Gi klientene en enkel måte å finne ledig time på, med automatiske påminnelser.",
  },
  {
    title: "Enkeltpersonforetak",
    text: "Et profesjonelt bookingsystem og en egen nettside — uten dyre månedsabonnement.",
  },
];

const features = [
  "Online timebestilling kundene styrer selv",
  "Egen nettside med valgbart design",
  "Automatisk e-post til deg og kunden",
  "Ryddig kalender med åpningstider og ferie",
  "Nettbutikk, blogg og nyhetsbrev inkludert",
  "AI-markedsføringshub for innhold og SEO",
  "Bygget for Google, så nye kunder finner deg",
];

export default function BookingsystemLanding() {
  return (
    <div className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" aria-label="bestilly">
          <Logo />
        </Link>
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
        <section className="bg-[#fdf3ee]">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
              Bookingsystem for små bedrifter
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Bookingsystem for frisører, salonger og små bedrifter
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-gray-600">
              Bestilly lar kundene dine bestille time selv — døgnet rundt.
              Du får et komplett bookingsystem, en egen nettside og en
              AI-markedsføringshub for 1599 kroner i året, helt uten
              månedspris eller gebyr per booking.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
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
        </section>

        {/* Intro */}
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight">
            Enkel online timebestilling for bedriften din
          </h2>
          <div className="mt-4 space-y-4 text-gray-600">
            <p>
              Et godt bookingsystem sparer deg for tid hver eneste dag. I
              stedet for å svare på telefon og meldinger om ledige tider, lar
              du kundene se kalenderen din og bestille time selv. Bestilly er
              laget for små bedrifter som vil ha online timebestilling uten å
              betale dyre månedsabonnement.
            </p>
            <p>
              Du legger inn behandlingene dine, prisene, åpningstidene og
              eventuelle ferieavvik. Kundene finner fram til en ledig tid,
              booker, og får bekreftelse på e-post automatisk. Du beholder full
              oversikt i en ryddig kalender — og slipper dobbeltbookinger.
            </p>
          </div>
        </section>

        {/* For hvem */}
        <section className="bg-[#f5f3ff]">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="text-center text-2xl font-bold tracking-tight">
              Hvem passer bestilly for?
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {audience.map((a) => (
                <div
                  key={a.title}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hva du får */}
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight">
            Alt dette er inkludert
          </h2>
          <ul className="mt-6 grid gap-2.5 text-sm sm:grid-cols-2">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <span className="font-semibold text-green-600">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </section>

        {/* Pris */}
        <section className="mx-auto max-w-3xl px-6 pb-16">
          <div className="rounded-3xl bg-[#fdf3ee] p-8 text-center sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
              Pris
            </p>
            <p className="mt-2 text-5xl font-bold">1599 kr</p>
            <p className="mt-1 text-gray-600">i året — alt inkludert</p>
            <Link
              href="/registrer"
              className="mt-8 inline-block rounded-xl bg-gray-900 px-7 py-3 text-sm font-medium text-white hover:bg-gray-700"
            >
              Kom i gang i dag
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[#f5f3ff]">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <h2 className="text-center text-2xl font-bold tracking-tight">
              Ofte stilte spørsmål om bookingsystem
            </h2>
            <div className="mt-8 space-y-3">
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

        {/* Avsluttende CTA */}
        <section className="bg-gray-900">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Klar til å la kundene booke selv?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-gray-300">
              Sett opp bookingsystemet ditt på noen minutter.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/registrer"
                className="rounded-xl bg-white px-7 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100"
              >
                Kom i gang
              </Link>
              <Link
                href="/"
                className="rounded-xl border border-gray-600 px-7 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                Les mer om bestilly
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col items-center gap-2 px-6 py-8 text-center text-sm text-gray-500">
        <span className="font-semibold text-gray-900">bestilly</span>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/" className="hover:text-gray-900">
            Forside
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
        </div>
        <span>Enkelt bookingsystem for små bedrifter</span>
      </footer>
    </div>
  );
}
