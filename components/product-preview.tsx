// En HTML/CSS-mockup som viser hvordan kundesiden i bestilly ser ut.
export function ProductPreview() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl">
      <div className="flex items-center gap-1.5 border-b border-gray-100 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
        <span className="ml-3 truncate rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
          bestilly.no/din-salong
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div
          className="rounded-xl px-4 py-7 text-center"
          style={{ background: "#f1e4da" }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "#a8654a" }}
          >
            Frisør &amp; velvære
          </p>
          <p
            className="mt-1 text-xl font-bold"
            style={{ color: "#a8654a", fontFamily: "var(--font-playfair)" }}
          >
            Salong Marina
          </p>
        </div>

        <div className="space-y-2">
          {[
            ["Klipp", "550 kr"],
            ["Farging", "1 200 kr"],
          ].map(([name, price]) => (
            <div
              key={name}
              className="flex justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <span className="font-medium">{name}</span>
              <span className="text-gray-500">{price}</span>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-500">
            Ledige tider
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["09:00", "09:30", "10:00"].map((t) => (
              <span
                key={t}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs"
              >
                {t}
              </span>
            ))}
            <span className="rounded-md bg-gray-900 px-2 py-1 text-xs text-white">
              10:30
            </span>
            <span className="rounded-md border border-gray-300 px-2 py-1 text-xs">
              11:00
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-gray-900 py-2 text-center text-xs font-medium text-white">
          Bekreft booking
        </div>
      </div>
    </div>
  );
}
