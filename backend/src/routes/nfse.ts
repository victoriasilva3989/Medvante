import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { emitirNfse } from '../services/nfse.js'
import { query } from '../db/connection.js'
import { securityLogger } from '../utils/logger.js'
import { z } from 'zod'

export const nfseRouter = Router()

const emitirNfseSchema = z.object({
  tomador: z.string().min(2, 'Tomador é obrigatório').max(255),
  cpfCnpj: z.string().min(11, 'CPF/CNPJ inválido').max(18),
  descricao: z.string().min(2, 'Descrição é obrigatória').max(500),
  valor: z.coerce.number().positive('Valor deve ser positivo'),
  servicoCodigo: z.string().max(20).optional(),
  issAliquota: z.coerce.number().min(0).max(100).optional(),
  competencia: z.string().regex(/^\d{4}-\d{2}$/, 'Competência deve ser YYYY-MM').optional(),
})

nfseRouter.use(authMiddleware)

nfseRouter.post('/emitir', validateBody(emitirNfseSchema), async (req, res) => {
  try {
    const empresaId = req.user!.sub
    const result = await emitirNfse({
      empresaId,
      ...req.body,
    })

    if (!result.success) {
      securityLogger.warn(`NFSE_EMITIR_FAIL: empresa ${empresaId} - ${result.error}`)
      res.status(422).json({ error: result.error })
      return
    }

    securityLogger.info(`NFSE_EMITIR_OK: empresa ${empresaId} - NFS-e ${result.numero}`)
    res.status(201).json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno ao emitir NFSe'
    securityLogger.error(`NFSE_EMITIR_ERROR: ${message}`)
    res.status(500).json({ error: message })
  }
})

nfseRouter.get('/', async (_req, res) => {
  try {
    const result = await query(
      'SELECT * FROM nfse_saida ORDER BY created_at DESC LIMIT 100'
    )
    res.json(result.rows)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao listar NFSe'
    res.status(500).json({ error: message })
  }
})
