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
    <footer className="space-y-5 border-t border-gray-200 pt-8 text-sm text-gray-500">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="font-medium text-gray-900">{business.name}</p>
          {business.address && <p>{business.address}</p>}
          {business.phone && <p>{business.phone}</p>}
          {orgNumber && <p>Org.nr {orgNumber}</p>}
        </div>
        <SocialLinks social={social} />
      </div>
      {note && <p className="max-w-xl whitespace-pre-line">{note}</p>}
      <p className="text-xs text-gray-400">
        © {year} {business.name}
      </p>
    </footer>
  );
}
