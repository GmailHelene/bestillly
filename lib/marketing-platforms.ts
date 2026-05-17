// Kanalstrategier for markedsføringshuben — én kilde til sannhet for hvordan
// innhold skal tilpasses hver kanal. Brukt av markedsanalyse, innholdsgenerator
// og publiseringsplan (Fase 3). Adaptert og forenklet fra BrandStudio.

import type { MARKETING_CHANNELS } from "@/lib/marketing";

export type ChannelId = (typeof MARKETING_CHANNELS)[number]["id"];

export type ChannelStrategy = {
  id: ChannelId;
  name: string;
  // Kort om kanalen og publikummet.
  description: string;
  // Anbefalt publiseringsfrekvens i klartekst.
  frequency: string;
  // Optimale postetidspunkt (norsk tid).
  optimalTimes: string[];
  // Bildeformat (sideforhold) som passer best.
  imageAspectRatio: "1:1" | "9:16" | "16:9" | "4:5";
  pixelSize: string;
  // Ideell lengde på bildetekst/innlegg (tegn).
  captionLength: { min: number; ideal: number; max: number };
  // Antall hashtags som fungerer godt.
  hashtagCount: number;
  // Algoritme-vennlig praksis.
  tips: string[];
  // Ting som skader rekkevidde eller virker billig.
  avoid: string[];
  // Prioritet i markedsanalysen (1 = viktigst for små lokale bedrifter).
  priority: number;
};

export const CHANNEL_STRATEGIES: Record<ChannelId, ChannelStrategy> = {
  facebook: {
    id: "facebook",
    name: "Facebook",
    description:
      "Bredt og modent publikum. Treffer lokale kunder godt — ideelt for tilbud, nyheter og arrangementer.",
    frequency: "3–5 innlegg i uka",
    optimalTimes: ["Hverdager 11:00–15:00", "Onsdag 11:00–13:00"],
    imageAspectRatio: "1:1",
    pixelSize: "1080 × 1080 px",
    captionLength: { min: 40, ideal: 90, max: 5000 },
    hashtagCount: 2,
    tips: [
      "Korte innlegg med et spørsmål får mest engasjement",
      "Bilder og video lastet opp direkte gir mer rekkevidde enn delte lenker",
      "Svar raskt på kommentarer — det løfter innlegget",
      "Del åpningstider, tilbud og nyheter folk faktisk trenger",
    ],
    avoid: [
      "Klikkagn («Du vil ikke tro hva som skjedde»)",
      "For mange hashtags — 1–2 holder",
      "Bare delte lenker uten egen tekst",
    ],
    priority: 1,
  },
  instagram: {
    id: "instagram",
    name: "Instagram",
    description:
      "Veldig visuell kanal. Perfekt for før/etter-bilder, produktbilder og korte videoer (Reels).",
    frequency: "3–4 innlegg i uka + Stories",
    optimalTimes: ["Hverdager 09:00–11:00", "Hverdager 17:00–19:00"],
    imageAspectRatio: "4:5",
    pixelSize: "1080 × 1350 px",
    captionLength: { min: 50, ideal: 150, max: 2200 },
    hashtagCount: 5,
    tips: [
      "Bruk stående 4:5-format — det tar mest plass i feeden",
      "3–5 relevante hashtags, gjerne lokale (#vikersund)",
      "Reels (korte videoer) får størst rekkevidde nå",
      "Skriv en oppfordring i teksten — still et spørsmål",
    ],
    avoid: [
      "Hashtag-spam med 30 generiske emneknagger",
      "TikTok-vannmerke på videoene",
      "Uskarpe eller dårlig belyste bilder",
    ],
    priority: 2,
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    description:
      "Rask, engasjerende video. Når yngre publikum og kan gi stor rekkevidde uten annonsekroner.",
    frequency: "2–4 videoer i uka",
    optimalTimes: ["Hverdager 18:00–21:00", "Søndag 19:00–21:00"],
    imageAspectRatio: "9:16",
    pixelSize: "1080 × 1920 px",
    captionLength: { min: 30, ideal: 100, max: 2200 },
    hashtagCount: 3,
    tips: [
      "15–30 sekunder fungerer best",
      "De første 3 sekundene må stoppe scrollen",
      "Bruk lyd/musikk som er populær akkurat nå",
      "Vis ekte folk og ekte arbeid — autentisk slår polert",
    ],
    avoid: [
      "Vannmerke fra Instagram",
      "For lange, trege videoer",
      "Ren reklame uten underholdning eller nytte",
    ],
    priority: 3,
  },
  snapchat: {
    id: "snapchat",
    name: "Snapchat",
    description:
      "Rask og personlig. Bra for bak-kulissene, dagens tilbud og påminnelser til faste kunder.",
    frequency: "Noen ganger i uka, ujevnt",
    optimalTimes: ["Ettermiddag 15:00–18:00", "Helg"],
    imageAspectRatio: "9:16",
    pixelSize: "1080 × 1920 px",
    captionLength: { min: 10, ideal: 40, max: 250 },
    hashtagCount: 0,
    tips: [
      "Vertikal fullskjerm — 9:16",
      "Hold det uformelt og spontant",
      "Bra for dagens ledige timer og kjappe tilbud",
    ],
    avoid: ["Stivt, polert reklamespråk", "Gjenbruk av lange videoer"],
    priority: 4,
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    description:
      "Vertikale Shorts gir søkbarhet over tid. En video kan gi besøk i månedsvis.",
    frequency: "1–2 Shorts i uka",
    optimalTimes: ["Hverdager 16:00–20:00", "Helg formiddag"],
    imageAspectRatio: "9:16",
    pixelSize: "1080 × 1920 px",
    captionLength: { min: 30, ideal: 70, max: 150 },
    hashtagCount: 3,
    tips: [
      "Tittelen er det viktigste — bruk ord folk søker på",
      "60 sekunder eller mindre for Shorts",
      "Legg hashtags i tittel og beskrivelse",
    ],
    avoid: ["For lange videoer", "Vannmerker fra andre apper"],
    priority: 5,
  },
};

export function getChannelStrategy(id: ChannelId): ChannelStrategy {
  return CHANNEL_STRATEGIES[id];
}

// Kanaler sortert etter prioritet — brukes i markedsanalysen.
export function channelsByPriority(ids: string[]): ChannelStrategy[] {
  return ids
    .filter((id): id is ChannelId => id in CHANNEL_STRATEGIES)
    .map((id) => CHANNEL_STRATEGIES[id])
    .sort((a, b) => a.priority - b.priority);
}
