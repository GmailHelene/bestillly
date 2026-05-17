// bestilly-logo: en korall-merke med hake (= booket) + ordmerke.
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className ?? ""}`}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden
      >
        <rect width="32" height="32" rx="8" fill="#e07a5f" />
        <path
          d="M9 16.5l4.5 4.5L23 11"
          stroke="#ffffff"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-lg font-bold tracking-tight">bestilly</span>
    </span>
  );
}
