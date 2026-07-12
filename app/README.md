# Vibrant Wallet

Personal-finance mobile dashboard implemented from the Claude Design concept **1c — Vibrant wallet**.

## Run it

```bash
cd app
npm install
npm run dev     # open the printed localhost URL
```

`npm run build` produces a production bundle in `dist/`.

## What's built

- **Home** (`src/components/HomeScreen.jsx`) — glowing gradient total, stacked gradient
  bank cards (tap "Fan out" to spread them), and an investments performance panel with an
  animated area chart and 1W/1M/1Y range toggle. Tapping the panel opens Investments.
- **Investments** (`src/components/InvestmentsScreen.jsx`) — the tappable analytics screen:
  animated line chart with a 1W/1M/1Y/ALL selector, an animated donut allocation chart, and
  a holdings list.
- **Navigation** — bottom tab bar (Home · Invest · Cards · Settings); Cards and Settings are
  stubs.

On a desktop browser the app renders inside a phone frame; on a narrow/mobile viewport it
goes full-bleed. All data is static demo data in `src/data.js`.
