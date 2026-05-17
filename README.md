# Bestillly

Et rimelig, enkelt bookingsystem for små bedrifter og salonger. Bygget som SaaS med fokus på lav terskel for ikke-tekniske brukere, forutsigbar prissetting (fast årsabonnement, ingen transaksjonsavgift), og rask oppsett uten konfigurasjons-overhead.

**Produksjon:** [bestilly.no](https://bestilly.no)

## Kjernefunksjonalitet

- **Bookingadministrasjon** — kunder bestiller time online, bedriften ser bookinger i ett dashboard, kunder får automatisk bekreftelse og påminnelse på e-post.
- **Designmaler** — flere ferdige booking-sider tilpasset frisør, neglesalong, massasjeterapeut osv. Kunden velger mal og fyller inn egne tjenester/priser uten å skrive kode.
- **Kundeadministrasjon** — historikk per kunde, notater, kontaktinfo.
- **Betalingsintegrasjon** — Vipps for norske kunder.
- **E-postvarsling** — transaksjons-e-poster sendt via Nodemailer med tilpasningsbare maler.

## Tech-stack

| Lag | Valg | Hvorfor |
|---|---|---|
| Frontend | Next.js 16 (App Router) + React 19 + Tailwind CSS 4 | Server Components for rask første lasting, lavt JS-fotavtrykk på offentlige booking-sider |
| Backend | Next.js API routes (Node 22, TypeScript) | Holder hele stacken i ett kodebase — enklere drift for ett-personers-prosjekt |
| Database | Neon Postgres + Drizzle ORM | Serverless Postgres med branching for trygg utvikling; Drizzle gir typesikker SQL uten ORM-overhead |
| Autentisering | next-auth v5 (Auth.js) + Drizzle adapter + bcryptjs | Støtte for både e-post/passord og OAuth, sesjons-håndtering ut av boksen |
| AI | Anthropic Claude SDK + Replicate | Brukes for innholds-assistanse i admin (forslag til tjenestebeskrivelser, e-postmaler) |
| E-post | Nodemailer | Transaksjonelle e-poster (bekreftelser, påminnelser) |
| Dato/tid | date-fns + date-fns-tz | Trygg håndtering av norsk tidssone, sommertid og lokalisering |
| Hosting | Railway (edge-cache, automatisk SSL) | Lav drifts-overhead, betal-for-bruk |

## Arkitekturvalg

**Hvorfor Drizzle og ikke Prisma:** Drizzle er nærmere ren SQL og har mindre runtime-overhead. For en booking-app med tids-tunge spørringer (overlappende intervaller, tilgjengelighet) er det viktigere å kunne skrive optimale SQL-spørringer enn å abstrahere dem bort.

**Hvorfor next-auth v5 og ikke Clerk/Auth0:** Lavere kostnad ved skalering, full kontroll over datalagring (Postgres) — viktig for norsk GDPR-tilpasning.

**Hvorfor én fast årlig pris (990 kr) og ikke transaksjonsavgift:** Målgruppen er enmannssalonger og småbedrifter som velger bort Mable/Setmore på grunn av per-booking-kostnad. Fast pris er et forretningsvalg som driver tekniske valg (ingen behov for sub-cent fakturering, ingen Stripe Connect, mindre bokføringsoverhead).

## Lokal utvikling

```bash
# Krever Node 22+
npm install
cp .env.example .env.local   # fyll inn DATABASE_URL og AUTH_SECRET

npm run db:push              # synker Drizzle-skjema mot dev-database
npm run db:seed              # legger inn test-data (valgfritt)
npm run dev                  # starter på http://localhost:3001
```

## Database-skript

```bash
npm run db:generate   # generer migrasjon fra skjema-endring
npm run db:migrate    # kjør pending migrasjoner
npm run db:push       # push skjema direkte (kun dev)
npm run db:studio     # åpne Drizzle Studio for inspeksjon
```

## Status

Aktivt produkt i produksjon. Nye funksjoner ruller ut løpende. Prioritet for neste iterasjon: SMS-påminnelser, fakturering for salongene, og forbedret rapportering.

## Lisens

Privateid. All right reserved © Grønberg Tech Solutions (org.nr 927 889 404).

---

*Bygget av [Helene Grønberg](https://helene.cloud) — full-stack-utvikler og gründer i Modum.*
