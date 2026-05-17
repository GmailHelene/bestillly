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
}: {
  business: HeroBusiness;
  theme: Theme;
}) {
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
