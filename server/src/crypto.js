// AES-256-GCM helpers used to encrypt provider access tokens (and any other
// sensitive value) before they touch disk. Authenticated encryption means a
// tampered ciphertext fails to decrypt instead of silently returning garbage.
import crypto from 'node:crypto'
import { config } from './config.js'

const ALGO = 'aes-256-gcm'
const key = Buffer.from(config.encryptionKey, 'hex')

export function encrypt(plaintext) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, key, iv)
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  // Store iv + authTag alongside the ciphertext (all needed to decrypt).
  return Buffer.concat([iv, authTag, ciphertext]).toString('base64')
}

export function decrypt(payload) {
  const buf = Buffer.from(payload, 'base64')
  const iv = buf.subarray(0, 12)
  const authTag = buf.subarray(12, 28)
  const ciphertext = buf.subarray(28)
  const decipher = crypto.createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(authTag)
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return plaintext.toString('utf8')
}
