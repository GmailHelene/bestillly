# Fremdriftsplan — bestilly

Enkelt og rimelig bookingsystem for små bedrifter (salonger, frisører o.l.).
Forretningsmodell: **990 kr/år per bedrift**, manuell årsfaktura. Multi-tenant.

**Status pr. 2026-05-22:** Steg 1–5 ferdig. Neste: steg 6.

---

## Status-oversikt

| Steg | Beskrivelse | Status |
|------|-------------|--------|
| 1 | Repo + teknisk skjelett | ✅ Ferdig |
| 2 | Registrering, innlogging, admin-skjelett | ✅ Ferdig |
| 3 | Behandlinger (CRUD) | ✅ Ferdig |
| 4 | Åpningstider (ukerytme + ferieavvik) | ✅ Ferdig |
| 5 | Offentlig onepage + ledighetskalender | ✅ Ferdig |
| 6 | Booking-flyt + e-postvarsling | ⬜ Neste |
| 7 | Avbestilling via lenke | ⬜ |
| 8 | Onepage-redigering + SEO | ⬜ |
| 9 | Salgsside + demo | ⬜ |
| 10 | Lansering (deploy + domene) | ⬜ |

---

## Fase 1 — MVP

### Steg 1 — Repo + teknisk skjelett ✅
- [x] Next.js 16 + TypeScript + Tailwind
- [x] Neon Postgres + Drizzle ORM
- [x] Databaseskjema (6 tabeller)
- [x] Auth.js, Resend, bcrypt installert
- [x] `.env`-oppsett

### Steg 2 — Registrering, innlogging, admin ✅
- [x] Auth.js med passord-innlogging
- [x] Registrering oppretter bedrift + bruker
- [x] Tilgangsbeskyttet `/admin`
- [x] Innlogging / utlogging

### Steg 3 — Behandlinger ✅
- [x] Opprett / rediger / slett behandling
- [x] Navn, beskrivelse, varighet, pris
- [x] Scopet til innlogget bedrift

### Steg 4 — Åpningstider ✅
- [x] Fast ukerytme (mandag–søndag, fra/til-klokkeslett)
- [x] Ferieavvik / stengte dager / egne tider for enkeltdatoer
- [x] Admin-side for å legge inn og endre dette
- [x] Håndtere tidssone (Europe/Oslo) konsekvent

### Steg 5 — Offentlig onepage + ledighetskalender ✅
- [x] Offentlig side per bedrift på `bestilly.no/[slug]`
- [x] Kalender som viser ledige dager/tider
- [x] Ledige tider beregnes: åpningstid − bookinger, delt i behandlingslengder
- [x] Velg behandling → se ledige tider
- [x] Mobilvennlig visning

### Steg 6 — Booking-flyt + e-postvarsling ⬜
- [ ] Kunde booker (navn, e-post, telefon)
- [ ] Vern mot dobbeltbooking (DB-transaksjon)
- [ ] Bekreftelses-e-post til kunde
- [ ] Varsel-e-post til bedrift
- [ ] Resend: verifisere avsenderdomene
- [ ] Bookingoversikt i admin (kommende / tidligere)

### Steg 7 — Avbestilling ⬜
- [ ] Avbestillingslenke med token i bekreftelses-e-post
- [ ] Kunde kan avbestille uten innlogging
- [ ] E-post til begge parter ved avbestilling
- [ ] Bedrift kan avbestille fra admin
- [ ] Evt. avbestillingsfrist

### Steg 8 — Onepage-redigering + SEO ⬜
- [ ] Bedrift redigerer onepage (tekst, bilder, malvalg)
- [ ] Auto-SEO: title, meta-description, overskrifter
- [ ] `LocalBusiness` JSON-LD strukturert data
- [ ] Automatisk `sitemap.xml` + `robots.txt`
- [ ] SEO-onboarding-sjekkliste i admin
- [ ] Guide til Google Business Profile

### Steg 9 — Salgsside + demo ⬜
- [ ] Salgsside på rot-domenet (tillitsbyggende, målgrupperettet)
- [ ] SEO-optimalisert salgsside
- [ ] Demo-bedrift som besøkende kan klikke seg rundt i
- [ ] Tydelig pris (990 kr/år) og «kom i gang»

### Steg 10 — Lansering ⬜
- [ ] Deploy til Railway
- [ ] Miljøvariabler satt i produksjon
- [ ] Domenet `bestilly.no` koblet til
- [ ] Faktureringsrutine klar (Fiken/Conta — manuell årsfaktura)
- [ ] Test hele flyten i produksjon

---

## Tverrgående — lett å glemme

- [ ] **Tidssoner** — alt lagres i UTC, vises i norsk tid
- [ ] **GDPR / personvern** — personvernerklæring, lagring av kundedata, samtykke
- [ ] **Vilkår** for bedriftene som bruker tjenesten
- [ ] **Validering** av all bruker-input (skjema, e-post)
- [ ] **Feilhåndtering** — vennlige feilmeldinger, ikke tekniske
- [ ] **Mobilvennlig** — testes på telefon, ikke bare desktop
- [ ] **Tilgjengelighet (uu)** — kontrast, tastaturnavigasjon, labels
- [ ] **E-postlevering** — at e-post ikke havner i spam
- [ ] **Sikkerhetskopi** — Neon har backup, men verifiser
- [ ] **Onboarding** — at en ny bedrift forstår hva den skal gjøre først

---

## Senere faser (ikke nå)

**Fase 2 — Contentbuilder-tillegg**
AI-innholdsforslag, bildegenerering, råd om sosiale medier. Gjenbruker
BrandStudio-motoren. Egen prismodell (tillegg/kvote) siden AI koster per bruk.

**Fase 3 — Nettbutikk + betaling**
Enkel nettbutikk for bedriftens egne varer, med kundebetaling.

**Planlagt senere:** Nyhetsbrev-funksjon for bedriftene.

---

*Prinsipp: hold MVP-en liten og fullførbar. Nye ideer noteres som senere
faser — de skal ikke utvide fase 1.*
