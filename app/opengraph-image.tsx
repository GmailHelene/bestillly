import { ImageResponse } from "next/og";

// Open Graph-bilde for Bestilly. Vises når lenken deles på Facebook,
// LinkedIn, Slack osv. Standard 1200×630.
export const alt = "Bestilly, bookingsystem for enkeltpersonforetak";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#fdf3ee",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 60,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              background: "#e07a5f",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
              <path
                d="M9 16.5l4.5 4.5L23 11"
                stroke="#ffffff"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#171717",
              letterSpacing: "-0.02em",
            }}
          >
            Bestilly
          </span>
        </div>

        {/* Tittel */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#171717",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: 24,
          }}
        >
          Bookingsystem laget for enkeltpersonforetak
        </div>

        {/* Undertekst */}
        <div
          style={{
            fontSize: 32,
            color: "#525252",
            lineHeight: 1.3,
          }}
        >
          Time inn, kvittering ut, ferdig regnskapsgrunnlag.
        </div>

        {/* Pris-pille */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#ffffff",
              background: "#171717",
              padding: "12px 24px",
              borderRadius: 14,
            }}
          >
            149 kr / mnd
          </span>
          <span style={{ fontSize: 24, color: "#737373" }}>
            Alt inkludert
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
