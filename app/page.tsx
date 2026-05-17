import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">bestilly</h1>
        <p className="max-w-md text-balance text-gray-600">
          Enkelt og rimelig bookingsystem for små bedrifter. Én pris i året —
          ingen overraskelser.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/registrer"
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
        >
          Kom i gang
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
        >
          Logg inn
        </Link>
      </div>
      <p className="text-xs text-gray-400">
        Salgsside med demo kommer senere (fase 1, steg 9).
      </p>
    </main>
  );
}
