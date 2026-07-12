// Where the short-lived session token lives on-device.
//
// Deliberately sessionStorage, not localStorage: it's cleared whenever the
// app/tab is closed, which matches the product requirement that opening
// the app always re-checks biometrics rather than silently staying signed
// in forever. There is no "remember me".
//
// TODO(native): once this is wrapped with Capacitor for iOS/Android, swap
// this module's storage for `capacitor-secure-storage-plugin` (Keychain on
// iOS, EncryptedSharedPreferences/Keystore on Android) instead of
// sessionStorage — install it, then replace get/set/clear below with its
// async get/set/remove calls. Keep the function names the same so nothing
// else in the app has to change.
const KEY = 'vw_session_token'

export function getToken() {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    sessionStorage.setItem(KEY, token)
  } catch {
    /* storage unavailable (e.g. private mode) — session just won't persist */
  }
}

export function clearToken() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* no-op */
  }
}
