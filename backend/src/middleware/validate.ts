import type { Request, Response, NextFunction } from 'express'
import { type ZodSchema, type ZodIssue } from 'zod'

function formatIssues(issues: ZodIssue[]) {
  return issues.map((e: ZodIssue) => ({
    campo: e.path.join('.'),
    mensagem: e.message,
  }))
}

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      res.status(400).json({ error: 'Dados inválidos', errors: formatIssues(result.error.issues) })
      return
    }
    req.body = result.data
    next()
  }
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      res.status(400).json({ error: 'Parâmetros inválidos', errors: formatIssues(result.error.issues) })
      return
    }
    (req.query as Record<string, unknown>) = result.data as Record<string, unknown>
    next()
  }
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params)
    if (!result.success) {
      res.status(400).json({ error: 'Parâmetros inválidos' })
      return
    }
    (req.params as Record<string, string>) = result.data as Record<string, string>
    next()
  }
}
