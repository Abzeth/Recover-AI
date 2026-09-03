import { Link } from "@tanstack/react-router";

export function Logo({ size = 34, withWord = true }: { size?: number; withWord?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
        <rect width="40" height="40" rx="10" fill="url(#logoBg)" />
        <path
          d="M11 27V13h8.2c3.4 0 5.8 2.1 5.8 5.1 0 2.3-1.4 4-3.6 4.7L26 27h-4.6l-4-3.8H14v3.8H11Zm3-6.3h5c1.9 0 3-1.1 3-2.6 0-1.5-1.1-2.6-3-2.6h-5v5.2Z"
          fill="#0d0b06"
        />
        <path d="M28 27l3-3" stroke="#0d0b06" strokeWidth="2.4" strokeLinecap="round" />
        <defs>
          <linearGradient id="logoBg" x1="0" y1="0" x2="40" y2="40">
            <stop stopColor="#f5e6b3" />
            <stop offset="0.55" stopColor="#c9a227" />
            <stop offset="1" stopColor="#7a6217" />
          </linearGradient>
        </defs>
      </svg>
      {withWord && (
        <span className="font-display text-lg font-semibold tracking-tight">
          Recover<span className="text-gold-gradient">AI</span>
        </span>
      )}
    </Link>
  );
}
