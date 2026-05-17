# Bestilly

Bookingsystem laget for **enkeltpersonforetak** — én person, én kalender,
full kontroll. Time inn, faktura ut, ferdig regnskapsgrunnlag. Bygget som
SaaS med fokus på lav terskel for ikke-tekniske brukere og forutsigbar
prissetting: fast årsabonnement, ingen transaksjonsavgift.

**Produksjon:** [bestilly.no](https://bestilly.no)

## Kjernefunksjonalitet

- **Booking** — kundene bestiller time selv, døgnet rundt. Bedriften ser alt
  i en kalender, og begge får bekreftelse på e-post. Avbestilling via lenke.
- **Egen nettside** — en enkel onepage per bedrift med valgbare design, logo
  og bildegalleri, på `bestilly.no/[bedrift]`.
- **Regnskapseksport** — last ned bookinger og salg for en valgt måned som
  CSV, klar for regnskapsfører eller import i regnskapsprogram.
- **Nettbutikk** — selg produkter med betaling via Vipps.
- **Blogg og nyhetsbrev** — innlegg med egne SEO-sider, og blokkbasert
  nyhetsbrev til abonnenter.
- **AI-markedsføringshub** — SEO-analyse, markedsanalyse, innlegg til sosiale
  medier, blogginnlegg, SEO-tekster, bildegenerering og publiseringsplan.
  Drevet av Anthropic Claude og Replicate, med en månedlig kredittpott.
- **Automatisk lokal SEO** — server-rendrede sider, `LocalBusiness`-JSON-LD,
  sitemap og meta per bedrift.

## Tech-stack

| Lag | Valg | Hvorfor |
|---|---|---|
| Frontend | Next.js 16 (App Router) + React 19 + Tailwind CSS 4 | Server Components for rask render, lavt JS-fotavtrykk på offentlige sider |
| Backend | Next.js Server Actions (TypeScript) | Hele stacken i ett kodebase — enklere drift for et soloprosjekt |
| Database | Neon Postgres + Drizzle ORM | Serverless Postgres; Drizzle gir typesikker SQL uten ORM-overhead |
| Autentisering | next-auth v5 (Auth.js) + bcryptjs | JWT-sesjoner, full kontroll over datalagring i Postgres |
| AI | Anthropic Claude + Replicate (Flux) | Tekst- og bildegenerering i markedsføringshuben |
| E-post | Nodemailer (Brevo SMTP) | Transaksjonelle e-poster — bekreftelser, varsler, nyhetsbrev |
| Bilder | Cloudinary | Opplasting og levering av bilder |
| Dato/tid | date-fns + date-fns-tz | Trygg håndtering av norsk tidssone og sommertid |
| Hosting | Railway | Lav drifts-overhead, automatisk SSL |
| Test | Vitest | Enhetstester av kjernelogikk (booking, helligdager, SSRF-vern, CSV) |

## Arkitekturvalg

**Drizzle framfor Prisma:** Drizzle er nærmere ren SQL med mindre
runtime-overhead. For en booking-app med tids-tunge spørringer (overlappende
intervaller, tilgjengelighet) er optimal SQL viktigere enn full abstraksjon.

**next-auth v5 framfor Clerk/Auth0:** Lavere kostnad ved skalering og full
kontroll over datalagring i Postgres — viktig for GDPR.

**Én fast årlig pris (2490 kr) framfor transaksjonsavgift:** Målgruppen er
enkeltpersonforetak som velger bort dyre månedsabonnement og per-booking-
gebyr. Fast pris er et forretningsvalg som forenkler de tekniske valgene.

## Multi-tenant

Hver bedrift er en tenant. Alle spørringer og mutasjoner er avgrenset til
`businessId` fra sesjonen. En demo-bedrift (`/demo`) viser hele løsningen
uten å lagre endringer.

## Lokal utvikling

```bash
# Krever Node 22+
npm install
cp .env.example .env.local   # fyll inn DATABASE_URL, AUTH_SECRET m.m.

npm run db:push              # synker Drizzle-skjema mot dev-database
npm run db:seed              # legger inn demo-data (valgfritt)
npm run dev                  # starter på http://localhost:3001
```

## Skript

```bash
npm run test          # kjør enhetstester (Vitest)
npm run build         # produksjonsbygg
npm run db:push       # push skjema direkte (kun dev)
npm run db:seed       # gjenopprett demo-bedriften
npm run db:studio     # åpne Drizzle Studio
```

## Status

Aktivt produkt i produksjon. Fase 1 (booking, nettside, SEO), Fase 2
(nettbutikk, blogg, nyhetsbrev) og Fase 3 (markedsføringshub) er ferdig.
Reposisjonert som spesialist for enkeltpersonforetak med regnskapseksport.

## Lisens

Privateid. All rights reserved © Grønberg Tech Solutions (org.nr 927 889 404).

---

*Bygget av [Helene Grønberg](https://helene.cloud) — full-stack-utvikler og gründer i Modum.*
