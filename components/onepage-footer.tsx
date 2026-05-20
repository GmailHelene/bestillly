import { SocialLinks } from "@/components/social-links";

type FooterBusiness = {
  name: string;
  address: string | null;
  phone: string | null;
};

export function OnepageFooter({
  business,
  social,
  orgNumber,
  note,
}: {
  business: FooterBusiness;
  social: { instagram?: string; facebook?: string; tiktok?: string };
  orgNumber?: string;
  note?: string;
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="flex flex-col items-center space-y-5 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
      <div className="space-y-1">
        <p className="font-medium text-gray-900">{business.name}</p>
        {business.address && <p>{business.address}</p>}
        {business.phone && <p>{business.phone}</p>}
        {orgNumber && <p>Org.nr {orgNumber}</p>}
      </div>
      <SocialLinks social={social} />
      {note && (
        <p className="max-w-xl whitespace-pre-line">{note}</p>
      )}
      <p className="text-xs text-gray-400">
        © {year} {business.name} · Drevet av{" "}
        <a href="/" className="underline">
          Bestilly
        </a>{" "}
        ·{" "}
        <a href="/personvern" className="underline">
          Personvern
        </a>
      </p>
    </footer>
  );
}
