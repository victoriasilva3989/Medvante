import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { enviarNfeSaidaSchema } from '../schemas/nfe.schema.js'
import { enviarNfe, calcularDANFE } from '../services/sefaz.js'
import { securityLogger } from '../utils/logger.js'
import { query } from '../config/database.js'

export const nfeRouter = Router()

nfeRouter.use(authMiddleware)

nfeRouter.post('/emitir', validateBody(enviarNfeSaidaSchema), async (req, res) => {
  try {
    const { tomador, cpfCnpj, descricao, valor, quantidade } = req.body
    const empresaId = req.user?.sub

    if (!empresaId) {
      res.status(400).json({ error: 'Empresa não identificada' })
      return
    }

    const resultado = await enviarNfe({ empresaId, tomador, cpfCnpj, descricao, valor, quantidade })

    if (!resultado.success) {
      securityLogger.warn(`NFE_EMITIR_FAIL: empresa ${empresaId} - ${resultado.error}`)
      try {
        await query(
          `INSERT INTO auditoria (usuario_id, acao, detalhes, ip, empresa_id)
           VALUES ($1, $2, $3, $4, $5)`,
          [empresaId, 'NFE_EMISSAO_FALHA', `Falha ao emitir NF-e: ${resultado.error}`, req.ip, empresaId]
        )
      } catch { /* ok */ }
      res.status(422).json({ error: resultado.error, protocolo: resultado.protocolo })
      return
    }

    securityLogger.info(`NFE_EMITIR_OK: empresa ${empresaId} - chave ${resultado.chaveAcesso}`)
    try {
      await query(
        `INSERT INTO auditoria (usuario_id, acao, detalhes, ip, empresa_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [empresaId, 'NFE_EMISSAO', `NF-e emitida: ${resultado.chaveAcesso}`, req.ip, empresaId]
      )
    } catch { /* ok */ }

    res.status(201).json(resultado)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno ao emitir NF-e'
    securityLogger.error(`NFE_EMITIR_ERROR: ${message}`)
    res.status(500).json({ error: message })
  }
})

nfeRouter.get('/danfe/:chaveAcesso', async (req, res) => {
  try {
    const pdf = await calcularDANFE(req.params.chaveAcesso)
    res.setHeader('Content-Type', 'application/pdf')
    res.send(pdf)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao gerar DANFE'
    res.status(500).json({ error: message })
  }
})
