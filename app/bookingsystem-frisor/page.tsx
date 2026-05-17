import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NicheLanding } from "@/components/niche-landing";
import { getNiche } from "@/lib/niche-pages";

const niche = getNiche("bookingsystem-frisor");

export const metadata: Metadata = {
  title: niche?.metaTitle,
  description: niche?.metaDescription,
  alternates: { canonical: "/bookingsystem-frisor" },
  openGraph: {
    title: niche?.metaTitle,
    description: niche?.metaDescription,
    type: "website",
    locale: "nb_NO",
  },
};

export default function Page() {
  if (!niche) notFound();
  return <NicheLanding niche={niche} />;
}
