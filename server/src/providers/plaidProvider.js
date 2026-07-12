// Real Plaid integration, scaffolded to the exact interface mockProvider.js
// implements so switching BANK_PROVIDER=plaid is a drop-in change.
//
// NOT ACTIVE by default — this file makes real network calls to Plaid once
// you set PLAID_CLIENT_ID / PLAID_SECRET / PLAID_ENV and BANK_PROVIDER=plaid.
// Sign up at https://dashboard.plaid.com (free "Sandbox" tier for dev/testing,
// then apply for "Production" access — this requires your own business/KYC
// review by Plaid, which nobody can do on your behalf).
//
// Uses plain fetch against Plaid's REST API directly so the server has no
// extra dependency; swap in the official `plaid` npm SDK if you prefer.
const PLAID_HOSTS = {
  sandbox: 'https://sandbox.plaid.com',
  development: 'https://development.plaid.com',
  production: 'https://production.plaid.com',
}

function baseUrl() {
  const env = process.env.PLAID_ENV || 'sandbox'
  return PLAID_HOSTS[env]
}

function credentials() {
  const client_id = process.env.PLAID_CLIENT_ID
  const secret = process.env.PLAID_SECRET
  if (!client_id || !secret) {
    throw new Error(
      'BANK_PROVIDER=plaid but PLAID_CLIENT_ID/PLAID_SECRET are not set. ' +
        'Get sandbox credentials at https://dashboard.plaid.com and add them to server/.env',
    )
  }
  return { client_id, secret }
}

async function plaidFetch(path, body) {
  const res = await fetch(`${baseUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...credentials(), ...body }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`Plaid ${path} failed: ${json.error_message || res.status}`)
  return json
}

export async function createLinkToken(userId) {
  const json = await plaidFetch('/link/token/create', {
    user: { client_user_id: userId },
    client_name: 'Vibrant Wallet',
    products: ['transactions'],
    country_codes: ['US', 'GB', 'IT'],
    language: 'en',
  })
  return { linkToken: json.link_token }
}

// Plaid Link itself renders the bank picker (native SDK component) — the
// server doesn't need to enumerate institutions like the mock provider does.
export async function listInstitutions() {
  return []
}

export async function exchangePublicToken(publicToken) {
  const exchange = await plaidFetch('/item/public_token/exchange', { public_token: publicToken })
  const accessToken = exchange.access_token

  const accountsRes = await plaidFetch('/accounts/balance/get', { access_token: accessToken })
  const institutionName = accountsRes.item?.institution_id ?? 'Connected bank'

  const accounts = accountsRes.accounts.map((a) => ({
    id: a.account_id,
    name: a.official_name || a.name,
    type: a.subtype || a.type,
    mask: a.mask,
    currency: a.balances.iso_currency_code || 'USD',
    balance: a.balances.current ?? 0,
    accentColor: '#818cf8',
    gradient: 'linear-gradient(135deg,#818cf8,#4338ca)',
    categories: [], // populate from /transactions/get, grouped by category
    transactions: [], // populate from /transactions/get
  }))

  return { accessToken, institutionName, institutionId: accountsRes.item?.institution_id, accounts }
}

export async function refreshAccount(accessToken, account) {
  const accountsRes = await plaidFetch('/accounts/balance/get', { access_token: accessToken })
  const fresh = accountsRes.accounts.find((a) => a.account_id === account.id)
  if (!fresh) return account
  return { ...account, balance: fresh.balances.current ?? account.balance }
}
