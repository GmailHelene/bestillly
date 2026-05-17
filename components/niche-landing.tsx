import Link from "next/link";
import { Logo } from "@/components/logo";
import type { NichePage } from "@/lib/niche-pages";

const features = [
  "Online timebestilling kundene styrer selv",
  "Egen nettside med valgbart design",
  "Automatisk e-post til deg og kunden",
  "Ryddig kalender med åpningstider og ferie",
  "Nettbutikk, blogg og nyhetsbrev inkludert",
  "AI-markedsføringshub for innhold og SEO",
  "Bygget for Google, så nye kunder finner deg",
];

export function NicheLanding({ niche }: { niche: NichePage }) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: niche.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

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
              {niche.eyebrow}
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              {niche.h1}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-gray-600">
              {niche.heroText}
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
            {niche.introHeading}
          </h2>
          <div className="mt-4 space-y-4 text-gray-600">
            {niche.introParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        {/* Utfordringer */}
        <section className="bg-[#f5f3ff]">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="text-center text-2xl font-bold tracking-tight">
              {niche.challengesHeading}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {niche.challenges.map((c) => (
                <div
                  key={c.title}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inkludert */}
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
              Ofte stilte spørsmål
            </h2>
            <div className="mt-8 space-y-3">
              {niche.faq.map((item) => (
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

        {/* CTA */}
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
          <Link href="/bookingsystem" className="hover:text-gray-900">
            Bookingsystem
          </Link>
          <Link href="/hvorfor-bestilly" className="hover:text-gray-900">
            Hvorfor bestilly
          </Link>
          <Link href="/kontakt" className="hover:text-gray-900">
            Kontakt
          </Link>
        </div>
        <span>Enkelt bookingsystem for små bedrifter</span>
      </footer>
    </div>
  );
}
