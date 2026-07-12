# Vibrant Wallet — security model

This is a personal, single-user finance aggregator. Everything below
describes what's actually implemented, not aspirational goals — and where
the tradeoffs are, since a few of the shortcuts here are correct *because*
it's single-user and would need revisiting for anything bigger.

## Threat model

The main things this app defends against:

1. **A lost/stolen phone or laptop with the app installed.** No data is
   readable without a fresh biometric check every time the app is opened —
   there is no "remember me," no background token refresh, and the session
   token itself expires after 15 minutes regardless.
2. **A stolen copy of the server's data file** (`server/data/store.enc.json`).
   It's AES-256-GCM encrypted as a whole; without `ENCRYPTION_KEY` it's
   useless. Bank access tokens live inside that encrypted blob and are never
   sent to the client in any API response (`store.listPublicAccounts()`
   only returns display fields).
3. **Network attackers / random internet traffic hitting the API.**
   `helmet()` for standard hardening headers, CORS locked to
   `CORS_ORIGINS`, request bodies capped at 100kb, every route validated
   with `zod`, and rate limiting (20 req/5min on auth endpoints, 120
   req/min elsewhere).
4. **Someone else trying to pair their own device against your account.**
   Registration/pairing (`requireSetupOrAuth` in `routes/auth.js`) is only
   allowed with no existing session while *zero* credentials exist yet.
   Once one device is paired, adding another requires already being logged
   in on an existing one.

What it does **not** defend against: a compromised device where the
attacker already has your unlocked phone/session, or a fully compromised
server host (if someone has root on the box running `server/`, no amount
of app-level encryption stops them from reading `ENCRYPTION_KEY` out of the
environment). Standard hosting hygiene (patched OS, no other services on
the box, restricted SSH access) is out of scope for this codebase.

## Biometric login, two mechanisms

- **Web/desktop** (`server/src/webauthn.js`, `app/src/services/auth.js`) —
  WebAuthn platform authenticators. The device's secure enclave signs a
  challenge; the private key never leaves the device; this server only
  ever sees a signed assertion + public key, never your actual
  fingerprint/face data.
- **Native iOS/Android** (`server/src/deviceAuth.js`) — WebAuthn doesn't
  reliably work inside a Capacitor WebView without owning a real domain +
  platform entitlements, so the native build instead does a local
  `capacitor-native-biometric` prompt (real OS Face ID/Touch ID/fingerprint
  check, on-device only) followed by exchanging a device-bound secret
  (stored in Keychain/Keystore via `capacitor-secure-storage-plugin`) for a
  session JWT. The server only stores a SHA-256 hash of that secret,
  compared with a constant-time check (`crypto.timingSafeEqual`) — see
  `app/CAPACITOR.md` for the full writeup and its known recovery
  limitation.

Either path issues the same short-lived (15 min) JWT, checked by
`requireAuth` on every `/api/accounts/*` route.

## Data handling

- Bank access tokens: encrypted at rest, never returned to the client.
- Session tokens: JWT, 15-minute expiry, held in `sessionStorage` on web
  (cleared when the tab/app closes — no persistent "logged in forever"
  state) — see `app/src/services/session.js`.
- The device-pairing secret (native only) is the one thing that *is*
  meant to persist across app restarts, since it's what the biometric
  prompt is unlocking access *to*; it lives in hardware-backed secure
  storage, never in JS-accessible storage.
- No analytics, no third-party trackers, no telemetry anywhere in this
  codebase.
- **No background refresh.** Balances are only re-fetched once, right
  after a successful unlock (`App.jsx`'s `hydrate()`), never on a timer —
  this was an explicit product requirement, and it also means there's no
  always-on network activity for something to intercept.

## Known limitations / accepted tradeoffs

- **Single flat encrypted JSON file, not a real database.** Fine at
  personal scale; `server/src/store.js` says exactly where to swap it out
  (a real DB + managed KMS for the encryption key) if this ever needs to
  handle more than one person's data.
- **No recovery flow if you lose every paired device.** By design —
  otherwise anyone with network access to the server could "recover" by
  just pairing their own device. Manual reset means deleting
  `server/data/store.enc.json` and re-pairing from scratch (see
  `CAPACITOR.md`).
- **`server/src/providers/mockProvider.js` is fake data** until you plug in
  your own Plaid/TrueLayer/Tink/GoCardless developer credentials (see
  `server/README.md`) — nobody but you can complete that step, it requires
  your own developer account and (for real, non-sandbox data) a compliance
  review by the provider.
- **Rate limiting is per-process, in-memory** (`express-rate-limit`
  defaults) — fine for a single instance; would need a shared store
  (Redis) behind a load balancer with multiple instances.
- **HTTPS is not handled by this code.** In any real deployment (including
  pointing a Capacitor build at a non-localhost server, see
  `CAPACITOR.md` §3), put this behind a reverse proxy/load balancer doing
  TLS termination — biometric login and account data have no business
  going over plain HTTP once they leave the device.

## Dependency audit

- `server/`: `npm audit` — **0 vulnerabilities**.
- `app/`: `npm audit` — **0 vulnerabilities** (as of the Capacitor
  scaffolding pass: bumped to Vite 8 / `@vitejs/plugin-react` 6, which
  closed 4 dev-server-only advisories in the Vite 5 line — path traversal
  in optimized-deps sourcemap handling, an NTLMv2 hash disclosure via UNC
  paths on Windows, an `fs.deny` bypass, and the well-known
  `GHSA-67mh-4wv8-2f99` esbuild dev-server CORS issue — and bumped
  `@capacitor/*` to the current 8.x line, which closed a `node-tar`
  path-traversal chain pulled in transitively by `@capacitor/cli`). All of
  these were dev-tooling-only exposures (the Vite dev server, or the CLI
  tool a developer runs locally) — none reached the shipped production
  build — but there was a clean non-breaking-in-practice upgrade path, so
  it made sense to just take it rather than carry a documented exception.

Re-run both before shipping: `cd server && npm audit`, `cd app && npm audit`.
