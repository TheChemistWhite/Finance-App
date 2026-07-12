// Shown once per app open while fresh data is pulled from the backend (see
// App.jsx) — never for a background/periodic refresh, only right after
// unlocking. Centered ring spins around the "Loading…" label; the app
// content behind it is blurred so nothing sensitive is readable while it's
// mid-refresh.
export default function LoadingOverlay({ label = 'Loading…' }) {
  return (
    <div className="loading-overlay">
      <div className="loading-ring-wrap">
        <svg className="loading-ring" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="loadingGrad" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#818cf8" />
              <stop offset="0.65" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="url(#loadingGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="130 300"
          />
        </svg>
        <div className="loading-pill">{label}</div>
      </div>
    </div>
  )
}
