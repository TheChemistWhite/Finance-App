import { Router } from 'express'
import { z } from 'zod'
import * as webauthn from '../webauthn.js'
import * as deviceAuth from '../deviceAuth.js'
import { issueSessionToken, requireAuth } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimiters.js'

export const authRouter = Router()
authRouter.use(authLimiter)

// Either pairing method (browser WebAuthn or native device-secret) counts —
// they're mutually exclusive first-use paths for the same single owner.
function hasAnyCredential() {
  return webauthn.hasRegisteredCredential() || deviceAuth.hasDeviceCredential()
}

// Registration/pairing is only left "open" (no session required) until the
// very first device has been paired — this is a single-user personal app,
// so after that, adding another device requires already being logged in on
// this one. Prevents a stranger with network access from just enrolling
// their own fingerprint against your data.
function requireSetupOrAuth(req, res, next) {
  if (!hasAnyCredential()) return next()
  return requireAuth(req, res, next)
}

authRouter.get('/status', (req, res) => {
  res.json({ registered: hasAnyCredential() })
})

// ---- Web/desktop path: WebAuthn platform authenticator ----
authRouter.post('/register/options', requireSetupOrAuth, async (req, res) => {
  try {
    const options = await webauthn.getRegistrationOptions()
    res.json(options)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

authRouter.post('/register/verify', requireSetupOrAuth, async (req, res) => {
  try {
    await webauthn.verifyRegistration(req.body)
    res.json({ verified: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

authRouter.post('/login/options', async (req, res) => {
  try {
    const options = await webauthn.getAuthenticationOptions()
    res.json(options)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

authRouter.post('/login/verify', async (req, res) => {
  try {
    await webauthn.verifyAuthentication(req.body)
    const token = issueSessionToken()
    res.json({ token, expiresIn: 15 * 60 })
  } catch (err) {
    res.status(401).json({ error: err.message })
  }
})

// ---- Native (Capacitor iOS/Android) path: device secret + local biometric ----
// The client only calls these after its own local NativeBiometric check
// (Face ID/Touch ID/fingerprint) has already succeeded — see
// app/src/services/auth.js. This server has no way to verify that
// biometric check itself (it happens entirely on-device); what it verifies
// is that the caller holds the secret that was issued during pairing, which
// only ever lived in that device's hardware-backed secure storage.
authRouter.post('/device/register', requireSetupOrAuth, (req, res) => {
  const secret = deviceAuth.registerDevice()
  res.json({ secret })
})

const deviceLoginSchema = z.object({ secret: z.string().min(32).max(256) })

authRouter.post('/device/login', (req, res) => {
  const parsed = deviceLoginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request body' })

  if (!deviceAuth.verifyDevice(parsed.data.secret)) {
    return res.status(401).json({ error: 'Device not recognized — please re-pair' })
  }
  const token = issueSessionToken()
  res.json({ token, expiresIn: 15 * 60 })
})
