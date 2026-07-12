import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { config } from './config.js'
import { authRouter } from './routes/auth.js'
import { accountsRouter } from './routes/accounts.js'
import { apiLimiter } from './middleware/rateLimiters.js'

const app = express()

// Never trust the client for anything not verified server-side; these are
// the baseline hardening measures for a small personal-finance API.
app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(helmet())
app.use(
  cors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)
app.use(express.json({ limit: '100kb' })) // small cap — this API never needs large payloads

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use('/api/auth', authRouter)
app.use('/api/accounts', apiLimiter, accountsRouter)

// Centralized error handler — never leak stack traces or internals to the
// client, log server-side only.
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(config.port, () => {
  console.log(`Vibrant Wallet API listening on http://localhost:${config.port} (provider: ${config.bankProvider})`)
})
