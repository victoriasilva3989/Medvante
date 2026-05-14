import { Router } from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { authMiddleware } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { registerSchema, loginSchema, refreshSchema } from '../schemas/auth.schema.js'
import { loginLimiter, checkLoginBruteForce, recordLoginAttempt } from '../middleware/rateLimiter.js'
import { securityLogger } from '../utils/logger.js'
import { query } from '../config/database.js'

export const authRouter = Router()

const SECRET: string = process.env.JWT_SECRET || ''
const REFRESH_SECRET: string = process.env.REFRESH_TOKEN_SECRET || (SECRET + '-refresh')

const revokedTokens = new Set<string>()
const USERS: Record<string, { password: string; nome: string; role: 'admin' | 'doctor' | 'support' | 'producer' }> = {}

function getIp(req: import('express').Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown'
}

async function registrarAuditoria(
  usuarioId: string | null,
  acao: string,
  detalhes: string,
  ip: string,
  empresaId?: string
): Promise<void> {
  try {
    await query(
      `INSERT INTO auditoria (usuario_id, acao, detalhes, ip, empresa_id) VALUES ($1, $2, $3, $4, $5)`,
      [usuarioId, acao, detalhes, ip, empresaId || null]
    )
  } catch {
    // auditoria não deve quebrar a request
  }
}

authRouter.post('/register', validateBody(registerSchema), async (req, res) => {
  const { email, password, nome, role } = req.body
  const ip = getIp(req)

  if (USERS[email]) {
    securityLogger.warn(`REGISTER_DUPLICATE: IP ${ip} tentou registrar email já existente ${email}`)
    res.status(409).json({ error: 'Email já cadastrado' })
    return
  }

  USERS[email] = { password, nome, role: role || 'doctor' }

  securityLogger.info(`REGISTER_OK: IP ${ip} registrou usuário ${email}`)
  res.status(201).json({ message: 'Usuário cadastrado com sucesso' })
})

authRouter.post('/login', loginLimiter, checkLoginBruteForce, validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body
  const ip = getIp(req)

  const user = USERS[email]
  if (!user || user.password !== password) {
    recordLoginAttempt(ip, false)
    securityLogger.warn(`LOGIN_FAIL: IP ${ip} - tentativa inválida para ${email}`)
    await registrarAuditoria(null, 'LOGIN_FALHA', `Tentativa de login para ${email}`, ip)
    res.status(401).json({ error: 'Credenciais inválidas' })
    return
  }

  recordLoginAttempt(ip, true)

  const token = jwt.sign(
    { sub: email, role: user.role, nome: user.nome, empresaId: null },
    SECRET,
    { expiresIn: '8h' }
  )

  const refreshToken = crypto.randomBytes(40).toString('hex')
  const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  try {
    await query(
      `INSERT INTO sessoes (usuario_id, token, refresh_token, refresh_expira_em, ip, user_agent, empresa_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [email, token, refreshToken, refreshExpires, ip, req.headers['user-agent'] || null, null]
    )
  } catch {
    // se tabela não existir, segue sem persistir sessão
  }

  securityLogger.info(`LOGIN_OK: IP ${ip} - usuário ${email} autenticado`)
  await registrarAuditoria(email, 'LOGIN', 'Login realizado com sucesso', ip)

  res.json({
    token,
    refreshToken,
    user: { email, nome: user.nome, role: user.role },
  })
})

authRouter.post('/refresh', validateBody(refreshSchema), async (req, res) => {
  const { refreshToken } = req.body
  const ip = getIp(req)

  try {
    const result = await query(
      `SELECT usuario_id, token FROM sessoes WHERE refresh_token = $1 AND refresh_expira_em > NOW() AND revoked = false`,
      [refreshToken]
    )

    if (result.rows.length === 0) {
      securityLogger.warn(`REFRESH_FAIL: IP ${ip} - refresh token inválido ou expirado`)
      res.status(401).json({ error: 'Refresh token inválido ou expirado' })
      return
    }

    const { usuario_id: email, token: oldToken } = result.rows[0]
    const user = USERS[email]
    if (!user) {
      res.status(401).json({ error: 'Usuário não encontrado' })
      return
    }

    revokedTokens.add(oldToken)

    const newToken = jwt.sign(
      { sub: email, role: user.role, nome: user.nome, empresaId: null },
      SECRET,
      { expiresIn: '8h' }
    )

    const newRefreshToken = crypto.randomBytes(40).toString('hex')
    const newRefreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    await query(
      `UPDATE sessoes SET revoked = true WHERE refresh_token = $1`,
      [refreshToken]
    )

    await query(
      `INSERT INTO sessoes (usuario_id, token, refresh_token, refresh_expira_em, ip, user_agent, empresa_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [email, newToken, newRefreshToken, newRefreshExpires, ip, req.headers['user-agent'] || null, null]
    )

    securityLogger.info(`REFRESH_OK: IP ${ip} - token renovado para ${email}`)
    res.json({ token: newToken, refreshToken: newRefreshToken })
  } catch {
    res.status(500).json({ error: 'Erro ao renovar token' })
  }
})

authRouter.post('/logout', authMiddleware, async (req, res) => {
  const ip = getIp(req)
  const token = req.headers.authorization?.slice(7) || ''

  revokedTokens.add(token)

  try {
    await query(
      `UPDATE sessoes SET revoked = true WHERE token = $1`,
      [token]
    )
  } catch {
    // continua mesmo sem banco
  }

  securityLogger.info(`LOGOUT: IP ${ip} - usuário ${(req.user as any)?.sub} realizou logout`)
  await registrarAuditoria((req.user as any)?.sub || null, 'LOGOUT', 'Logout realizado', ip)

  res.json({ message: 'Logout realizado com sucesso' })
})

export function isTokenRevoked(token: string): boolean {
  return revokedTokens.has(token)
}
