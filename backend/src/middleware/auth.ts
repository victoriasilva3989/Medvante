import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { isTokenRevoked } from '../routes/auth.js'

export interface JwtPayload {
  sub: string
  role: 'admin' | 'doctor' | 'support' | 'producer'
  nome: string
  empresaId: string | null
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

const SECRET: string = process.env.JWT_SECRET || ''
if (!SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token ausente' })
    return
  }

  const token = header.slice(7)

  if (isTokenRevoked(token)) {
    res.status(401).json({ error: 'Token revogado' })
    return
  }

  try {
    const payload = jwt.verify(token, SECRET) as unknown as JwtPayload
    if (!payload.role || !payload.nome) {
      res.status(401).json({ error: 'Token inválido' })
      return
    }
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}
