import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Playfair_Display,
  Poppins,
  Fraunces,
  Cormorant_Garamond,
} from "next/font/google";
import { CookieNotice } from "@/components/cookie-notice";
import { Plausible } from "@/components/plausible";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Brukes av onepage-temaene (Eleganse / Pulse).
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

// Profesjonelle overskriftsfonter for onepage-temaene.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const siteTitle = "Bestilly, bookingsystem for enkeltpersonforetak";
const siteDescription =
  "Bookingsystem laget for enkeltpersonforetak: booking, kalender, regnskapseksport og markedsføringsverktøy. Time inn, kvittering ut, ferdig regnskapsgrunnlag, 149 kr per måned, alt inkludert.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
  ),
  title: siteTitle,
  description: siteDescription,
  alternates: { canonical: "/" },
  // openGraph- og twitter-bilder samt favicon kommer fra
  // app/opengraph-image.tsx og app/icon.tsx (Next.js fil-konvensjon).
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    locale: "nb_NO",
    siteName: "Bestilly",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nb"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${poppins.variable} ${fraunces.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <CookieNotice />
        <Plausible />
      </body>
    </html>
  );
}
