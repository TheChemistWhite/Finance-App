# Vibrant Wallet — backend

Small API that sits between the app and your bank data. It exists so that
provider access tokens and business logic never live inside the mobile app
itself (a phone can be lost, decompiled, or jailbroken — a server you
control is a much smaller attack surface).

## Run it

```bash
cd server
cp .env.example .env
# generate real secrets instead of the placeholders:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # -> ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))" # -> JWT_SECRET
npm install
npm run dev     # http://localhost:8787
```

Works immediately with zero external accounts: `BANK_PROVIDER=mock` in
`.env` simulates a real aggregator end-to-end (connect a bank, see fake but
realistic accounts/transactions appear, disconnect it, watch the count
adjust automatically).

## Connecting real banks

No app can read your bank data directly — by law (PSD2 in the EU and
equivalents elsewhere) that access has to go through a licensed
Account Information Service Provider (AISP). The usual ones:

- [Plaid](https://plaid.com) — biggest US coverage, good EU support
- [TrueLayer](https://truelayer.com) / [Tink](https://tink.com) — EU-first, strong Open Banking coverage
- [GoCardless Bank Account Data](https://gocardless.com/bank-account-data/) — free tier, EU-focused

Pick one, sign up as a developer (free sandbox tier), and you'll get a
`client_id` + `secret`. `src/providers/plaidProvider.js` is a working
reference implementation for Plaid's REST API — set:

```
BANK_PROVIDER=plaid
PLAID_CLIENT_ID=...
PLAID_SECRET=...
PLAID_ENV=sandbox
```

and the exact same `/api/accounts/*` routes now talk to real (sandbox)
bank data instead of the mock. Writing `truelayerProvider.js` / `tinkProvider.js`
is the same shape — implement `createLinkToken`, `listInstitutions`,
`exchangePublicToken`, `refreshAccount` and register it in `providers/index.js`.

**Nobody but you can complete this step** — it requires your own developer
account and, for real (non-sandbox) bank data, a business/compliance review
by the provider.

## How biometric login works

Two pairing paths share the same `/api/auth/*` router, depending on where
the app is running:

- **Web/desktop build** (`/api/auth/register`, `/api/auth/login`) —
  WebAuthn, the same public-key mechanism behind "Sign in with Face ID" on
  real apps: the device's secure enclave signs a challenge, the server
  verifies the signature against a stored public key. Your fingerprint/face
  never leaves the device and never reaches this server.
- **Native iOS/Android build** (`/api/auth/device/register`,
  `/api/auth/device/login`) — see `app/CAPACITOR.md` and
  `src/deviceAuth.js` for why WebAuthn isn't used inside the wrapped
  WebView, and what's used instead (local biometric prompt + a
  device-bound secret, only ever stored server-side as a salted hash).

Either way, only the very first pairing is allowed without an existing
session (`requireSetupOrAuth` in `routes/auth.js`) — once one credential
exists, adding another device requires already being logged in on this one.
See `SECURITY.md` at the repo root for the full model.

## Data storage

Single encrypted JSON file (`server/data/store.enc.json`), AES-256-GCM,
key from `ENCRYPTION_KEY`. Fine for one person's data; swap `src/store.js`
for a real database before this ever handles more than one user.
