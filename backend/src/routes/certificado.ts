import { Router } from 'express'
import multer from 'multer'
import { authMiddleware } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { uploadCertificadoSchema } from '../schemas/certificado.schema.js'
import { uploadCertLimiter } from '../middleware/rateLimiter.js'
import { lerPfx, listarCertificados, removerCertificado } from '../services/certificado.js'
import { encryptCertFile, validateFileName, listEncryptedFiles, removeEncryptedFile } from '../services/certEncryption.js'
import { securityLogger } from '../utils/logger.js'
import { query } from '../config/database.js'

export const certificadoRouter = Router()

const MAX_SIZE = 5 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    const ok = file.originalname.toLowerCase().endsWith('.pfx') || file.originalname.toLowerCase().endsWith('.p12')
    cb(null, ok)
  },
})

certificadoRouter.use(authMiddleware)

certificadoRouter.post('/upload', uploadCertLimiter, upload.single('certificado'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Arquivo de certificado é obrigatório (.pfx ou .p12, máximo 5MB)' })
      return
    }

    const { senha } = uploadCertificadoSchema.parse(req.body)
    const safeName = validateFileName(req.file.originalname)
    const empresaId = req.user?.empresaId || req.user?.sub || 'unknown'

    const encryptedFile = encryptCertFile(req.file.buffer, empresaId)

    const info = await lerPfx(req.file.buffer, senha)

    try {
      await query(
        `INSERT INTO certificados (empresa_id, nome, emissor, valido_ate, dias_restantes, tipo, ambiente, status, arquivo_criptografado)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (empresa_id, nome) DO UPDATE SET
           emissor = EXCLUDED.emissor,
           valido_ate = EXCLUDED.valido_ate,
           dias_restantes = EXCLUDED.dias_restantes,
           tipo = EXCLUDED.tipo,
           ambiente = EXCLUDED.ambiente,
           status = EXCLUDED.status,
           arquivo_criptografado = EXCLUDED.arquivo_criptografado`,
        [empresaId, info.nome, info.emissor, info.validoAte, info.diasRestantes, info.tipo, info.ambiente, info.status, encryptedFile]
      )
    } catch (dbErr) {
      securityLogger.error(`CERT_DB_INSERT_FAIL: ${empresaId} - ${(dbErr as Error).message}`)
    }

    securityLogger.info(`CERT_UPLOAD: empresa ${empresaId} - ${info.nome} - valido até ${info.validoAte}`)

    res.status(201).json({
      message: 'Certificado importado com sucesso',
      certificado: { ...info, arquivo: undefined, path: undefined },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao processar certificado'
    res.status(422).json({ error: message })
  }
})

certificadoRouter.get('/', async (_req, res) => {
  try {
    const lista = await listarCertificados()
    const safe = lista.map((c: any) => ({
      id: c.id,
      nome: c.nome,
      emissor: c.emissor,
      validoAte: c.validoAte,
      diasRestantes: c.diasRestantes,
      tipo: c.tipo,
      ambiente: c.ambiente,
      status: c.status,
      uploadEm: c.uploadEm,
    }))
    res.json(safe)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao listar certificados'
    res.status(500).json({ error: message })
  }
})

certificadoRouter.delete('/:id', async (req, res) => {
  try {
    const empresaId = req.user?.empresaId || req.user?.sub || 'unknown'
    const encryptedFiles = listEncryptedFiles(empresaId)
    const target = encryptedFiles.find(f => f.startsWith(req.params.id))

    if (target) {
      removeEncryptedFile(target)
    }

    await removerCertificado(req.params.id)

    securityLogger.info(`CERT_REMOVE: empresa ${empresaId} - id ${req.params.id}`)
    res.json({ message: 'Certificado removido' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao remover certificado'
    res.status(500).json({ error: message })
  }
})
