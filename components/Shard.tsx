// Crystalline shard. Pure SVG, tier sets brightness and core color.
// Renders on the server; motion comes from CSS classes.

const TIER_STYLE = [
  { glow: "#2d8cff", core: "#f0954f", coreOpacity: 1, facet: 0.95 },
  { glow: "#2d8cff", core: "#2d8cff", coreOpacity: 0.95, facet: 0.85 },
  { glow: "#2d8cff", core: "#2d8cff", coreOpacity: 0.8, facet: 0.7 },
  { glow: "#2d8cff", core: "#2d8cff", coreOpacity: 0.6, facet: 0.55 },
  { glow: "#2d8cff", core: "#8fa0ba", coreOpacity: 0.45, facet: 0.4 },
];

export default function Shard({
  tier = 1,
  size = 160,
  float = false,
  className = "",
  label,
}: {
  tier?: number;
  size?: number;
  float?: boolean;
  className?: string;
  label?: string;
}) {
  const st = TIER_STYLE[Math.min(Math.max(tier, 1), 5) - 1];
  const id = `shard-${tier}-${size}`;
  return (
    <svg
      viewBox="0 0 100 140"
      width={size}
      height={(size * 140) / 100}
      className={`${float ? "shard-float" : ""} ${className}`}
      aria-label={label ?? `Tier ${tier} shard`}
      role="img"
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b5cff" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#2d8cff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#04070d" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef3fb" stopOpacity="0.9" />
          <stop offset="1" stopColor="#2d8cff" stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id={`${id}-core`} cx="0.5" cy="0.45" r="0.5">
          <stop offset="0" stopColor={st.core} stopOpacity={st.coreOpacity} />
          <stop offset="0.6" stopColor={st.core} stopOpacity={st.coreOpacity * 0.35} />
          <stop offset="1" stopColor={st.core} stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-glow`} x="-60%" y="-40%" width="220%" height="180%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* outer glow */}
      <polygon
        points="50,2 86,34 76,104 50,138 24,104 14,34"
        fill={st.glow}
        opacity={0.18 * st.facet}
        filter={`url(#${id}-glow)`}
      />
      {/* body */}
      <polygon
        points="50,2 86,34 76,104 50,138 24,104 14,34"
        fill={`url(#${id}-body)`}
        stroke={`url(#${id}-edge)`}
        strokeWidth="1.2"
        opacity={st.facet}
      />
      {/* facets */}
      <g stroke="#eef3fb" strokeWidth="0.6" opacity={0.55 * st.facet} fill="none">
        <polyline points="50,2 50,138" />
        <polyline points="14,34 50,52 86,34" />
        <polyline points="24,104 50,86 76,104" />
        <polyline points="50,52 50,86" />
        <polyline points="14,34 50,86" />
        <polyline points="86,34 50,86" />
      </g>
      <polygon points="50,2 86,34 50,52" fill="#eef3fb" opacity={0.14 * st.facet} />
      <polygon points="14,34 50,52 50,86" fill="#0b5cff" opacity={0.25 * st.facet} />
      <polygon points="50,86 76,104 50,138" fill="#04070d" opacity={0.35} />
      {/* core */}
      <ellipse className="shard-core" cx="50" cy="66" rx="16" ry="26" fill={`url(#${id}-core)`} />
    </svg>
  );
}
