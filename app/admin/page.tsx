import Link from "next/link";

const sections = [
  {
    title: "Behandlinger",
    description: "Tjenestene du tilbyr — navn, beskrivelse, varighet og pris.",
    href: "/admin/behandlinger",
    status: "Klar",
  },
  {
    title: "Åpningstider",
    description: "Fast ukerytme og ferieavvik som styrer ledige tider.",
    href: "/admin/apningstider",
    status: "Klar",
  },
  {
    title: "Bookinger",
    description: "Oversikt over kommende og tidligere avtaler.",
    href: "/admin/bookinger",
    status: "Klar",
  },
  {
    title: "Onepage",
    description: "Din offentlige side med booking og automatisk SEO.",
    href: null,
    status: "Kommer i steg 8",
  },
];

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Velkommen</h1>
        <p className="text-sm text-gray-500">
          Administrer bedriften din herfra. Flere funksjoner kommer i de neste
          stegene.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => {
          const card = (
            <div
              className={`h-full rounded-xl border border-gray-200 p-4 ${
                section.href ? "transition-colors hover:border-gray-400" : ""
              }`}
            >
              <h2 className="font-semibold">{section.title}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {section.description}
              </p>
              <p
                className={`mt-3 text-xs font-medium ${
                  section.href ? "text-green-600" : "text-gray-400"
                }`}
              >
                {section.status}
              </p>
            </div>
          );
          return section.href ? (
            <Link key={section.title} href={section.href}>
              {card}
            </Link>
          ) : (
            <div key={section.title}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
