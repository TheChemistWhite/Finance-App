// Storage for the long-lived device-pairing secret used by the native
// (Capacitor iOS/Android) login path — see server/src/deviceAuth.js for why
// this exists instead of WebAuthn on native.
//
// Backed by capacitor-secure-storage-plugin, which puts the value in the
// iOS Keychain / Android Keystore-backed EncryptedSharedPreferences — never
// plain localStorage/sessionStorage, since this secret is longer-lived than
// the session JWT it's exchanged for. Only ever imported from services on
// the native code path (platform.isNative() === true), so the web build
// never touches this plugin at all.
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin'

const KEY = 'vw_device_secret'

export async function getDeviceSecret() {
  try {
    const { value } = await SecureStoragePlugin.get({ key: KEY })
    return value || null
  } catch {
    return null // not set yet, or plugin unavailable
  }
}

export async function setDeviceSecret(secret) {
  await SecureStoragePlugin.set({ key: KEY, value: secret })
}

export async function clearDeviceSecret() {
  try {
    await SecureStoragePlugin.remove({ key: KEY })
  } catch {
    /* no-op if nothing was stored */
  }
}
