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

const revokedTokens = new Set<string>()

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
    /* silent */
  }
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const computed = crypto.scryptSync(password, salt, 64).toString('hex')
  return computed === hash
}

authRouter.post('/register', validateBody(registerSchema), async (req, res) => {
  const { email, password, nome, role } = req.body
  const ip = getIp(req)

  const dbUrl = (process.env.DATABASE_URL || '(not set)').slice(0, 30) + '...'
  console.log(`[auth/register] DATABASE_URL prefix: ${dbUrl} | email: ${email} | NODE_ENV: ${process.env.NODE_ENV || 'development'}`)

  try {
    const existing = await query('SELECT id FROM usuarios WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      securityLogger.warn(`REGISTER_DUPLICATE: IP ${ip} tentou registrar email já existente ${email}`)
      res.status(409).json({ error: 'Email já cadastrado' })
      return
    }

    const senhaHash = hashPassword(password)

    const result = await query(
      `INSERT INTO usuarios (nome, email, senha_hash, role) VALUES ($1, $2, $3, $4)
       RETURNING id, nome, email, role, criado_em`,
      [nome, email, senhaHash, role || 'user']
    )

    securityLogger.info(`REGISTER_OK: IP ${ip} registrou usuário ${email}`)
    await registrarAuditoria(result.rows[0].id, 'REGISTER', 'Usuário cadastrado', ip)

    res.status(201).json({ message: 'Usuário cadastrado com sucesso' })
  } catch (err) {
    securityLogger.error(`REGISTER_ERROR: IP ${ip} - ${(err as Error).message}`)
    res.status(500).json({ error: 'Erro ao cadastrar usuário' })
  }
})

authRouter.post('/login', loginLimiter, checkLoginBruteForce, validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body
  const ip = getIp(req)

  try {
    const result = await query(
      'SELECT id, nome, email, senha_hash, role, empresa_id FROM usuarios WHERE email = $1 AND ativo = true',
      [email]
    )

    if (result.rows.length === 0) {
      recordLoginAttempt(ip, false)
      securityLogger.warn(`LOGIN_FAIL: IP ${ip} - tentativa inválida para ${email}`)
      await registrarAuditoria(null, 'LOGIN_FALHA', `Tentativa de login para ${email}`, ip)
      res.status(401).json({ error: 'Credenciais inválidas' })
      return
    }

    const user = result.rows[0]

    if (!verifyPassword(password, user.senha_hash)) {
      recordLoginAttempt(ip, false)
      securityLogger.warn(`LOGIN_FAIL: IP ${ip} - senha inválida para ${email}`)
      await registrarAuditoria(user.id, 'LOGIN_FALHA', 'Senha inválida', ip)
      res.status(401).json({ error: 'Credenciais inválidas' })
      return
    }

    recordLoginAttempt(ip, true)

    await query('UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = $1', [user.id])

    const token = jwt.sign(
      { sub: user.id, role: user.role, nome: user.nome, empresaId: user.empresa_id || null },
      SECRET,
      { expiresIn: '8h' }
    )

    const refreshToken = crypto.randomBytes(40).toString('hex')
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    try {
      await query(
        `INSERT INTO sessoes (usuario_id, token_hash, expira_em, ip_origem, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, token, refreshExpires, ip, req.headers['user-agent'] || null]
      )
    } catch {
      /* silent */
    }

    securityLogger.info(`LOGIN_OK: IP ${ip} - usuário ${user.email} autenticado`)
    await registrarAuditoria(user.id, 'LOGIN', 'Login realizado com sucesso', ip)

    res.json({
      token,
      refreshToken,
      user: { email: user.email, nome: user.nome, role: user.role },
    })
  } catch (err) {
    securityLogger.error(`LOGIN_ERROR: ${(err as Error).message}`)
    res.status(500).json({ error: 'Erro interno no login' })
  }
})

authRouter.post('/refresh', validateBody(refreshSchema), async (req, res) => {
  const { refreshToken } = req.body
  const ip = getIp(req)

  try {
    const sessionResult = await query(
      `SELECT s.usuario_id, s.token_hash
       FROM sessoes s
       WHERE s.refresh_token = $1 AND s.expira_em > NOW() AND s.revogado = false`,
      [refreshToken]
    )

    if (sessionResult.rows.length === 0) {
      securityLogger.warn(`REFRESH_FAIL: IP ${ip} - refresh token inválido ou expirado`)
      res.status(401).json({ error: 'Refresh token inválido ou expirado' })
      return
    }

    const { usuario_id: userId } = sessionResult.rows[0]

    const userResult = await query(
      'SELECT id, nome, email, role, empresa_id FROM usuarios WHERE id = $1 AND ativo = true',
      [userId]
    )

    if (userResult.rows.length === 0) {
      res.status(401).json({ error: 'Usuário não encontrado' })
      return
    }

    const user = userResult.rows[0]

    revokedTokens.add(sessionResult.rows[0].token_hash)

    const newToken = jwt.sign(
      { sub: user.id, role: user.role, nome: user.nome, empresaId: user.empresa_id || null },
      SECRET,
      { expiresIn: '8h' }
    )

    const newRefreshToken = crypto.randomBytes(40).toString('hex')
    const newRefreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    await query('UPDATE sessoes SET revogado = true WHERE refresh_token = $1', [refreshToken])

    await query(
      `INSERT INTO sessoes (usuario_id, token_hash, expira_em, ip_origem, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, newToken, newRefreshExpires, ip, req.headers['user-agent'] || null]
    )

    securityLogger.info(`REFRESH_OK: IP ${ip} - token renovado para ${user.email}`)
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
    await query('UPDATE sessoes SET revogado = true WHERE token_hash = $1', [token])
  } catch {
    /* silent */
  }

  securityLogger.info(`LOGOUT: IP ${ip} - usuário ${(req.user as any)?.sub} realizou logout`)
  await registrarAuditoria((req.user as any)?.sub || null, 'LOGOUT', 'Logout realizado', ip)

  res.json({ message: 'Logout realizado com sucesso' })
})

export function isTokenRevoked(token: string): boolean {
  return revokedTokens.has(token)
}
