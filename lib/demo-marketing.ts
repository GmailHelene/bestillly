// Eksempeldata for markedsføringshuben i demomodus. Demo-bedriften får en
// ferdig utfylt markedsføringsprofil, og AI-handlingene returnerer dette
// eksempelinnholdet i stedet for å kalle (og betale for) ekte AI.

import type { MarketingProfile } from "@/lib/marketing";
import type { GeneratedPost } from "@/lib/marketing-content";
import type { GeneratedBlogPost } from "@/lib/marketing-blog";
import type { PostingPlan } from "@/lib/marketing-plan";
import { CHANNEL_STRATEGIES, type ChannelId } from "@/lib/marketing-platforms";

function isoDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function nextMonday(): string {
  const d = new Date();
  const day = d.getDay();
  let diff = (1 - day + 7) % 7;
  if (diff === 0) diff = 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

const WEEKDAYS = [
  "søndag",
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
];

// Bygger publiseringsplanen med ferske datoer fra førstkommende mandag.
function buildDemoPlan(): PostingPlan {
  const start = nextMonday();
  const items = [
    {
      offset: 0,
      time: "12:00",
      channelId: "facebook",
      postType: "Innlegg",
      theme: "Ledige timer denne uka",
      caption:
        "Ny uke, nye muligheter for en frisk look! Vi har noen ledige timer igjen denne uka — book enkelt på nett.",
      hashtags: ["vikersund", "frisør"],
    },
    {
      offset: 1,
      time: "10:00",
      channelId: "instagram",
      postType: "Reel",
      theme: "Før og etter – farging",
      caption:
        "Liten forvandling, stor forskjell ✨ Sveip for å se før og etter.",
      hashtags: ["hårfarge", "vikersund", "frisørsalong"],
    },
    {
      offset: 2,
      time: "18:30",
      channelId: "tiktok",
      postType: "Kort video",
      theme: "Stylingtips på 20 sekunder",
      caption: "Slik får du volum som varer hele dagen — tre raske triks.",
      hashtags: ["hårtips", "styling"],
    },
    {
      offset: 3,
      time: "13:00",
      channelId: "facebook",
      postType: "Innlegg",
      theme: "Produkt: hårpleiesett",
      caption:
        "Favoritten vår til daglig pleie — nå i nettbutikken. Samme produkter som vi bruker i salongen.",
      hashtags: ["hårpleie"],
    },
    {
      offset: 4,
      time: "17:00",
      channelId: "instagram",
      postType: "Story",
      theme: "Helgehilsen",
      caption: "God helg fra oss! Vi er tilbake mandag — book gjerne time.",
      hashtags: ["vikersund"],
    },
  ];

  return {
    periodWeeks: 1,
    startDate: start,
    summary:
      "En rolig, gjennomførbar uke med fem innlegg fordelt på Facebook, Instagram og TikTok. Tyngdepunktet ligger på Facebook og Instagram, der de lokale kundene dine er mest aktive.",
    items: items.map((it) => {
      const date = isoDate(
        // antall dager fra i dag til mandag + offset
        Math.round(
          (new Date(start + "T00:00:00Z").getTime() -
            new Date(isoDate(0) + "T00:00:00Z").getTime()) /
            86_400_000,
        ) + it.offset,
      );
      const weekday = WEEKDAYS[new Date(date + "T00:00:00Z").getUTCDay()];
      const strategy = CHANNEL_STRATEGIES[it.channelId as ChannelId];
      return {
        date,
        weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
        time: it.time,
        channelId: it.channelId,
        channelName: strategy.name,
        postType: it.postType,
        theme: it.theme,
        caption: it.caption,
        hashtags: it.hashtags,
      };
    }),
    generatedAt: new Date().toISOString(),
  };
}

// Hele markedsføringsprofilen til demo-bedriften — ferdig utfylt.
export function buildDemoMarketingProfile(): MarketingProfile {
  const now = new Date().toISOString();
  return {
    audience:
      "Kvinner 25–55 i Vikersund og omegn som er opptatt av velstelt hår og litt egentid.",
    tone: "Vennlig, varm og uformell",
    budgetNok: 12000,
    websiteUrl: "https://demo-frisor.no",
    channels: ["facebook", "instagram", "tiktok"],
    websiteCrawl: {
      url: "https://demo-frisor.no",
      title: "Demo Frisør & Velvære — frisør i Vikersund",
      description:
        "Frisørsalong i Vikersund. Klipp, farging og vippeforlengelse. Book time på nett.",
      text: "Demo Frisør & Velvære er en koselig frisørsalong midt i Vikersund. Vi tilbyr klipp, farging, vippeforlengelse og styling før fest. Hos oss tar vi oss tid til hver enkelt kunde. Velkommen innom for drop-in, eller book time på nett døgnet rundt.",
      keywords: [
        "frisør",
        "vikersund",
        "klipp",
        "farging",
        "vippeforlengelse",
        "styling",
      ],
      pagesCrawled: 3,
      crawledAt: now,
    },
    seo: {
      keywords: [
        "frisør vikersund",
        "frisørsalong vikersund",
        "klipp vikersund",
        "hårfarge vikersund",
        "vippeforlengelse vikersund",
        "time hos frisør",
        "frisør modum",
        "styling før fest",
      ],
      metaTitle: "Frisør i Vikersund — klipp, farging & vipper | Demo Frisør",
      metaDescription:
        "Frisørsalong i Vikersund. Klipp, farging, vippeforlengelse og festsstyling. Book time på nett døgnet rundt — velkommen innom!",
      contentTips: [
        "Skriv stedsnavnet «Vikersund» i overskrift og brødtekst — lokale søk er gull verdt.",
        "Lag en egen side eller seksjon per hovedbehandling (klipp, farging, vipper).",
        "Legg ut før/etter-bilder med beskrivende alt-tekst.",
        "Be fornøyde kunder om en Google-anmeldelse — det løfter lokal synlighet.",
        "Hold åpningstidene oppdatert både her og på Google-bedriftsprofilen.",
      ],
      summary:
        "Demo Frisør har en tydelig lokal profil. De viktigste grepene er å bruke «Vikersund» konsekvent i tekstene, samle Google-anmeldelser og vise fram arbeidet med bilder.",
      generatedAt: now,
    },
    analysis: {
      summary:
        "For en lokal frisørsalong er Facebook og Instagram de viktigste kanalene. TikTok kan gi god ekstra rekkevidde uten kostnad hvis du har tid til korte videoer. Hold trykket jevnt heller enn å poste mye i rykk og napp.",
      channels: [
        {
          channelId: "facebook",
          name: "Facebook",
          priority: 1,
          rationale:
            "De fleste lokale kundene dine i Vikersund-området er på Facebook. Ideelt for ledige timer, tilbud og nyheter.",
          recommendedFrequency: "3–4 innlegg i uka",
          bestTimes: ["Hverdager 11:00–15:00"],
        },
        {
          channelId: "instagram",
          name: "Instagram",
          priority: 2,
          rationale:
            "Frisørfaget er visuelt — før/etter-bilder og Reels viser fram håndverket og bygger tillit.",
          recommendedFrequency: "3 innlegg i uka + Stories",
          bestTimes: ["Hverdager 09:00–11:00", "Hverdager 17:00–19:00"],
        },
        {
          channelId: "tiktok",
          name: "TikTok",
          priority: 3,
          rationale:
            "Korte stylingvideoer kan nå nye kunder gratis. Prioriter dette kun når du har overskudd.",
          recommendedFrequency: "1–2 videoer i uka",
          bestTimes: ["Hverdager 18:00–21:00"],
        },
      ],
      budgetStrategy:
        "Med 12 000 kr i året anbefaler vi å bruke det meste organisk (gratis innhold), og sette av rundt 3 000–4 000 kr til å løfte de beste Facebook-innleggene rundt høytider og kampanjer.",
      organicVsPaid:
        "Legg hovedvekten på organisk innhold. Betalt annonsering brukes punktvis — til å nå litt lenger med et tilbud som allerede fungerer.",
      quickWins: [
        "Legg ut «ledige timer denne uka» hver mandag.",
        "Be de tre neste fornøyde kundene om en Google-anmeldelse.",
        "Ta et før/etter-bilde på neste farging og del det.",
        "Fyll ut og oppdater Google-bedriftsprofilen.",
      ],
      generatedAt: now,
    },
    postingPlan: buildDemoPlan(),
  };
}

// Eksempel-innlegg per kanal — brukes av innholdsgeneratoren i demo.
const DEMO_POSTS: Record<ChannelId, Omit<GeneratedPost, "channelName" | "pixelSize">> = {
  facebook: {
    channelId: "facebook",
    postType: "Innlegg",
    title: "",
    caption:
      "Ny uke, ny mulighet for litt egentid 💆‍♀️ Vi har noen ledige timer igjen denne uka — til klipp, farge eller vipper. Book enkelt på nett, så er stolen klar til deg!",
    hashtags: ["vikersund", "frisør"],
    callToAction: "Trykk «Book time» og finn en tid som passer deg.",
    linkSuggestion: "Lenk til bookingsiden din.",
    goal: "Fylle ledige timer tidlig i uka.",
    imageIdea:
      "Lyst, innbydende bilde fra salongen — en stol klar til kunde.",
    imagePrompt:
      "Cozy bright hair salon interior, empty styling chair, soft natural light, welcoming atmosphere, warm tones",
    bestTime: "Mandag kl. 12:00",
    tips: [
      "Still et lite spørsmål i teksten for å få kommentarer.",
      "Svar raskt på alle som kommenterer.",
    ],
  },
  instagram: {
    channelId: "instagram",
    postType: "Reel",
    title: "",
    caption:
      "Fra mørkt til solkysset ☀️ En av ukens favorittforvandlinger. Sveip for å se før og etter — og book din egen time hos oss i Vikersund!",
    hashtags: ["hårfarge", "vikersund", "frisørsalong", "beforeafter"],
    callToAction: "Book time via lenken i profilen.",
    linkSuggestion: "Lenk til bookingsiden i profilen.",
    goal: "Vise fram håndverket og bygge tillit.",
    imageIdea: "Før/etter-bilde av en farging, side om side.",
    imagePrompt:
      "Before and after hair color transformation, dark to sun-kissed blonde, professional salon photography, bright and clean",
    bestTime: "Tirsdag kl. 10:00",
    tips: [
      "Bruk et populært lydspor på Reel-en.",
      "Legg hashtags i første kommentar, ikke i teksten.",
    ],
  },
  tiktok: {
    channelId: "tiktok",
    postType: "Kort video",
    title: "",
    caption:
      "Tre raske triks for volum som varer hele dagen 💁‍♀️ Hvilket prøver du først?",
    hashtags: ["hårtips", "styling", "frisør"],
    callToAction: "Følg for flere hårtips — og book time hos oss!",
    linkSuggestion: "Legg bookinglenken i profilen.",
    goal: "Nå nye kunder med nyttig, delbart innhold.",
    imageIdea: "Kort video der du viser stylingtriksene steg for steg.",
    imagePrompt:
      "Hairstylist demonstrating volumizing technique, vertical video still, dynamic and friendly, salon setting",
    bestTime: "Onsdag kl. 18:30",
    tips: [
      "De første 3 sekundene må fange oppmerksomheten.",
      "Hold videoen på 15–30 sekunder.",
    ],
  },
  snapchat: {
    channelId: "snapchat",
    postType: "Bilde/Video",
    title: "",
    caption: "Dagens ledige tider! Stikk innom eller book på nett 💇‍♀️",
    hashtags: [],
    callToAction: "Send oss en melding for å booke.",
    linkSuggestion: "Del bookinglenken direkte.",
    goal: "Minne faste kunder på ledige tider i dag.",
    imageIdea: "Spontant bilde fra salongen akkurat nå.",
    imagePrompt:
      "Casual behind-the-scenes photo in a hair salon, vertical format, authentic and warm",
    bestTime: "Torsdag kl. 15:00",
    tips: ["Hold det uformelt og spontant — det passer Snapchat."],
  },
  youtube: {
    channelId: "youtube",
    postType: "Short",
    title: "Slik holder du hårfargen lenger",
    caption:
      "Fem enkle grep som får fargen til å vare. Spar dette til neste gang du farger håret!",
    hashtags: ["hårtips", "hårfarge"],
    callToAction: "Abonner for flere tips — og book time hos oss i Vikersund.",
    linkSuggestion: "Legg bookinglenken i videobeskrivelsen.",
    goal: "Bli synlig i søk over tid med nyttig innhold.",
    imageIdea: "Kort, vertikal video der du forklarer tipsene.",
    imagePrompt:
      "Hairstylist giving hair color care tips, vertical video still, bright studio, friendly expression",
    bestTime: "Fredag kl. 17:00",
    tips: ["Bruk søkeord folk faktisk skriver, i tittelen."],
  },
};

export function demoContentPosts(channelIds: string[]): GeneratedPost[] {
  return channelIds
    .filter((id): id is ChannelId => id in CHANNEL_STRATEGIES)
    .map((id) => {
      const strategy = CHANNEL_STRATEGIES[id];
      return {
        ...DEMO_POSTS[id],
        channelName: strategy.name,
        pixelSize: strategy.pixelSize,
      };
    });
}

export const DEMO_BLOG_POST: GeneratedBlogPost = {
  title: "Slik forbereder du håret til sommeren",
  metaDescription:
    "Sol, salt og klor sliter på håret. Her er frisørens beste tips for å holde håret friskt gjennom sommeren — fra Demo Frisør i Vikersund.",
  content:
    "Sommeren er herlig for oss — men ganske tøff for håret. Sol, salt og klor tørker ut og kan gjøre fargen matt. Den gode nyheten er at noen enkle vaner gjør stor forskjell.\n\nBeskytt mot sol\nAkkurat som huden trenger hår beskyttelse mot UV. Bruk en leave-in-balsam med solfilter, eller ta på deg en hatt på de varmeste dagene. Det bevarer både glans og farge.\n\nSkyll etter bading\nSalt og klor legger seg i håret og tørker det ut. Skyll alltid med ferskvann så raskt du kan etter bading — det enkleste trikset som finnes.\n\nKlipp før ferien\nEn frisk klipp før ferien fjerner tørre tupper, så håret tåler sommeren bedre. Det er også et godt tidspunkt for en pleiebehandling.\n\nVil du gi håret en god start på sommeren? Book en time hos oss i Vikersund — vi finner det som passer akkurat ditt hår. Velkommen innom!",
};

export const DEMO_SNIPPETS: Record<string, string[]> = {
  about: [
    "Demo Frisør & Velvære er en koselig salong midt i Vikersund. Vi tar oss tid til hver enkelt kunde, og målet vårt er enkelt: at du går herfra med et smil og hår du er glad i. Velkommen innom!",
    "Hos Demo Frisør & Velvære møter du erfarne frisører i hjertet av Vikersund. Vi tilbyr alt fra klipp og farging til vippeforlengelse — alltid med god tid og personlig oppfølging.",
    "Midt i Vikersund finner du Demo Frisør & Velvære. En liten, varm salong der du blir sett og hørt — enten du vil ha en frisk klipp, ny farge eller litt egentid før en stor anledning.",
  ],
  hero: [
    "Velstelt hår og litt egentid — midt i Vikersund.",
    "Frisør i Vikersund. Book time på nett, døgnet rundt.",
    "Klipp, farge og velvære — i trygge hender hos Demo Frisør.",
  ],
};

export function demoSnippets(snippetTypeId: string): string[] {
  return (
    DEMO_SNIPPETS[snippetTypeId] ?? [
      "Eksempeltekst 1 — slik kan en ferdig SEO-tekst se ut for bedriften din.",
      "Eksempeltekst 2 — med egen konto tilpasses tekstene din bedrift og dine søkeord.",
      "Eksempeltekst 3 — du får tre varianter hver gang, og velger den du liker best.",
    ]
  );
}

// Demo-bilde — et stabilt eksempelbilde (ingen ekte AI-generering i demo).
export function demoImageUrl(channelId: string): string {
  return `https://picsum.photos/seed/bestilly-${channelId}/1080/1350`;
}
