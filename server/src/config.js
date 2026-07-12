import 'dotenv/config'

function required(name, fallback) {
  const v = process.env[name] ?? fallback
  if (v === undefined) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return v
}

export const config = {
  port: Number(process.env.PORT || 8787),
  isProd: process.env.NODE_ENV === 'production',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  encryptionKey: required('ENCRYPTION_KEY', process.env.NODE_ENV === 'production' ? undefined : '0'.repeat(64)),
  jwtSecret: required('JWT_SECRET', process.env.NODE_ENV === 'production' ? undefined : 'dev-only-insecure-secret-change-me'),
  rpId: process.env.RP_ID || 'localhost',
  rpName: process.env.RP_NAME || 'Vibrant Wallet',
  origin: process.env.ORIGIN || 'http://localhost:5173',
  bankProvider: process.env.BANK_PROVIDER || 'mock',
  sessionTtl: '15m',
}

if (config.isProd) {
  if (!/^[0-9a-fA-F]{64}$/.test(config.encryptionKey)) {
    throw new Error('ENCRYPTION_KEY must be a 64-char hex string (32 bytes) in production')
  }
  if (config.jwtSecret === 'dev-only-insecure-secret-change-me') {
    throw new Error('JWT_SECRET must be set to a real secret in production')
  }
}
