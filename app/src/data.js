// ---- Static demo data for the Vibrant Wallet app ----
//
// `banks` used to be hardcoded here. Connected banks now come from the
// backend (server/) — see services/api.js `listAccounts`/`refresh` — so the
// number of banks the app shows is always however many are actually
// connected, never a fixed count baked into the build.

export const investments = {
  total: 8640.0,
  changePct: 12.4,
}

export const holdings = [
  {
    id: 'vwce',
    ticker: 'VWCE',
    name: 'FTSE All-World ETF',
    shares: '38.4 shares',
    value: 4320.0,
    changePct: 14.2,
    color: '#818cf8',
  },
  {
    id: 'btc',
    ticker: 'BTC',
    name: 'Bitcoin',
    shares: '0.041 BTC',
    value: 2592.0,
    changePct: 18.6,
    color: '#22d3ee',
  },
  {
    id: 'aapl',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    shares: '9 shares',
    value: 1728.0,
    changePct: 5.1,
    color: '#34d399',
  },
]

// Normalised portfolio value series (0..1 relative height) per range.
// Rendered by the AreaChart into an SVG path.
export const perfSeries = {
  '1W': [0.42, 0.5, 0.46, 0.58, 0.64, 0.72, 0.9],
  '1M': [0.28, 0.34, 0.3, 0.46, 0.55, 0.5, 0.62, 0.7, 0.66, 0.82, 0.9],
  '1Y': [0.12, 0.2, 0.16, 0.3, 0.42, 0.38, 0.52, 0.6, 0.72, 0.68, 0.84, 0.92],
  ALL: [0.05, 0.12, 0.1, 0.26, 0.34, 0.5, 0.62, 0.58, 0.74, 0.9],
}

export const rangeReturn = {
  '1W': 3.1,
  '1M': 6.8,
  '1Y': 12.4,
  ALL: 41.2,
}

export function eur(n, opts = {}) {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: opts.cents === false ? 0 : 2,
    maximumFractionDigits: opts.cents === false ? 0 : 2,
  }).format(n)
}
