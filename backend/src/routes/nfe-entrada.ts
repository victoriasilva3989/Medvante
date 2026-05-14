import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { validateQuery } from '../middleware/validate.js'
import { query } from '../db/connection.js'
import { executarVasculhagem } from '../jobs/vasculharNfe.js'
import { nfeScanLimiter } from '../middleware/rateLimiter.js'
import { securityLogger } from '../utils/logger.js'
import { z } from 'zod'

export const nfeEntradaRouter = Router()

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
})

nfeEntradaRouter.use(authMiddleware)

nfeEntradaRouter.get('/', validateQuery(paginationSchema), async (req, res) => {
  try {
    const { page, limit } = req.query as unknown as { page: number; limit: number }
    const offset = (page - 1) * limit

    const result = await query(
      'SELECT * FROM nfe_entrada ORDER BY data_emissao DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    )
    const count = await query('SELECT COUNT(*) FROM nfe_entrada')

    res.json({
      data: result.rows,
      total: parseInt(count.rows[0].count, 10),
      page,
      limit,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao listar NF-e entrada'
    res.status(500).json({ error: message })
  }
})

nfeEntradaRouter.get('/:id/itens', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM nfe_entrada_itens WHERE nfe_id = $1 ORDER BY codigo',
      [req.params.id]
    )
    res.json(result.rows)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao listar itens'
    res.status(500).json({ error: message })
  }
})

nfeEntradaRouter.post('/vasculhar', nfeScanLimiter, authMiddleware, async (req, res) => {
  try {
    const empresaId = req.user?.sub
    securityLogger.info(`NFE_SCAN: empresa ${empresaId} iniciou vasculhagem manual`)
    const result = await executarVasculhagem()
    res.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro na vasculhagem manual'
    res.status(500).json({ error: message })
  }
})
