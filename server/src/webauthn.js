// Biometric login using WebAuthn platform authenticators.
//
// This is the real, standards-based mechanism behind Face ID / Touch ID /
// Android fingerprint & face unlock in a browser or WebView context: the
// device's secure enclave signs a server-issued challenge with a private
// key that never leaves the device. Biometric data itself never reaches
// this server — we only ever see a signed challenge and a public key.
//
// (When the app is wrapped natively with Capacitor, you can instead call a
// native biometric plugin directly — see services/auth.js on the client
// for the platform switch. The server-side contract here stays the same
// either way: verify a signed assertion, issue a short-lived session.)
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import { isoBase64URL, generateUserID } from '@simplewebauthn/server/helpers'
import { config } from './config.js'
import * as store from './store.js'

async function getOrCreateUserHandle() {
  const state = store.getWebauthnState()
  if (state.userHandle) return isoBase64URL.toBuffer(state.userHandle)
  const handle = await generateUserID()
  store.setWebauthnState({ ...state, userHandle: isoBase64URL.fromBuffer(handle) })
  return handle
}

export function hasRegisteredCredential() {
  return store.getWebauthnState().credentials.length > 0
}

export async function getRegistrationOptions() {
  const state = store.getWebauthnState()
  const userID = await getOrCreateUserHandle()

  const options = await generateRegistrationOptions({
    rpName: config.rpName,
    rpID: config.rpId,
    userName: 'owner',
    userID,
    attestationType: 'none',
    excludeCredentials: state.credentials.map((c) => ({ id: c.id, transports: c.transports })),
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // built-in Face ID/Touch ID/fingerprint, not a USB key
      residentKey: 'preferred',
      userVerification: 'required', // forces the biometric/PIN check, not just "tap"
    },
  })

  store.setCurrentChallenge(options.challenge)
  return options
}

export async function verifyRegistration(response) {
  const expectedChallenge = store.getCurrentChallenge()
  if (!expectedChallenge) throw new Error('No registration in progress')

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: config.origin,
    expectedRPID: config.rpId,
    requireUserVerification: true,
  })

  store.setCurrentChallenge(null)

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error('Registration verification failed')
  }

  const { credential } = verification.registrationInfo
  const state = store.getWebauthnState()
  state.credentials.push({
    id: credential.id,
    publicKey: isoBase64URL.fromBuffer(credential.publicKey),
    counter: credential.counter,
    transports: credential.transports || [],
  })
  store.setWebauthnState(state)
}

export async function getAuthenticationOptions() {
  const state = store.getWebauthnState()
  if (state.credentials.length === 0) {
    throw new Error('No biometric credential registered yet')
  }

  const options = await generateAuthenticationOptions({
    rpID: config.rpId,
    userVerification: 'required',
    allowCredentials: state.credentials.map((c) => ({ id: c.id, transports: c.transports })),
  })

  store.setCurrentChallenge(options.challenge)
  return options
}

export async function verifyAuthentication(response) {
  const expectedChallenge = store.getCurrentChallenge()
  if (!expectedChallenge) throw new Error('No authentication in progress')

  const state = store.getWebauthnState()
  const stored = state.credentials.find((c) => c.id === response.id)
  if (!stored) throw new Error('Unknown credential')

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: config.origin,
    expectedRPID: config.rpId,
    credential: {
      id: stored.id,
      publicKey: isoBase64URL.toBuffer(stored.publicKey),
      counter: stored.counter,
      transports: stored.transports,
    },
    requireUserVerification: true,
  })

  store.setCurrentChallenge(null)

  if (!verification.verified) throw new Error('Authentication verification failed')

  // Bump the stored signature counter — a cloned authenticator would replay
  // an old counter value and get rejected on its next real use.
  stored.counter = verification.authenticationInfo.newCounter
  store.setWebauthnState(state)
}
