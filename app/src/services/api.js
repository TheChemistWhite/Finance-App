// Thin fetch wrapper for the backend in server/. No secrets live here — the
// only thing the client ever holds is a short-lived session token obtained
// after a successful biometric login (see services/auth.js).
import { getToken, clearToken } from './session.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  let json = null
  try {
    json = await res.json()
  } catch {
    /* empty body is fine for some responses */
  }

  if (res.status === 401 && auth) {
    // Session expired/invalid — force back to the lock screen rather than
    // silently limping along with stale data.
    clearToken()
  }

  if (!res.ok) {
    throw new ApiError(json?.error || `Request failed (${res.status})`, res.status)
  }

  return json
}

export const api = {
  health: () => request('/api/health', { auth: false }),

  authStatus: () => request('/api/auth/status', { auth: false }),
  registerOptions: () => request('/api/auth/register/options', { method: 'POST' }),
  registerVerify: (body) => request('/api/auth/register/verify', { method: 'POST', body }),
  loginOptions: () => request('/api/auth/login/options', { method: 'POST', auth: false }),
  loginVerify: (body) => request('/api/auth/login/verify', { method: 'POST', body, auth: false }),
  deviceRegister: () => request('/api/auth/device/register', { method: 'POST' }),
  deviceLogin: (secret) =>
    request('/api/auth/device/login', { method: 'POST', body: { secret }, auth: false }),

  listAccounts: () => request('/api/accounts'),
  listInstitutions: () => request('/api/accounts/institutions'),
  createLinkToken: () => request('/api/accounts/link-token', { method: 'POST' }),
  exchangeToken: (body) => request('/api/accounts/exchange', { method: 'POST', body }),
  removeAccount: (id) => request(`/api/accounts/${id}`, { method: 'DELETE' }),
  refresh: () => request('/api/accounts/refresh', { method: 'POST' }),
}

export { ApiError }
