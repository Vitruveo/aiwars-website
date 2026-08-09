/*
 * AI WARS wordmark. Reads "A-WARS" where the W's first stroke is a thick
 * blue bar — slanted at the same angle as the A's legs — doubling as the
 * "I" of "AI".
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 536 120"
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
      {/* I — thick blue bar slanted to match the A's leg angle; doubles as the W's first stroke */}
      <path d="M104 10 L141 110" stroke="url(#aiwars-i)" strokeWidth="26" />
      {/* W — remaining strokes */}
      <path
        d="M148 102 L172 40 L196 102 L229 14"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinejoin="bevel"
      />
      {/* A */}
      <path
        d="M253 110 L289 14 L325 110"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinejoin="bevel"
      />
      <path d="M266 78 L312 78" stroke="currentColor" strokeWidth="14" />
      {/* R */}
      <path
        d="M353 110 L353 18 L405 18 L405 58 L353 58"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinejoin="bevel"
      />
      <path d="M378 58 L414 110" stroke="currentColor" strokeWidth="16" />
      {/* S */}
      <path
        d="M516 22 L448 22 L448 60 L512 60 L512 98 L440 98"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinejoin="bevel"
      />
    </svg>
  );
}
