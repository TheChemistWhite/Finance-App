import rateLimit from 'express-rate-limit'

// Tight limiter on auth endpoints — this is the brute-force-sensitive
// surface (WebAuthn ceremonies), so we throttle hard per IP.
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please wait a few minutes.' },
})

// Looser general limiter for everything else under /api.
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
})
