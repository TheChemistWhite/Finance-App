# Wrapping Vibrant Wallet for iOS and Android (Capacitor)

The app itself (`src/`) already runs the same on web and native — the only
platform-specific code is the biometric login switch in
`src/services/auth.js`, gated by `src/services/platform.js`. This doc is the
part that has to happen **on your machine**, because it needs Xcode
(iOS) and/or Android Studio, which aren't available in this sandbox.

## 1. One-time setup

```bash
cd app
npm install                # pulls in @capacitor/core, @capacitor/ios,
                            # @capacitor/android, capacitor-native-biometric,
                            # capacitor-secure-storage-plugin
npm run build               # produces dist/ — Capacitor wraps this, not src/
npx cap add ios              # requires Xcode + CocoaPods, macOS only
npx cap add android           # requires Android Studio / Android SDK
```

`capacitor.config.json` at the app root already sets `webDir: "dist"` and
the app id `com.vibrantwallet.app` — change the id before you ship if you
want a different bundle identifier (it has to match what you register in
App Store Connect / Play Console).

## 2. Permissions the native projects need

**iOS** (`ios/App/App/Info.plist`) — add the Face ID usage string, required
or the app crashes the moment it calls the biometric API:

```xml
<key>NSFaceIDUsageDescription</key>
<string>Usa Face ID per sbloccare Vibrant Wallet</string>
```

**Android** (`android/app/src/main/AndroidManifest.xml`) — add the
biometric permission:

```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
```

Both plugins (`capacitor-native-biometric`, `capacitor-secure-storage-plugin`)
document their own additional native setup steps in their READMEs — check
those after `npx cap sync` in case a plugin version bump changes anything.

## 3. Pointing the app at your backend

The app calls the API at `VITE_API_BASE_URL` (see `src/services/api.js`,
defaults to `http://localhost:8787`). For a real device/simulator build,
that can't be `localhost` (that would mean the phone itself, not your dev
machine) — set it to wherever `server/` is actually reachable, e.g.:

```bash
# app/.env
VITE_API_BASE_URL=https://your-server.example.com
```

then `npm run build` again before `npx cap sync` so the native shell picks
up the new bundle. In production this should be a real HTTPS endpoint —
biometric login and your account data have no business going over plain
HTTP once they leave the device.

## 4. Sync + open in the native IDE

Every time you change `src/` or `.env`:

```bash
npm run build
npx cap sync      # copies dist/ + updates native plugin registrations
npx cap open ios      # opens Xcode
npx cap open android  # opens Android Studio
```

Run/debug from there like any other native project.

## 5. Why biometric login works differently on native

WebAuthn (used on web/desktop, see `server/README.md`) is a **browser** API.
Inside Capacitor's embedded WebView it either isn't exposed, or only works
if you own a real public domain and configure Apple/Google's
"associated domains" (digital asset links) entitlements — extra
infrastructure outside this project's scope, and something only you can
set up since it needs your Apple Developer / Google Play accounts.

So the native build uses a different, still-secure path instead (see
`server/src/deviceAuth.js` and the `isNative()` branch in
`src/services/auth.js`):

1. Every app open, `capacitor-native-biometric` triggers the **real** OS
   Face ID / Touch ID / fingerprint prompt, entirely on-device.
2. Only after that succeeds does the app talk to the backend — first pairing
   mints a random secret server-side and hands it to the device once; the
   device stores it in the iOS Keychain / Android Keystore via
   `capacitor-secure-storage-plugin` (hardware-backed secure storage, not
   `localStorage`). Every later open exchanges that secret for a fresh
   15-minute session token.
3. The server only ever stores a SHA-256 hash of the secret, compared with
   a constant-time check — a stolen copy of `server/data/store.enc.json`
   still isn't enough to forge a login without also having the device.

**Known limitation (same trade-off as the WebAuthn path on web):** since
registering a *new* device is blocked once one is already paired (by
design — otherwise anyone with network access could pair their own device),
losing your phone with no other logged-in device means there's no
self-service recovery. To re-pair from scratch: stop the server, delete
`server/data/store.enc.json` (this also clears cached account balances —
you'll need to reconnect your banks), restart, and the app will offer setup
again.
