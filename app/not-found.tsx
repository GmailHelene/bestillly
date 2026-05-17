import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Siden finnes ikke</h1>
      <p className="max-w-sm text-gray-600">
        Vi fant ikke siden du lette etter. Den kan ha blitt flyttet eller
        fjernet.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
      >
        Til forsiden
      </Link>
    </main>
  );
}
