import Link from "next/link";

const features = [
  {
    title: "Kunder booker selv",
    description:
      "Kundene dine bestiller time når det passer dem — døgnet rundt, uten at telefonen ringer.",
  },
  {
    title: "Automatiske e-poster",
    description:
      "Bekreftelse og varsel sendes til både deg og kunden. Avbestilling skjer med ett klikk.",
  },
  {
    title: "Din egen side",
    description:
      "En enkel, pen nettside for bedriften din — klar for Google og søk i nærområdet.",
  },
  {
    title: "Oversikt og kalender",
    description:
      "Se alle bookinger i en ryddig kalender. Sett åpningstider og ferieavvik selv.",
  },
];

const included = [
  "Bookingsystem og kalender",
  "Egen nettside med SEO",
  "Ubegrenset antall bookinger",
  "E-postvarsling til deg og kundene",
  "Ingen oppstartsavgift",
  "Ingen gebyr per booking",
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-bold">bestilly</span>
        <Link
          href="/login"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Logg inn
        </Link>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Bookingsystem for små bedrifter — uten månedlige overraskelser
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-gray-600">
            Bestilly gir frisøren, salongen eller enkeltpersonforetaket et
            komplett bookingsystem og en egen nettside. Én pris i året.
            Ingenting mer.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <Link
              href="/registrer"
              className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700"
            >
              Kom i gang
            </Link>
            <Link
              href="/demo"
              className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium hover:bg-gray-50"
            >
              Se en demo
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-8">
          <h2 className="text-center text-2xl font-bold">
            Laget for deg som akkurat har startet
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-balance text-center text-gray-600">
            De store bookingsystemene koster flere hundre kroner i måneden.
            Bestilly er laget for små bedrifter med stram økonomi som trenger
            forutsigbarhet — du vet nøyaktig hva det koster, hele året.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-gray-200 p-5"
              >
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-12">
          <div className="rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-sm font-medium text-gray-500">Pris</p>
            <p className="mt-1 text-4xl font-bold">990 kr i året</p>
            <p className="mt-1 text-gray-600">Det er alt. Ingen overraskelser.</p>
            <ul className="mx-auto mt-6 grid max-w-md gap-2 text-left text-sm">
              {included.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="font-medium text-green-600">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/registrer"
              className="mt-7 inline-block rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700"
            >
              Kom i gang i dag
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 px-6 py-6 text-center text-sm text-gray-500">
        bestilly — enkelt bookingsystem for små bedrifter
      </footer>
    </div>
  );
}
