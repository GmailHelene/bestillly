// Nisje-landingssider for SEO. Hver nisje har eget, tilpasset innhold —
// ikke tynt duplikat. Rendres av components/niche-landing.tsx.

export type NicheChallenge = { title: string; text: string };
export type NicheFaq = { q: string; a: string };

export type NichePage = {
  slug: string;
  image: string;
  eyebrow: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  heroText: string;
  introHeading: string;
  introParagraphs: string[];
  challengesHeading: string;
  challenges: NicheChallenge[];
  faq: NicheFaq[];
};

export const NICHE_PAGES: NichePage[] = [
  {
    slug: "bookingsystem-frisor",
    image: "/bilder/frisor.webp",
    eyebrow: "Bookingsystem for frisører",
    h1: "Bookingsystem laget for frisører",
    metaTitle: "Bookingsystem for frisører — kundene booker selv | bestilly",
    metaDescription:
      "Bookingsystem for frisørsalonger og frisører. La kundene bestille time selv, døgnet rundt. Egen nettside inkludert — 2490 kr i året.",
    heroText:
      "Slipp telefonen som ringer midt i en klipp. Med bestilly booker kundene time selv — du får ro til å gjøre jobben, og kalenderen fyller seg av seg selv.",
    introHeading: "Mer tid til kundene, mindre tid på telefonen",
    introParagraphs: [
      "Som frisør lever du av tiden i stolen. Hver gang telefonen ringer med et «har du ledig time?», stopper du opp — og kunden foran deg merker det. Et bookingsystem lar kundene se kalenderen din og bestille selv, så du kan konsentrere deg om håndverket.",
      "Med bestilly legger du inn behandlingene dine — klipp, farge, striper, styling — med varighet og pris. Kundene velger behandling, ser ledige tider og booker. Du og kunden får bekreftelse på e-post, og kunden kan avbestille selv hvis noe skjer.",
    ],
    challengesHeading: "Dette løser bestilly for frisører",
    challenges: [
      {
        title: "Telefonen midt i jobben",
        text: "Kundene booker selv på nett — du slipper å avbryte klippet for å svare.",
      },
      {
        title: "Dobbeltbookinger",
        text: "Kalenderen viser alltid riktig ledig tid. Ingen krasj, ingen pinlige oppringninger.",
      },
      {
        title: "Ujevn kalender",
        text: "Vis fram ledige tider, så fyller du hull tidlig i uka i stedet for stille perioder.",
      },
      {
        title: "Glemte avtaler",
        text: "Automatisk bekreftelse på e-post gjør at færre kunder glemmer timen sin.",
      },
    ],
    faq: [
      {
        q: "Kan jeg legge inn ulike behandlinger med ulik varighet?",
        a: "Ja. Du legger inn hver behandling — klipp, farge, striper, styling — med egen varighet og pris. Systemet regner ut ledige tider automatisk ut fra varigheten.",
      },
      {
        q: "Hva koster bookingsystemet for en frisør?",
        a: "2490 kr i året, alt inkludert. Ingen oppstartsavgift, ingen månedspris og ingen gebyr per booking.",
      },
      {
        q: "Passer det for en frisør som jobber alene?",
        a: "Ja, bestilly er laget nettopp for små salonger og frisører som driver alene. Du trenger ingen ansatte eller IT-kunnskap.",
      },
      {
        q: "Kan kundene avbestille selv?",
        a: "Ja. Kunden får en lenke i bekreftelsen og kan avbestille med ett klikk, så tiden frigjøres til andre.",
      },
      {
        q: "Kan jeg stenge for ferie og fridager?",
        a: "Ja. Du setter åpningstider per ukedag og legger inn ferieavvik, så kundene bare ser tider du faktisk er tilgjengelig.",
      },
    ],
  },
  {
    slug: "bookingsystem-neglsalong",
    image: "/bilder/neglesalong.webp",
    eyebrow: "Bookingsystem for negl- og skjønnhetssalong",
    h1: "Bookingsystem for neglsalong og skjønnhetssalong",
    metaTitle: "Bookingsystem for neglsalong & skjønnhetssalong | bestilly",
    metaDescription:
      "Bookingsystem for neglsalonger og skjønnhetssalonger. Kundene booker behandlinger selv, du får full oversikt. Egen nettside inkludert — 2490 kr/år.",
    heroText:
      "Negl, vipper, bryn eller hudpleie — la kundene bestille behandlingen sin selv, mens du jobber uforstyrret.",
    introHeading: "Fyll kalenderen uten å svare på meldinger hele dagen",
    introParagraphs: [
      "Negl- og skjønnhetssalonger lever av et jevnt sig av bookinger. Men mye av tiden går til å svare på meldinger om ledige tider — ofte mens du står midt i en behandling. Et bookingsystem gir kundene svaret selv.",
      "I bestilly viser du fram behandlingene dine med bilde, varighet og pris. Kunden velger, ser ledige tider og booker. Du får en ryddig kalender, og kundene en proff opplevelse — uten at du må løfte en finger.",
    ],
    challengesHeading: "Dette løser bestilly for skjønnhetssalonger",
    challenges: [
      {
        title: "Meldinger i alle kanaler",
        text: "Samle bookingene ett sted — slutt å jakte avtaler i DM, SMS og kommentarfelt.",
      },
      {
        title: "Vise fram behandlingene",
        text: "Hver behandling får bilde, beskrivelse og pris, så kunden vet hva hun bestiller.",
      },
      {
        title: "Selge produkter",
        text: "Innebygd nettbutikk — selg negl- eller hudpleieprodukter med betaling via Vipps.",
      },
      {
        title: "Nye kunder tør å booke",
        text: "En pen, oversiktlig nettside gjør at nye kunder bestiller sin første time.",
      },
    ],
    faq: [
      {
        q: "Kan jeg vise fram behandlingene med bilder?",
        a: "Ja. Hver behandling kan ha bilde, beskrivelse, varighet og pris, og du kan bygge et bildegalleri på siden din.",
      },
      {
        q: "Hva koster bookingsystemet?",
        a: "2490 kr i året, alt inkludert. Ingen oppstartsavgift, ingen månedspris og ingen gebyr per booking.",
      },
      {
        q: "Kan jeg selge produkter i tillegg til behandlinger?",
        a: "Ja. bestilly har en innebygd nettbutikk der kundene kan kjøpe produkter og betale med Vipps.",
      },
      {
        q: "Kan kundene booke utenom åpningstid?",
        a: "Kundene kan booke når som helst på døgnet — de ser bare ledige tider innenfor åpningstidene du har satt opp.",
      },
      {
        q: "Trenger jeg en egen nettside fra før?",
        a: "Nei. En pen nettside for salongen følger med, og du velger design selv.",
      },
    ],
  },
  {
    slug: "timebestilling-massasje",
    image: "/bilder/hudpleie.webp",
    eyebrow: "Timebestilling for massasje og terapi",
    h1: "Timebestilling for massasje og terapeuter",
    metaTitle: "Timebestilling for massasje & terapeut | bestilly",
    metaDescription:
      "Enkelt timebestillingssystem for massører og terapeuter. Klientene booker behandling selv, du får ro til å jobbe. Egen nettside — 2490 kr i året.",
    heroText:
      "Gi klientene en rolig, enkel måte å finne ledig time på — så kan du konsentrere deg fullt om behandlingen.",
    introHeading: "Ro i timeboka — for deg og klientene",
    introParagraphs: [
      "Som massør eller terapeut trenger du å være til stede i behandlingen, ikke ved telefonen. Et timebestillingssystem lar klientene finne og booke ledig tid selv, så du beholder roen og flyten i arbeidsdagen.",
      "Med bestilly legger du inn behandlingene dine med varighet og pris. Klienten booker, og begge får bekreftelse på e-post. Du styrer åpningstider og pauser selv, så kalenderen aldri blir overfylt.",
    ],
    challengesHeading: "Dette løser bestilly for massører og terapeuter",
    challenges: [
      {
        title: "Avbrutt under behandling",
        text: "Klientene booker på nett — du slipper å ta telefonen midt i en behandling.",
      },
      {
        title: "Pauser mellom klienter",
        text: "Sett varighet per behandling, så systemet legger inn nok tid og du får pusterom.",
      },
      {
        title: "Seriøst førsteinntrykk",
        text: "En ryddig nettside og enkel booking bygger tillit hos nye klienter.",
      },
      {
        title: "Færre glemte timer",
        text: "Automatisk bekreftelse og enkel avbestilling gir færre no-shows.",
      },
    ],
    faq: [
      {
        q: "Kan jeg sette ulik lengde på behandlingene?",
        a: "Ja. Hver behandling får sin egen varighet, og systemet regner ut ledige tider ut fra det — så du alltid har nok tid.",
      },
      {
        q: "Hva koster timebestillingssystemet?",
        a: "2490 kr i året, alt inkludert. Ingen oppstartsavgift, ingen månedspris og ingen gebyr per booking.",
      },
      {
        q: "Passer det for en terapeut som jobber alene?",
        a: "Ja. bestilly er laget for små bedrifter og enkeltpersonforetak — du trenger ingen ansatte eller IT-kunnskap.",
      },
      {
        q: "Får klienten bekreftelse på timen?",
        a: "Ja. Både du og klienten får bekreftelse på e-post, og klienten kan avbestille med ett klikk ved behov.",
      },
      {
        q: "Kan jeg styre når på dagen jeg tar imot?",
        a: "Ja. Du setter åpningstider per ukedag og legger inn fridager og ferie selv.",
      },
    ],
  },
];

export function getNiche(slug: string): NichePage | undefined {
  return NICHE_PAGES.find((n) => n.slug === slug);
}
