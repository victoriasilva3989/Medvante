import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { iniciarConsentimento, obterSaldo, obterTransacoes } from '../services/openfinance.js'

export const openFinanceRouter = Router()

openFinanceRouter.use(authMiddleware)

openFinanceRouter.post('/consentimento', async (req, res) => {
  try {
    const { instituicao } = req.body
    if (!instituicao) {
      res.status(400).json({ error: 'Instituição é obrigatória' })
      return
    }

    const url = await iniciarConsentimento(instituicao)
    res.json({ redirectUrl: url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao iniciar consentimento'
    res.status(500).json({ error: message })
  }
})

openFinanceRouter.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query
    if (!code || !state) {
      res.status(400).json({ error: 'Código de autorização ausente' })
      return
    }
    res.json({ message: 'Conta conectada com sucesso' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro no callback'
    res.status(500).json({ error: message })
  }
})

openFinanceRouter.get('/saldos', async (req, res) => {
  try {
    const saldos = await obterSaldo()
    res.json(saldos)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao obter saldos'
    res.status(500).json({ error: message })
  }
})

openFinanceRouter.get('/transacoes', async (req, res) => {
  try {
    const { dataInicio, dataFim, contaId } = req.query
    const transacoes = await obterTransacoes({
      dataInicio: dataInicio as string | undefined,
      dataFim: dataFim as string | undefined,
      contaId: contaId as string | undefined,
    })
    res.json(transacoes)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao obter transações'
    res.status(500).json({ error: message })
  }
})
