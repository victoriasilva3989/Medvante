import type { Request, Response, NextFunction } from 'express'

export function httpsMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV !== 'production') {
    next()
    return
  }

  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    next()
    return
  }

  res.redirect(301, `https://${req.hostname}${req.originalUrl}`)
}
