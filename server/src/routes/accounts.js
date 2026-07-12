import { Router } from 'express'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { requireAuth } from '../middleware/auth.js'
import { getProvider } from '../providers/index.js'
import * as store from '../store.js'

export const accountsRouter = Router()
accountsRouter.use(requireAuth)

// The number of connected banks is always derived from this list's length
// on the client — nothing about "how many banks" is ever hardcoded.
accountsRouter.get('/', (req, res) => {
  res.json({ accounts: store.listPublicAccounts() })
})

// Step 1 of connecting a new bank: ask the provider for a link token.
accountsRouter.post('/link-token', async (req, res, next) => {
  try {
    const provider = getProvider()
    const result = await provider.createLinkToken('owner')
    res.json(result)
  } catch (err) {
    next(err)
  }
})

// The mock provider's picker list (a real Link SDK renders its own UI, so
// this is only meaningful while BANK_PROVIDER=mock).
accountsRouter.get('/institutions', async (req, res, next) => {
  try {
    const provider = getProvider()
    const institutions = provider.listInstitutions ? await provider.listInstitutions() : []
    res.json({ institutions })
  } catch (err) {
    next(err)
  }
})

const exchangeSchema = z.object({
  publicToken: z.string().min(1).max(200),
  institutionId: z.string().min(1).max(100).optional(),
})

// Step 2: exchange the provider's public token for a real access token +
// the newly connected account(s), then persist them. This is what makes a
// new bank actually show up — no app rebuild or hardcoded count involved.
accountsRouter.post('/exchange', async (req, res, next) => {
  const parsed = exchangeSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request body' })

  try {
    const provider = getProvider()
    const { publicToken, institutionId } = parsed.data
    const result = await provider.exchangePublicToken(publicToken, institutionId)

    store.addItem({
      itemId: nanoid(12),
      institutionName: result.institutionName,
      institutionId: result.institutionId,
      accessToken: result.accessToken, // encrypted at rest as part of the whole store file
      connectedAt: new Date().toISOString(),
      accounts: result.accounts,
    })

    res.status(201).json({ accounts: store.listPublicAccounts() })
  } catch (err) {
    next(err)
  }
})

// Disconnecting a bank (e.g. you closed the account) — the count adjusts
// itself automatically since the client just re-reads accounts.length.
accountsRouter.delete('/:id', (req, res) => {
  const removed = store.removeAccount(req.params.id)
  if (!removed) return res.status(404).json({ error: 'Account not found' })
  res.json({ accounts: store.listPublicAccounts() })
})

// Called exactly once per app open (see LoadingOverlay) — never polled in
// the background. Pulls fresh balances for every connected account.
accountsRouter.post('/refresh', async (req, res, next) => {
  try {
    const provider = getProvider()
    for (const item of store.listItems()) {
      for (const account of item.accounts) {
        const fresh = await provider.refreshAccount(item.accessToken, account)
        store.updateAccountBalance(account.id, fresh.balance)
      }
    }
    res.json({ accounts: store.listPublicAccounts() })
  } catch (err) {
    next(err)
  }
})
