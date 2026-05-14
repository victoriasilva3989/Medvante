import type { Request, Response, NextFunction } from 'express'
import validator from 'validator'

const PROTO_PATTERN = /__proto__|constructor|prototype/i

export function sanitizeBody(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    sanitizeObject(req.body)
  }
  next()
}

function sanitizeObject(obj: Record<string, unknown>): void {
  for (const key of Object.keys(obj)) {
    if (PROTO_PATTERN.test(key)) {
      delete obj[key]
      continue
    }

    const val = obj[key]
    if (typeof val === 'string') {
      obj[key] = validator.trim(val)
    } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      sanitizeObject(val as Record<string, unknown>)
    } else if (Array.isArray(val)) {
      val.forEach((item, i) => {
        if (typeof item === 'object' && item !== null) {
          sanitizeObject(item)
        } else if (typeof item === 'string') {
          val[i] = validator.trim(item)
        }
      })
    }
  }
}

export function sanitizeParams(req: Request, _res: Response, next: NextFunction): void {
  for (const key of Object.keys(req.params)) {
    const val = req.params[key]
    if (val && typeof val === 'string') {
      req.params[key] = validator.trim(validator.escape(val))
    }
  }
  next()
}

export function sanitizeQuery(req: Request, _res: Response, next: NextFunction): void {
  for (const key of Object.keys(req.query)) {
    const val = req.query[key]
    if (typeof val === 'string') {
      req.query[key] = validator.trim(val)
    }
  }
  next()
}
