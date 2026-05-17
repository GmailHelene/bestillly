type Social = {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
};

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.9.3-1.6 1.6-1.6h1.7V4.2c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.4V14h2.2v8h3.9z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M16.2 3h-2.9v12.3a2.5 2.5 0 1 1-2.1-2.5V9.8a5.5 5.5 0 1 0 5 5.5V8.9a6.7 6.7 0 0 0 3.8 1.2V7.2a3.9 3.9 0 0 1-3.8-4.2z" />
    </svg>
  );
}

export function SocialLinks({ social }: { social: Social }) {
  const items = [
    { url: social.instagram, label: "Instagram", Icon: InstagramIcon },
    { url: social.facebook, label: "Facebook", Icon: FacebookIcon },
    { url: social.tiktok, label: "TikTok", Icon: TikTokIcon },
  ].filter((item) => item.url);

  if (items.length === 0) return null;

  return (
    <div className="flex gap-3">
      {items.map(({ url, label, Icon }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900"
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}
