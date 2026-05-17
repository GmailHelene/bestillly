# Fremdriftsplan — bestilly

Enkelt og rimelig bookingsystem for små bedrifter (salonger, frisører o.l.).
Forretningsmodell: **990 kr/år per bedrift**, manuell årsfaktura. Multi-tenant.

**Status:** bestilly er **live på bestilly.no**. Fase 1 og Fase 2 er ferdig.
Neste: Fase 3.

---

## Status-oversikt

| Fase | Innhold | Status |
|------|---------|--------|
| Fase 1 | Bookingsystem, onepage, SEO, salgsside, lansering | ✅ Ferdig |
| Fase 2 | Nettbutikk, blogg, kontaktskjema, nyhetsbrev | ✅ Ferdig |
| Fase 3 | Markedsføringshub (AI-innhold, analyse, plan) | ⬜ Planlagt |

---

## Fase 1 — MVP (ferdig)

- [x] Steg 1 — Repo + teknisk skjelett (Next.js 16, Neon, Drizzle, Auth.js)
- [x] Steg 2 — Registrering, innlogging, admin
- [x] Steg 3 — Behandlinger (CRUD)
- [x] Steg 4 — Åpningstider (ukerytme + ferieavvik)
- [x] Steg 5 — Offentlig onepage + ledighetskalender
- [x] Steg 6 — Booking-flyt + e-postvarsling
- [x] Steg 7 — Avbestilling via lenke
- [x] Steg 7b — Bookingkalender i admin
- [x] Steg 8 — Onepage-redigering + SEO (JSON-LD, sitemap, robots)
- [x] Steg 9 — Salgsside + demo
- [x] Steg 9b — Rikere onepage (temaer, logo/bilder, header/footer)
- [x] Steg 10 — Lansering: deploy til Railway, domenet bestilly.no, HTTPS

---

## Tverrgående — lett å glemme

- [x] **Tidssoner** — alt lagres i UTC, vises i norsk tid (Europe/Oslo)
- [x] **GDPR / personvern** — personvernerklæring (/personvern), samtykketekst
- [x] **Vilkår** for bedriftene (/vilkar), inkl. betalings- og avbestillingsregler
- [x] **Validering** av all bruker-input
- [x] **Feilhåndtering** — vennlige feilsider og feilmeldinger
- [x] **Onboarding** — kom-i-gang-sjekkliste på admin-dashbordet
- [~] **Mobilvennlig** — bygget responsivt; bør testes på ekte telefon
- [~] **Tilgjengelighet (uu)** — labels og kontrast på plass; bør gjennomgås
- [ ] **E-postlevering** — verifiser SPF/DKIM i Brevo; bytt til @bestilly.no-avsender
- [ ] **Sikkerhetskopi** — verifiser backup-innstilling i Neon
- [ ] **Faktureringsrutine** — sett opp Fiken/Conta for årsfaktura

*Juridisk merknad: personvernerklæring og vilkår er solide utkast — få dem
gjennomgått av noen med juridisk innsikt før mange kunder.*

---

## Fase 2 — Nettbutikk, blogg og nyhetsbrev (ferdig)

- [x] F2.1 — Produkter i admin (CRUD med bilde og lagerstatus)
- [x] F2.2 — Butikk-seksjon på onepage + handlekurv
- [x] F2.3 — Kasse med manuell Vipps (kunden betaler bedriften direkte)
- [x] F2.4 — Ordrebekreftelse på e-post + ordreoversikt i admin
- [x] F2.5 — Abonnenter — påmeldingsskjema, popup, abonnent-side
- [x] F2.6 — Lag og send nyhetsbrev
- [x] F2.7 — Avmelding (/avmeld/[token]) + GDPR-samtykke
- [x] Kontaktskjema på onepagen (valgfri seksjon)
- [x] Blogg — innlegg med egne SEO-sider (/[bedrift]/[innlegg])
- [x] Kontostatus og betalingsvern — driftspanel (/drift)

**Besluttet underveis:** Betaling skjer som manuell Vipps — bedriften skriver
inn Vipps-nummeret sitt, kunden betaler direkte, bedriften bekrefter ordren.
Automatisk kortbetaling (Stripe Connect) er en mulig senere utvidelse.

- [x] Blokkbasert nyhetsbrev-editor — tekst-, overskrift-, bilde- og
  knapp-blokker, med startmaler og robust mobilvennlig e-postdesign.

---

## Fase 3 — Markedsføringshub

Mål: gi bedriftene et enkelt, men noe avansert verktøy for markedsføring —
SoMe-innhold, SEO, markedsanalyse og publiseringsplan, samlet på ett sted.
Inspirert av Helenes tidligere app «Your Marketing Friend».

### Avklaringer — besluttet

- **Prismodell: kreditt-system.** Hver bedrift får en månedlig pott
  AI-kreditter inkludert i 990 kr/år; topp-opp-pakker kjøpes ved behov.
  Ulike handlinger koster ulikt (post = 1, bilde = 2, analyse = 5).
  Konkrete tall kalibreres mot faktiske API-kostnader.
- **AI-leverandører.** Tekst: Anthropic Claude API. Bilde: Replicate (Flux).
  Krever API-nøkler (`ANTHROPIC_API_KEY`, `REPLICATE_API_TOKEN`) — må på
  plass før F3.5/F3.6.
- **Bildegenerering: med.** Selges som «forslag», ikke ferdig produkt.
- **Forhold til BrandStudio.** Dette overlapper kraftig med BrandStudio og
  «Your Marketing Friend». Anbefaling: bygg ÉN innholdsmotor (delte prompts
  og generering), ikke en tredje variant.
- **Bildegenerering.** Dyrt og treffer ikke alltid — selges som «forslag»,
  ikke ferdig produkt. Velg modell eksplisitt (Streamlit-appen feilet med
  «Missing required parameter: model»).
- **Crawler — juss.** Crawling av bedriftens EGEN nettside er greit. Crawl
  ikke konkurrenter/andre (TOS/jus). Begrenses til bedriftens egen side.

### Steg

| Steg | Beskrivelse | Status |
|------|-------------|--------|
| F3.1 | Markedsføringsprofil — hva bedriften selger, målgruppe, tone, budsjett, kanaler. Gjenbruk det bestilly alt vet (behandlinger, produkter, beskrivelse). | ✅ |
| F3.2 | Nettside-crawler — crawl bedriftens egen side, hent tekst/nøkkelord/tilbud. Robust URL-håndtering. | ✅ |
| F3.3 | SEO-generator — nøkkelord, meta-titler/-beskrivelser, innholdsråd. Knyttes mot onepage-SEO. | ✅ |
| F3.4 | Markedsanalyse — kanalprioritering (Facebook/Instagram/TikTok/Snapchat/YouTube), postefrekvens og -tidspunkt, budsjettstrategi (betalt vs. organisk). | ✅ |
| F3.5 | Innholdsgenerator (SoMe) — innlegg og bildetekster tilpasset HVER kanal og format. Kanaltilpasning er kjerneverdien. | ✅ |
| F3.6 | Bildegenerering — AI-bildeforslag til innleggene. | ✅ |
| F3.7 | Blogginnlegg-generator — genererer innlegg rett inn i blogg-funksjonen (Fase 2). | ⬜ |
| F3.8 | Publiseringsplan — kalender over hva som postes når, eksporterbar. | ✅ |
| F3.9 | Markedsføringshub — samlende admin-UI: profil, analyser, innhold og plan på ett sted. | ⬜ |
| F3.10 | Prismodell/kvote — implementer tillegget og forbrukskontroll. | ⬜ |

### Gjenbruk fra «Your Marketing Friend» (Streamlit-app)

- **Behold:** inntaksmodellen (budsjett, produkt, målgruppe, nettside,
  merkevare), output-strukturen (markedsanalyse, kanalprioritering,
  budsjettstrategi, postingplan, annonseblokker), eksport.
- **Forbedre:** kanaltilpasset tekst (ikke identisk på alle kanaler — appens
  største svakhet), robust URL-parsing, fungerende bildegenerering, sterkere
  og mindre generisk brand voice.
- **Ikke gjenbruk:** selve Streamlit-koden — hent kravene, bygg i
  bestilly-stacken (Next.js).

### Ærlig vurdering

Fase 3 er den **største** fasen — i praksis et eget produkt bygd inn i
bestilly. Forventningsstyring: dette tar tid, og bør tas steg for steg.
AI-kvalitet varierer — selg det som «utkast bedriften finpusser». Uten
kvote/prismodell kan API-regningen overstige inntekten per kunde, så
F3.10 er ikke valgfritt.

---

*Prinsipp: bygg steg for steg, hold hvert steg fullførbart, og avklar
kostnad/omfang før AI-stegene.*
