import type { AuditItem, AuditStatus, SeoAuditResult } from "@/lib/seo-audit";

const STATUS_ICON: Record<AuditStatus, string> = {
  pass: "✓",
  warn: "!",
  fail: "✕",
};

const STATUS_STYLE: Record<AuditStatus, string> = {
  pass: "bg-green-100 text-green-700",
  warn: "bg-amber-100 text-amber-800",
  fail: "bg-red-100 text-red-700",
};

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Sterk SEO";
  if (score >= 50) return "På god vei";
  return "Mye å hente";
}

export function SeoAudit({ audit }: { audit: SeoAuditResult }) {
  const categories = audit.items.reduce((map, item) => {
    const list = map.get(item.category) ?? [];
    list.push(item);
    map.set(item.category, list);
    return map;
  }, new Map<string, AuditItem[]>());

  const failCount = audit.items.filter((i) => i.status === "fail").length;
  const warnCount = audit.items.filter((i) => i.status === "warn").length;

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold">SEO-sjekk</h2>
          <p className="text-sm text-gray-500">
            En gjennomgang av hvor godt siden din er rigget for søk.
          </p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${scoreColor(audit.score)}`}>
            {audit.score}
            <span className="text-base font-medium text-gray-400">/100</span>
          </div>
          <div className="text-xs text-gray-500">{scoreLabel(audit.score)}</div>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${
            audit.score >= 80
              ? "bg-green-500"
              : audit.score >= 50
                ? "bg-amber-500"
                : "bg-red-500"
          }`}
          style={{ width: `${audit.score}%` }}
        />
      </div>

      {(failCount > 0 || warnCount > 0) && (
        <p className="text-sm text-gray-600">
          {failCount > 0 && (
            <span className="font-medium text-red-600">
              {failCount} viktig(e) ting å fikse
            </span>
          )}
          {failCount > 0 && warnCount > 0 && " · "}
          {warnCount > 0 && (
            <span className="text-amber-700">
              {warnCount} forbedring(er) anbefalt
            </span>
          )}
        </p>
      )}

      {[...categories.entries()].map(([category, items]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {category}
          </h3>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex gap-2.5 text-sm">
                <span
                  className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs font-bold ${STATUS_STYLE[item.status]}`}
                  aria-hidden
                >
                  {STATUS_ICON[item.status]}
                </span>
                <span>
                  <span
                    className={
                      item.status === "pass"
                        ? "text-gray-500"
                        : "font-medium text-gray-800"
                    }
                  >
                    {item.label}
                  </span>
                  {item.status !== "pass" && (
                    <span className="block text-gray-500">{item.advice}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
