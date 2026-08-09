/*
 * AI WARS wordmark. Reads "A-WARS" where the W's first stroke is a thick
 * blue vertical bar that doubles as the "I" of "AI".
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 120"
      role="img"
      aria-label="AI WARS"
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id="aiwars-i" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6fd3ff" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      {/* A */}
      <path
        d="M9 110 L45 14 L81 110"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinejoin="bevel"
      />
      <path d="M22 78 L68 78" stroke="currentColor" strokeWidth="14" />
      {/* I — thick slanted blue bar, doubles as the W's first stroke */}
      <path d="M112 10 L124 110" stroke="url(#aiwars-i)" strokeWidth="26" />
      {/* W — remaining strokes */}
      <path
        d="M136 102 L160 40 L184 102 L212 14"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinejoin="bevel"
      />
      {/* A */}
      <path
        d="M237 110 L273 14 L309 110"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinejoin="bevel"
      />
      <path d="M250 78 L296 78" stroke="currentColor" strokeWidth="14" />
      {/* R */}
      <path
        d="M337 110 L337 18 L389 18 L389 58 L337 58"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinejoin="bevel"
      />
      <path d="M362 58 L398 110" stroke="currentColor" strokeWidth="16" />
      {/* S */}
      <path
        d="M500 22 L432 22 L432 60 L496 60 L496 98 L424 98"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinejoin="bevel"
      />
    </svg>
  );
}
