// Simulates a real account-aggregation provider (Plaid/TrueLayer/Tink) end
// to end, with the exact same call shape a real integration would use, so
// swapping BANK_PROVIDER=plaid later is a drop-in change (see plaidProvider.js).
import { nanoid } from 'nanoid'

// Small catalog of fake institutions the mock "Link" UI lets you pick from.
export const INSTITUTION_CATALOG = [
  { institutionId: 'ins_aurora', name: 'Aurora Bank', type: 'Checking', gradient: 'linear-gradient(135deg,#3b82f6,#1e40af)', accent: '#60a5fa' },
  { institutionId: 'ins_meridian', name: 'Meridian Savings', type: 'Savings', gradient: 'linear-gradient(135deg,#8b5cf6,#5b21b6)', accent: '#a78bfa' },
  { institutionId: 'ins_novabank', name: 'Novabank', type: 'Everyday', gradient: 'linear-gradient(135deg,#22d3ee,#0e7490)', accent: '#22d3ee' },
  { institutionId: 'ins_solis', name: 'Solis Credit Union', type: 'Checking', gradient: 'linear-gradient(135deg,#fb923c,#c2410c)', accent: '#fb923c' },
  { institutionId: 'ins_harbor', name: 'Harbor Trust', type: 'Savings', gradient: 'linear-gradient(135deg,#34d399,#047857)', accent: '#34d399' },
]

const CATEGORY_POOL = [
  { name: 'Housing', color: '#818cf8' },
  { name: 'Groceries', color: '#34d399' },
  { name: 'Transport', color: '#fbbf24' },
  { name: 'Dining Out', color: '#fb7185' },
  { name: 'Shopping', color: '#22d3ee' },
  { name: 'Entertainment', color: '#818cf8' },
  { name: 'Subscriptions', color: '#fbbf24' },
]

const MERCHANTS = ['Whole Foods', 'Uber', 'Netflix', 'Spotify', 'Amazon', 'Rent Payment', 'Cinema', 'Zara', 'Restaurant', 'Electric Co.', 'Gym']

function rand(min, max) {
  return Math.random() * (max - min) + min
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function genTransactions(accentColor) {
  const count = 4 + Math.floor(Math.random() * 3)
  const out = []
  for (let i = 0; i < count; i++) {
    const isIncome = i === 0 && Math.random() < 0.3
    out.push({
      id: nanoid(8),
      name: isIncome ? 'Salary' : pick(MERCHANTS),
      date: new Date(Date.now() - i * 86400000 * rand(1, 3)).toISOString().slice(0, 10),
      amount: isIncome ? Math.round(rand(1800, 3200) * 100) / 100 : -Math.round(rand(5, 120) * 100) / 100,
      color: isIncome ? '#34d399' : accentColor,
    })
  }
  return out
}

function genCategories() {
  const n = 3 + Math.floor(Math.random() * 2)
  const chosen = [...CATEGORY_POOL].sort(() => Math.random() - 0.5).slice(0, n)
  return chosen.map((c) => ({ id: nanoid(6), name: c.name, color: c.color, value: Math.round(rand(40, 800)) }))
}

function genSeries() {
  const line = () => {
    let v = rand(0.35, 0.6)
    const out = []
    for (let i = 0; i < 8; i++) {
      v = Math.min(0.95, Math.max(0.05, v + rand(-0.09, 0.13)))
      out.push(Math.round(v * 100) / 100)
    }
    return out
  }
  return { '1W': line(), '1M': line(), '1Y': line(), ALL: line() }
}

function genRangeReturn() {
  return {
    '1W': Math.round(rand(-3, 4) * 10) / 10,
    '1M': Math.round(rand(-6, 8) * 10) / 10,
    '1Y': Math.round(rand(-4, 20) * 10) / 10,
    ALL: Math.round(rand(5, 45) * 10) / 10,
  }
}

/** Step 1 of a Link flow: ask the provider for a short-lived link token. */
export async function createLinkToken() {
  return { linkToken: `mock-link-${nanoid(16)}` }
}

/** Returns the fake bank picker list for the mock Link modal. */
export async function listInstitutions() {
  return INSTITUTION_CATALOG
}

/**
 * Step 2 of a Link flow: exchange the (mock) public token the client got
 * back from Link for a durable access token + the newly connected accounts.
 * A real provider does the same thing with a real public_token.
 */
export async function exchangePublicToken(publicToken, institutionId) {
  const institution = INSTITUTION_CATALOG.find((i) => i.institutionId === institutionId) || INSTITUTION_CATALOG[0]
  const accountId = nanoid(12)
  const rangeReturn = genRangeReturn()
  const account = {
    id: accountId,
    name: institution.name,
    type: institution.type,
    mask: String(Math.floor(1000 + Math.random() * 9000)),
    currency: 'EUR',
    balance: Math.round(rand(200, 9000) * 100) / 100,
    accentColor: institution.accent,
    gradient: institution.gradient,
    changePct: rangeReturn['1M'],
    series: genSeries(),
    rangeReturn,
    categories: genCategories(),
    transactions: genTransactions(institution.accent),
  }
  return {
    accessToken: `mock-access-${nanoid(24)}`,
    institutionName: institution.name,
    institutionId: institution.institutionId,
    accounts: [account],
  }
}

/**
 * Called once per app open (never in the background) to pull fresh
 * balances/transactions for an already-connected account.
 */
export async function refreshAccount(accessToken, account) {
  const delta = rand(-40, 60)
  return {
    ...account,
    balance: Math.max(0, Math.round((account.balance + delta) * 100) / 100),
  }
}
