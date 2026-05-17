import Link from "next/link";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
    >
      <span aria-hidden>←</span>
      {label}
    </Link>
  );
}
