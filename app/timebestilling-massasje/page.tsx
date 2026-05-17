import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NicheLanding } from "@/components/niche-landing";
import { getNiche } from "@/lib/niche-pages";

const niche = getNiche("timebestilling-massasje");

export const metadata: Metadata = {
  title: niche?.metaTitle,
  description: niche?.metaDescription,
  alternates: { canonical: "/timebestilling-massasje" },
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
