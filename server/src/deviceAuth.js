// Alternative to WebAuthn for the native (Capacitor) iOS/Android build.
//
// WebAuthn's platform-authenticator ceremony is a browser API — inside a
// Capacitor WKWebView/WebView it either isn't exposed at all or requires
// owning a real public domain plus Apple/Google "associated domains"
// entitlements (digital asset links) that only the app owner can set up.
// That's out of scope for this project's sandbox, so the native build uses
// a simpler, still-secure pairing scheme instead:
//
//   1. On first native app open, the OS biometric prompt (Face ID / Touch ID
//      / fingerprint) runs LOCALLY via `capacitor-native-biometric` — this is
//      the actual "sensor" gate the product spec asks for, and it never
//      leaves the device.
//   2. Only after that local check succeeds does the client ask this server
//      to mint a random device secret (see registerDevice below). The
//      secret is handed to the client exactly once and stored in the
//      platform's hardware-backed secure storage (Keychain on iOS,
//      Keystore-backed EncryptedSharedPreferences on Android) via
//      `capacitor-secure-storage-plugin`.
//   3. Every later open repeats the local biometric prompt, then exchanges
//      the stored secret for a fresh short-lived session JWT (verifyDevice
//      below) — identical token shape/expiry to the WebAuthn path, so
//      nothing downstream (routes/middleware) needs to know which pairing
//      method was used.
//
// Only a SHA-256 hash of the secret is ever persisted server-side, compared
// with a constant-time check, so a stolen copy of the encrypted datastore
// still can't be used to forge a session without also having the device's
// secure storage.
import crypto from 'node:crypto'
import * as store from './store.js'

function hash(secret) {
  return crypto.createHash('sha256').update(secret, 'utf8').digest('hex')
}

export function hasDeviceCredential() {
  return Boolean(store.getDeviceAuthState().secretHash)
}

/** First-run (native) pairing: mint a secret, store only its hash, return the raw secret once. */
export function registerDevice() {
  const secret = crypto.randomBytes(32).toString('hex')
  store.setDeviceAuthState({ secretHash: hash(secret), createdAt: new Date().toISOString() })
  return secret
}

/** Every later native app open: exchange the stored secret for proof of pairing. */
export function verifyDevice(secret) {
  const state = store.getDeviceAuthState()
  if (!state.secretHash || typeof secret !== 'string' || !secret) return false
  const given = Buffer.from(hash(secret), 'hex')
  const expected = Buffer.from(state.secretHash, 'hex')
  if (given.length !== expected.length) return false
  return crypto.timingSafeEqual(given, expected)
}
