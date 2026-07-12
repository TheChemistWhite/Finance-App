// Tiny wrapper so the rest of the app never imports @capacitor/core directly.
// On the web build this always reports "web"/not-native, which is what lets
// the WebAuthn path run unchanged in a normal browser.
import { Capacitor } from '@capacitor/core'

export function isNative() {
  return Capacitor.isNativePlatform()
}

export function platformName() {
  return Capacitor.getPlatform() // 'ios' | 'android' | 'web'
}
