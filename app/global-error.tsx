"use client";

// Fanger feil i selve root-layouten (når app/error.tsx ikke kan rendres).
// Må ha sin egen <html>/<body> siden den erstatter layouten.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="nb">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          margin: 0,
          background: "#fdf3ee",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>Noe gikk galt</h1>
          <p style={{ color: "#525252", marginTop: 12 }}>
            Vi støtte på et problem da siden skulle lastes. Prøv igjen, eller
            gå til forsiden.
          </p>
          <div
            style={{
              marginTop: 24,
              display: "flex",
              gap: 12,
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#171717",
                color: "white",
                border: 0,
                padding: "10px 20px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Prøv igjen
            </button>
            <a
              href="/"
              style={{
                background: "white",
                color: "#171717",
                border: "1px solid #d4d4d4",
                padding: "10px 20px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Til forsiden
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
