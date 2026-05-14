import rateLimit from 'express-rate-limit'
import type { Request, Response, NextFunction } from 'express'
import { securityLogger, errorLogger } from '../utils/logger.js'

function getIp(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown'
}

function createAuditLog(action: string, req: Request, motivo: string): void {
  const ip = getIp(req)
  const empresaId = (req as any).user?.empresaId || req.body?.empresaId || 'unknown'
  securityLogger.warn(`RATE_LIMIT: ${action} | IP: ${ip} | Empresa: ${empresaId} | Motivo: ${motivo}`)
}

async function logRateLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
  const ip = getIp(req)
  const empresaId = (req as any).user?.empresaId || 'unknown'
  securityLogger.warn(`RATE_LIMIT: ${req.path} | IP: ${ip} | Empresa: ${empresaId}`)

  res.status(429).json({
    error: 'Muitas requisições. Tente novamente mais tarde.',
  })
}

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logRateLimit(req, res, () => {})
  },
  skipSuccessfulRequests: false,
})

export const loginBlockedIps = new Map<string, { count: number; blockedUntil: number }>()

export function checkLoginBruteForce(req: Request, res: Response, next: NextFunction): void {
  const ip = getIp(req)
  const record = loginBlockedIps.get(ip)

  if (record && record.blockedUntil > Date.now()) {
    securityLogger.warn(`LOGIN_BLOCKED: IP ${ip} bloqueado até ${new Date(record.blockedUntil).toISOString()}`)
    res.status(429).json({ error: 'Muitas tentativas de login. Tente novamente em 1 hora.' })
    return
  }

  next()
}

export function recordLoginAttempt(ip: string, success: boolean): void {
  const record = loginBlockedIps.get(ip) || { count: 0, blockedUntil: 0 }

  if (success) {
    loginBlockedIps.delete(ip)
    return
  }

  record.count += 1

  if (record.count >= 5) {
    record.blockedUntil = Date.now() + 60 * 60 * 1000
    securityLogger.warn(`LOGIN_BLOCKED: IP ${ip} bloqueado por 1h após ${record.count} tentativas falhas`)
  } else if (record.count >= 3) {
    const delay = 2000
    const start = Date.now()
    while (Date.now() - start < delay) { /* busy wait */ }
    securityLogger.warn(`LOGIN_DELAY: IP ${ip} atrasado ${delay}ms (${record.count} tentativas falhas)`)
  }

  loginBlockedIps.set(ip, record)
}

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: logRateLimit,
})

export const uploadCertLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const empresaId = (req as any).user?.empresaId || 'global'
    return `upload_cert_${empresaId}`
  },
  handler: logRateLimit,
})

export const nfeScanLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const empresaId = (req as any).user?.empresaId || 'global'
    return `nfe_scan_${empresaId}`
  },
  handler: logRateLimit,
})
