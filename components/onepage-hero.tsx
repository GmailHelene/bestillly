import type { Theme } from "@/lib/themes";

type HeroBusiness = {
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
};

function Contact({
  business,
  className,
}: {
  business: HeroBusiness;
  className?: string;
}) {
  if (!business.address && !business.phone) return null;
  return (
    <div
      className={`flex flex-wrap gap-x-4 gap-y-1 text-sm ${className ?? ""}`}
    >
      {business.address && <span>{business.address}</span>}
      {business.phone && <span>{business.phone}</span>}
    </div>
  );
}

export function OnepageHero({
  business,
  theme,
  tagline,
  logoUrl,
}: {
  business: HeroBusiness;
  theme: Theme;
  tagline?: string;
  logoUrl?: string;
}) {
  const logo = logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logoUrl} alt="" className="h-16 w-auto object-contain" />
  ) : null;

  const eyebrow = tagline ? (
    <p className="text-xs font-semibold uppercase tracking-widest">
      {tagline}
    </p>
  ) : null;

  const heading = (
    <h1
      className="text-4xl font-bold tracking-tight sm:text-5xl"
      style={{ fontFamily: theme.headingFont }}
    >
      {business.name}
    </h1>
  );

  if (theme.heroStyle === "gradient") {
    return (
      <header
        className={`${theme.radius} px-6 py-14 text-center text-white`}
        style={{ background: theme.heroGradient }}
      >
        {logo && <div className="mb-4 flex justify-center">{logo}</div>}
        {eyebrow && <div className="mb-2 text-white/70">{eyebrow}</div>}
        {heading}
        {business.description && (
          <p className="mx-auto mt-3 max-w-xl text-white/90">
            {business.description}
          </p>
        )}
        <Contact
          business={business}
          className="mt-5 justify-center text-white/80"
        />
      </header>
    );
  }

  if (theme.heroStyle === "band") {
    return (
      <header
        className={`${theme.radius} px-6 py-14 text-center`}
        style={{ background: theme.accentSoft }}
      >
        {logo && <div className="mb-4 flex justify-center">{logo}</div>}
        {eyebrow && (
          <div className="mb-2 opacity-70" style={{ color: theme.accent }}>
            {eyebrow}
          </div>
        )}
        <div style={{ color: theme.accent }}>{heading}</div>
        {business.description && (
          <p className="mx-auto mt-3 max-w-xl text-gray-700">
            {business.description}
          </p>
        )}
        <Contact
          business={business}
          className="mt-5 justify-center text-gray-600"
        />
      </header>
    );
  }

  return (
    <header className="space-y-3">
      {logo}
      {eyebrow && <div style={{ color: theme.accent }}>{eyebrow}</div>}
      <div
        className="h-1.5 w-12 rounded-full"
        style={{ background: theme.accent }}
      />
      <div style={{ color: theme.accent }}>{heading}</div>
      {business.description && (
        <p className="max-w-xl text-gray-600">{business.description}</p>
      )}
      <Contact business={business} className="text-gray-500" />
    </header>
  );
}
