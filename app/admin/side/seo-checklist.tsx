type Check = { label: string; done: boolean };

export function SeoChecklist({ checks }: { checks: Check[] }) {
  const doneCount = checks.filter((c) => c.done).length;
  return (
    <div className="space-y-3 rounded-xl border border-gray-200 p-4">
      <div>
        <h2 className="font-semibold">SEO-sjekkliste</h2>
        <p className="text-sm text-gray-500">
          Jo mer du fyller ut, jo lettere blir bedriften å finne på nett. (
          {doneCount}/{checks.length} fullført)
        </p>
      </div>
      <ul className="space-y-2">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-2 text-sm">
            <span
              className={
                c.done ? "font-medium text-green-600" : "text-gray-300"
              }
            >
              {c.done ? "✓" : "○"}
            </span>
            <span className={c.done ? "text-gray-500" : ""}>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
