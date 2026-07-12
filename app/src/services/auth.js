// Biometric login. This module presents ONE stable API to LockScreen.jsx —
// isBiometricSupported / isRegistered / registerBiometric / loginWithBiometric
// / hasActiveSession / logout — but the actual mechanism differs by platform:
//
//   Web/desktop browser  → WebAuthn platform authenticators (Face ID, Touch
//     ID, Windows Hello, Android fingerprint/face unlock all implement this
//     natively in the OS + browser). The private key never leaves the
//     device's secure hardware; we only ever exchange a signed challenge
//     with our own backend (server/src/webauthn.js), never a third party.
//
//   Native iOS/Android (Capacitor) → a local NativeBiometric prompt backed
//     by Face ID/Touch ID/BiometricPrompt directly, followed by exchanging a
//     device-bound secret (stored in Keychain/Keystore, never in JS storage)
//     for a session JWT — see server/src/deviceAuth.js for why WebAuthn
//     itself isn't used inside the embedded WebView, and services/platform.js
//     for the runtime check that picks this branch.
import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from '@simplewebauthn/browser'
import { api } from './api.js'
import { setToken, getToken, clearToken } from './session.js'
import { isNative } from './platform.js'
import { getDeviceSecret, setDeviceSecret } from './deviceSecret.js'

// capacitor-native-biometric ships a web stub too, but we only ever import
// its real behavior on native, guarded by isNative() below.
import { NativeBiometric } from 'capacitor-native-biometric'

export async function isBiometricSupported() {
  if (isNative()) {
    try {
      const result = await NativeBiometric.isAvailable()
      return Boolean(result?.isAvailable)
    } catch {
      return false
    }
  }
  if (!browserSupportsWebAuthn()) return false
  try {
    return await platformAuthenticatorIsAvailable()
  } catch {
    return true // inconclusive check — let the real attempt decide
  }
}

export async function isRegistered() {
  if (isNative()) {
    // A device only counts as "paired" if it both remembers a secret
    // locally AND the server still recognizes some credential exists.
    // (If the app was reinstalled, local storage is gone and this
    // correctly falls back to the setup flow.)
    const [secret, status] = await Promise.all([getDeviceSecret(), api.authStatus()])
    return Boolean(secret) && status.registered
  }
  const { registered } = await api.authStatus()
  return registered
}

async function nativeBiometricPrompt() {
  await NativeBiometric.verifyIdentity({
    reason: 'Sblocca Vibrant Wallet',
    title: 'Vibrant Wallet',
    subtitle: 'Autenticazione richiesta',
    description: '',
  })
}

/** First-run pairing: register this device as the one trusted device. */
export async function registerBiometric() {
  if (isNative()) {
    await nativeBiometricPrompt() // proves Face ID/Touch ID/fingerprint works locally
    const { secret } = await api.deviceRegister()
    await setDeviceSecret(secret)
    return
  }
  const options = await api.registerOptions()
  const attestation = await startRegistration({ optionsJSON: options })
  await api.registerVerify(attestation)
}

/** Every subsequent app open: prove presence, get a fresh short session. */
export async function loginWithBiometric() {
  if (isNative()) {
    await nativeBiometricPrompt()
    const secret = await getDeviceSecret()
    if (!secret) throw new Error('Nessun dispositivo associato — configura di nuovo.')
    const { token } = await api.deviceLogin(secret)
    setToken(token)
    return token
  }
  const options = await api.loginOptions()
  const assertion = await startAuthentication({ optionsJSON: options })
  const { token } = await api.loginVerify(assertion)
  setToken(token)
  return token
}

export function hasActiveSession() {
  return Boolean(getToken())
}

export function logout() {
  clearToken()
}
