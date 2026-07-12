import { config } from '../config.js'
import * as mockProvider from './mockProvider.js'
import * as plaidProvider from './plaidProvider.js'

const providers = {
  mock: mockProvider,
  plaid: plaidProvider,
  // Add truelayer.js / tink.js the same way once you pick one — every
  // provider module implements the same four functions, so nothing else
  // in the app needs to change.
}

export function getProvider() {
  const provider = providers[config.bankProvider]
  if (!provider) {
    throw new Error(`Unknown BANK_PROVIDER "${config.bankProvider}". Valid: ${Object.keys(providers).join(', ')}`)
  }
  return provider
}
