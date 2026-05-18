interface LogoProps {
  size?: number
  showWordmark?: boolean
  className?: string
}

export default function Logo({ size = 40, showWordmark = true, className = '' }: LogoProps) {
  const uid = `vrd-${size}`

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 10, userSelect: 'none' }}
    >
      {/* ── geometric mark ── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* blue → cyan gradient */}
          <linearGradient id={`${uid}-a`} x1="4" y1="6" x2="40" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#3b82f6" />
            <stop offset="55%"  stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          {/* glow filter */}
          <filter id={`${uid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── outer V — thick primary stroke ── */}
        <path
          d="M5 8 L22 36 L39 8"
          stroke={`url(#${uid}-a)`}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter={`url(#${uid}-glow)`}
        />

        {/* ── inner V — thin ghost offset ── */}
        <path
          d="M10 8 L22 31 L34 8"
          stroke={`url(#${uid}-a)`}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.35"
        />

        {/* ── cross-tick on right arm (check accent) ── */}
        <line
          x1="34" y1="8"
          x2="39" y2="8"
          stroke={`url(#${uid}-a)`}
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* ── nodes: corners + apex ── */}
        <circle cx="5"  cy="8"  r="2.5" fill={`url(#${uid}-a)`} filter={`url(#${uid}-glow)`} />
        <circle cx="39" cy="8"  r="2.5" fill={`url(#${uid}-a)`} filter={`url(#${uid}-glow)`} />
        <circle cx="22" cy="36" r="3.2" fill={`url(#${uid}-a)`} filter={`url(#${uid}-glow)`} />

        {/* ── tiny midpoint nodes on arms ── */}
        <circle cx="13.5" cy="22" r="1.5" fill={`url(#${uid}-a)`} opacity="0.55" />
        <circle cx="30.5" cy="22" r="1.5" fill={`url(#${uid}-a)`} opacity="0.55" />
      </svg>

      {/* ── wordmark ── */}
      {showWordmark && (
        <svg
          width={Math.round(size * 2.6)}
          height={size}
          viewBox="0 0 104 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`${uid}-wm`} x1="0" y1="0" x2="104" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#f0f4ff" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>

          {/* "VERI" — light weight */}
          <text
            x="0" y="28"
            fontFamily="'Inter', system-ui, sans-serif"
            fontSize="22"
            fontWeight="200"
            letterSpacing="2"
            fill={`url(#${uid}-wm)`}
          >
            VERI
          </text>

          {/* "DIAN" — bold, gradient blue→cyan */}
          <text
            x="56" y="28"
            fontFamily="'Inter', system-ui, sans-serif"
            fontSize="22"
            fontWeight="700"
            letterSpacing="1"
            fill={`url(#${uid}-a)`}
          >
            DIAN
          </text>

          {/* hairline separator between VERI and DIAN */}
          <rect x="53" y="8" width="1" height="18" rx="0.5" fill="#334155" />
        </svg>
      )}
    </div>
  )
}
