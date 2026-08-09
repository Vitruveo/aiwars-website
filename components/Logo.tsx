/*
 * AI WARS wordmark. A full white W; the "I" of "AI" is a thick blue bar
 * slanted at the letter angle, centered between the A's right leg and the
 * W's first stroke.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 511 120"
      role="img"
      aria-label="AI WARS"
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id="aiwars-i" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2d8cff" />
          <stop offset="100%" stopColor="#0b5cff" />
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
      {/* I — thick blue bar, parallel to and centered between the A and W slants */}
      <path d="M90 10 L127 110" stroke="url(#aiwars-i)" strokeWidth="24" />
      {/* W */}
      <path
        d="M138 14 L171 104 L193 44 L215 104 L248 14"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinejoin="bevel"
      />
      {/* A */}
      <path
        d="M238 110 L274 14 L310 110"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinejoin="bevel"
      />
      <path d="M251 78 L297 78" stroke="currentColor" strokeWidth="14" />
      {/* R */}
      <path
        d="M336 110 L336 18 L388 18 L388 58 L336 58"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinejoin="bevel"
      />
      <path d="M361 58 L397 110" stroke="currentColor" strokeWidth="16" />
      {/* S */}
      <path
        d="M491 22 L423 22 L423 60 L487 60 L487 98 L415 98"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinejoin="bevel"
      />
    </svg>
  );
}
