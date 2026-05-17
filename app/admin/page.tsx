const sections = [
  {
    title: "Behandlinger",
    description: "Tjenestene du tilbyr — navn, beskrivelse, varighet og pris.",
    step: "Kommer i steg 3",
  },
  {
    title: "Åpningstider",
    description: "Fast ukerytme og ferieavvik som styrer ledige tider.",
    step: "Kommer i steg 4",
  },
  {
    title: "Bookinger",
    description: "Oversikt over kommende og tidligere avtaler.",
    step: "Kommer i steg 6",
  },
  {
    title: "Onepage",
    description: "Din offentlige side med booking og automatisk SEO.",
    step: "Kommer i steg 8",
  },
];

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Velkommen</h1>
        <p className="text-sm text-gray-500">
          Dette er admin-skjelettet. Funksjonene under bygges i de neste stegene.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-xl border border-gray-200 p-4"
          >
            <h2 className="font-semibold">{section.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{section.description}</p>
            <p className="mt-3 text-xs font-medium text-gray-400">
              {section.step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
