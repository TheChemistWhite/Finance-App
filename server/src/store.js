// Minimal encrypted-at-rest persistence for a single-user (personal) app.
//
// The whole datastore is serialized to JSON and encrypted as one blob with
// AES-256-GCM (see crypto.js) before touching disk, so a stolen copy of the
// data file on its own is useless without ENCRYPTION_KEY. Provider access
// tokens live inside that encrypted blob and are never sent to the client.
//
// Production note: at real scale this should be replaced by a proper
// database (e.g. Postgres) with the access-token column encrypted via a
// managed KMS, not a flat file — this is sized for a personal, single-user
// deployment as requested.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { encrypt, decrypt } from './crypto.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_FILE = path.join(__dirname, '..', 'data', 'store.enc.json')

function emptyDb() {
  return {
    webauthn: { userId: 'owner', userHandle: null, credentials: [] },
    // Alternative pairing path used by the native (Capacitor) build, where a
    // WebAuthn ceremony can't reliably run inside an embedded WebView — see
    // server/src/deviceAuth.js. Only ever stores a hash of the secret.
    device: { secretHash: null, createdAt: null },
    items: [], // one entry per connected bank ("item" in Plaid terms)
  }
}

function load() {
  if (!fs.existsSync(DB_FILE)) return emptyDb()
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8')
    return JSON.parse(decrypt(raw))
  } catch (err) {
    // Corrupt/undecryptable file (e.g. wrong ENCRYPTION_KEY) — fail safe to
    // an empty store rather than crash the whole server.
    console.error('Failed to load/decrypt store, starting empty:', err.message)
    return emptyDb()
  }
}

let db = load()

function persist() {
  // Ensure the data/ directory exists before the first write — it's
  // gitignored and absent on a fresh clone, so without this the very first
  // save (e.g. device pairing) would throw ENOENT and surface as a 500.
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true })
  const encrypted = encrypt(JSON.stringify(db))
  // Note: a production deployment should use a real database with proper
  // transactional writes; this direct overwrite is sized for the personal,
  // single-user scope requested here (some sandboxes/filesystems restrict
  // rename()/unlink() on already-written files, so we avoid the classic
  // write-tmp-then-rename dance and just overwrite in place).
  fs.writeFileSync(DB_FILE, encrypted, { mode: 0o600 })
}

// ---- WebAuthn credentials ----
export function getWebauthnState() {
  return db.webauthn
}
export function setWebauthnState(next) {
  db.webauthn = next
  persist()
}

// ---- Device pairing secret (native/Capacitor login path) ----
export function getDeviceAuthState() {
  return db.device
}
export function setDeviceAuthState(next) {
  db.device = next
  persist()
}

// Ephemeral per-ceremony challenge — deliberately NOT persisted to disk.
let currentChallenge = null
export function setCurrentChallenge(challenge) {
  currentChallenge = challenge
}
export function getCurrentChallenge() {
  return currentChallenge
}

// ---- Bank connections ("items") & accounts ----
export function listItems() {
  return db.items
}

export function addItem(item) {
  db.items.push(item)
  persist()
}

export function findItemByAccountId(accountId) {
  return db.items.find((it) => it.accounts.some((a) => a.id === accountId))
}

// Public, safe-to-return account list (never includes the access token).
export function listPublicAccounts() {
  return db.items.flatMap((it) =>
    it.accounts.map((a) => ({
      id: a.id,
      institutionName: it.institutionName,
      name: a.name,
      type: a.type,
      mask: a.mask,
      currency: a.currency,
      balance: a.balance,
      accentColor: a.accentColor,
      gradient: a.gradient,
      changePct: a.changePct ?? 0,
      series: a.series || null,
      rangeReturn: a.rangeReturn || null,
      categories: a.categories || [],
      transactions: a.transactions || [],
      connectedAt: it.connectedAt,
    })),
  )
}

export function updateAccountBalance(accountId, balance) {
  for (const it of db.items) {
    const acc = it.accounts.find((a) => a.id === accountId)
    if (acc) {
      acc.balance = balance
      persist()
      return
    }
  }
}

// Removes a single account; drops the whole item once it has no accounts
// left (mirrors "closing every account at a bank disconnects the bank").
export function removeAccount(accountId) {
  let removed = false
  db.items = db.items
    .map((it) => {
      const before = it.accounts.length
      it.accounts = it.accounts.filter((a) => a.id !== accountId)
      if (it.accounts.length !== before) removed = true
      return it
    })
    .filter((it) => it.accounts.length > 0)
  if (removed) persist()
  return removed
}
