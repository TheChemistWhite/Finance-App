// App mark: a ribbon that curls into itself like a rolled banknote —
// reuses the same indigo/violet gradient as the rest of the UI so it never
// looks bolted on. `public/logo-mark.svg` is the same shape, used as the
// favicon / native app icon source.
export function LogoMark({ size = 32, rounded = true, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" {...props}>
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#818cf8" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      {rounded && <rect width="64" height="64" rx="16" fill="#13131d" />}
      <path
        d="M18 16 C 18 30, 18 40, 26 45 C 32 48.5, 39 47.5, 42 43 C 44.3 39.5, 43 35, 38.5 34.3 C 35.5 33.8, 34 36, 35.5 38"
        fill="none"
        stroke="url(#logoGrad)"
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Logo({ size = 44, showWordmark = true, align = 'left' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: align === 'center' ? 'column' : 'row',
        gap: align === 'center' ? 10 : 12,
      }}
    >
      <LogoMark size={size} />
      {showWordmark && (
        <div style={{ lineHeight: 1.05, textAlign: align === 'center' ? 'center' : 'left' }}>
          <div style={{ font: "700 17px 'Space Grotesk'", color: '#fff' }}>Vibrant</div>
          <div style={{ font: "700 17px 'Space Grotesk'", color: '#a5b4fc' }}>Wallet</div>
        </div>
      )}
    </div>
  )
}
