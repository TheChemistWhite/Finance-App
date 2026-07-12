import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export function issueSessionToken() {
  return jwt.sign({ sub: 'owner' }, config.jwtSecret, { expiresIn: config.sessionTtl })
}

// Guards every /api/accounts* route: requires a valid, non-expired session
// JWT obtained by completing a real WebAuthn biometric login. No token, no
// data — there is no "remember me" that skips biometric re-auth.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing bearer token' })
  }
  try {
    req.userId = jwt.verify(token, config.jwtSecret).sub
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session — please re-authenticate' })
  }
}
