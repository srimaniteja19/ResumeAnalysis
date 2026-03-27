/**
 * Original vector decorations — cartoon sci‑fi / “hero watch” vibe only.
 * Not official Ben 10 art or characters (fan‑styled UI).
 */

export function EnergyBurst({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        opacity="0.9"
      >
        <line x1="100" y1="100" x2="100" y2="18" opacity="0.35" />
        <line x1="100" y1="100" x2="156" y2="44" opacity="0.45" />
        <line x1="100" y1="100" x2="182" y2="100" opacity="0.55" />
        <line x1="100" y1="100" x2="156" y2="156" opacity="0.45" />
        <line x1="100" y1="100" x2="100" y2="182" opacity="0.35" />
        <line x1="100" y1="100" x2="44" y2="156" opacity="0.45" />
        <line x1="100" y1="100" x2="18" y2="100" opacity="0.55" />
        <line x1="100" y1="100" x2="44" y2="44" opacity="0.45" />
      </g>
      <circle
        cx="100"
        cy="100"
        r="22"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <circle
        cx="100"
        cy="100"
        r="8"
        fill="currentColor"
        fillOpacity="0.35"
      />
    </svg>
  )
}

/** Stylized double helix — résumé “DNA” motif. */
export function DnaHelixStrip({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 8 Q28 28 12 48 Q-4 68 12 88 Q28 108 12 128 Q-4 148 12 168 Q28 188 12 208 Q-4 228 12 248 Q28 268 12 272"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M36 8 Q20 28 36 48 Q52 68 36 88 Q20 108 36 128 Q52 148 36 168 Q20 188 36 208 Q52 228 36 248 Q20 268 36 272"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.35"
      />
      {[40, 72, 104, 136, 168, 200, 232].map((y) => (
        <line
          key={y}
          x1="14"
          y1={y - 6}
          x2="34"
          y2={y + 6}
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.28"
        />
      ))}
    </svg>
  )
}

/** Abstract “partner” blob — generic alien mascot, not a specific character. */
export function BlobAlienMascot({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <ellipse
        cx="60"
        cy="58"
        rx="44"
        ry="36"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <circle cx="42" cy="48" r="10" fill="currentColor" fillOpacity="0.85" />
      <circle cx="78" cy="48" r="10" fill="currentColor" fillOpacity="0.85" />
      <circle cx="45" cy="46" r="3" fill="#0a0a0a" />
      <circle cx="81" cy="46" r="3" fill="#0a0a0a" />
      <path
        d="M48 68 Q60 78 72 68"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M16 52 Q8 40 14 28 Q22 20 32 24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M104 52 Q112 40 106 28 Q98 20 88 24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  )
}

/** Hex “ops” badge with abstract core. */
export function HexOpsBadge({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 88 76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M44 4 L82 26 L82 50 L44 72 L6 50 L6 26 Z"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="44" cy="38" r="14" fill="currentColor" fillOpacity="0.2" />
      <circle cx="44" cy="38" r="6" fill="currentColor" fillOpacity="0.55" />
    </svg>
  )
}

/** Comic “pow” burst outline — corner accent. */
export function ComicBurstOutline({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M70 6 L82 38 L118 28 L96 56 L130 70 L92 78 L112 112 L70 88 L58 118 L52 82 L14 94 L38 64 L8 48 L44 40 Z"
        fill="currentColor"
        fillOpacity="0.06"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}
