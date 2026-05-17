import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ANNUAL_PRICE_NOK } from "@/lib/pricing";

const title = "Hvorfor velge bestilly? | Sammenligning av bookingsystem";
const description =
  "Hvorfor bestilly fremfor andre bookingsystemer: én fast årspris på 1599 kr, ingen månedspris, ingen gebyr per booking — og nettside og markedsføring inkludert.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/hvorfor-bestilly" },
  openGraph: { title, description, type: "website", locale: "nb_NO" },
};

const rows = [
  {
    label: "Pris",
    bestilly: "1599 kr i året — fast",
    others: "Ofte 200–600 kr i måneden",
  },
  {
    label: "Gebyr per booking",
    bestilly: "Nei",
    others: "Noen tar gebyr per booking",
  },
  {
    label: "Oppstartsavgift",
    bestilly: "Nei",
    others: "Varierer",
  },
  {
    label: "Egen nettside",
    bestilly: "Inkludert",
    others: "Ofte tillegg — eller mangler helt",
  },
  {
    label: "Nettbutikk, blogg og nyhetsbrev",
    bestilly: "Inkludert",
    others: "Sjelden inkludert",
  },
  {
    label: "Markedsføringsverktøy",
    bestilly: "AI-hub inkludert",
    others: "Sjelden inkludert",
  },
  {
    label: "Laget for",
    bestilly: "Små bedrifter med stram økonomi",
    others: "Ofte rettet mot større aktører",
  },
  {
    label: "Forutsigbarhet",
    bestilly: "Du vet hva det koster hele året",
    others: "Pris kan variere med bruk",
  },
];

const points = [
  {
    title: "Én pris, ingen overraskelser",
    text: "Du betaler 1599 kr i året — uansett hvor mange bookinger du får. Ingen månedspris som vokser, ingen gebyrer som spiser av inntekten.",
  },
  {
    title: "Alt på ett sted",
    text: "Bookingsystem, nettside, nettbutikk, blogg, nyhetsbrev og en AI-markedsføringshub — samlet, så du slipper å sette sammen og betale for flere verktøy.",
  },
  {
    title: "Laget for de minste",
    text: "bestilly er bygget for frisøren, salongen og enkeltpersonforetaket — ikke for store kjeder. Enkelt å sette opp, enkelt å bruke.",
  },
];

export default function HvorforBestilly() {
  return (
    <div className="flex flex-1 flex-col">
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
              Hvorfor bestilly
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Hvorfor velge bestilly?
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-gray-600">
              De fleste bookingsystemer er laget for større bedrifter og
              koster deretter. bestilly er laget for de minste — med én fast,
              forutsigbar årspris.
            </p>
          </div>
        </section>

        {/* Sammenligning */}
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight">
            bestilly mot vanlige bookingsystemer
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            En grov sammenligning — tilbudene varierer, så sjekk alltid hva
            som gjelder hos den enkelte leverandøren.
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-3 font-semibold"></th>
                  <th className="p-3 font-semibold text-gray-900">
                    bestilly
                  </th>
                  <th className="p-3 font-semibold text-gray-500">
                    Vanlige bookingsystemer
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-t border-gray-200">
                    <td className="p-3 font-medium text-gray-700">
                      {row.label}
                    </td>
                    <td className="bg-[#fdf3ee]/60 p-3 text-gray-900">
                      {row.bestilly}
                    </td>
                    <td className="p-3 text-gray-500">{row.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Punkter */}
        <section className="bg-[#f5f3ff]">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="text-center text-2xl font-bold tracking-tight">
              Slik tenker vi
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {points.map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pris */}
        <section className="mx-auto max-w-3xl px-6 py-16">
          <div className="rounded-3xl bg-[#fdf3ee] p-8 text-center sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
              Pris
            </p>
            <p className="mt-2 text-5xl font-bold">{ANNUAL_PRICE_NOK} kr</p>
            <p className="mt-1 text-gray-600">i året — alt inkludert</p>
            <Link
              href="/registrer"
              className="mt-8 inline-block rounded-xl bg-gray-900 px-7 py-3 text-sm font-medium text-white hover:bg-gray-700"
            >
              Kom i gang i dag
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gray-900">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Vil du se hvordan det fungerer?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-gray-300">
              Prøv en demo uten å registrere deg.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/demo"
                className="rounded-xl bg-white px-7 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100"
              >
                Se en demo
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
          <Link href="/kontakt" className="hover:text-gray-900">
            Kontakt
          </Link>
        </div>
        <span>Enkelt bookingsystem for små bedrifter</span>
      </footer>
    </div>
  );
}
