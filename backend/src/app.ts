process.on('uncaughtException', (err) => {
  console.error('[FATAL] uncaughtException:', err?.stack || err)
})

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] unhandledRejection:', reason instanceof Error ? reason.stack : reason)
})

import 'dotenv/config'
import express from 'express'

import cors from 'cors'
import { validateEnv } from './utils/envValidator.js'
import { securityHeaders, removePoweredBy, additionalSecurityHeaders, noCacheApi } from './middleware/security.js'
import { sanitizeBody, sanitizeParams, sanitizeQuery } from './middleware/sanitize.js'
import { generalLimiter } from './middleware/rateLimiter.js'
import { authRouter } from './routes/auth.js'
import { nfeRouter } from './routes/nfe.js'
import { nfeEntradaRouter } from './routes/nfe-entrada.js'
import { nfseRouter } from './routes/nfse.js'
import { openFinanceRouter } from './routes/openfinance.js'
import { certificadoRouter } from './routes/certificado.js'
import { iniciarJob } from './jobs/vasculharNfe.js'
import { errorLogger } from './utils/logger.js'
import { runMigrations } from './migrations/run.js'

console.log('[app] starting MedVante backend...')
validateEnv()

const app = express()
const PORT = parseInt(process.env.PORT || '3000', 10)

console.log(`[app] PORT=${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`)

app.use(securityHeaders)
app.use(removePoweredBy)
app.use(additionalSecurityHeaders)
app.use(noCacheApi)
const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)

    const allowed = [
      'http://localhost:5173',
      process.env.FRONTEND_URL,
      'https://medvante-f8gd.vercel.app',
    ].filter(Boolean) as string[]

    if (allowed.includes(origin)) return callback(null, true)

    if (origin.endsWith('.vercel.app')) return callback(null, true)

    console.log(`[cors] blocked origin: ${origin}`)
    callback(null, false)
  },
  credentials: true,
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

app.use(express.json({ limit: '1mb' }))
app.use(sanitizeBody)
app.use(sanitizeParams)
app.use(sanitizeQuery)

app.use(generalLimiter)

app.get('/', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRouter)
app.use('/api/nfe', nfeRouter)
app.use('/api/nfe/entrada', nfeEntradaRouter)
app.use('/api/nfse', nfseRouter)
app.use('/api/openfinance', openFinanceRouter)
app.use('/api/certificado', certificadoRouter)

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  errorLogger.error('Unhandled error', { error: err.message, stack: err.stack })
  console.error('[app] unhandled error:', err.message)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

async function start(): Promise<void> {
  try {
    await runMigrations()
  } catch (err) {
    console.error('[app] migration error:', (err as Error).message)
  }

  const host = '0.0.0.0'
  const server = app.listen(PORT, host, () => {
    console.log(`[medvante-backend] running on ${host}:${PORT} (${process.env.NODE_ENV || 'development'})`)

    if (process.env.NODE_ENV === 'production' || process.env.START_JOBS === 'true') {
      iniciarJob()
    }
  })
}

start().catch((err) => {
  console.error('[app] fatal error:', err.message)
  process.exit(1)
})

export { app }
