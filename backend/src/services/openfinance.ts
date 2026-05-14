import axios from 'axios'
import { readFileSync } from 'fs'
import * as forge from 'node-forge'

const CLIENT_ID = process.env.OF_CLIENT_ID || ''
const CLIENT_SECRET = process.env.OF_CLIENT_SECRET || ''
const CERT_PATH = process.env.OF_CERT_PATH
const CERT_PASSWORD = process.env.OF_CERT_PASSWORD || ''
const REDIRECT_URI = process.env.OF_REDIRECT_URI || 'http://localhost:3000/api/openfinance/callback'

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

let accessToken: string | null = null
let tokenExpiresAt = 0

function getHttpsAgent() {
  if (!CERT_PATH) return undefined

  const buffer = readFileSync(CERT_PATH)
  const p12 = forge.pkcs12.pkcs12FromAsn1(
    forge.asn1.fromDer(forge.util.createBuffer(buffer)),
    CERT_PASSWORD
  )
  const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag] || []
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] || []

  if (!keyBags.length || !certBags.length) return undefined

  const key = keyBags[0].key
  const cert = certBags[0].cert
  if (!key || !cert) return undefined

  return {
    key: forge.pki.privateKeyToPem(key),
    cert: forge.pki.certificateToPem(cert),
  }
}

async function obterToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken
  }

  const url = 'https://auth.openfinancebrasil.org.br/auth/realms/openfinance/protocol/openid-connect/token'

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'openid accounts',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  })

  try {
    const response = await axios.post<TokenResponse>(url, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000,
    })

    accessToken = response.data.access_token
    tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000
    return accessToken
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number }; message?: string }
    throw new Error(`Falha na autenticação Open Finance: ${axiosErr?.message || 'Erro desconhecido'}`)
  }
}

export async function iniciarConsentimento(instituicao: string): Promise<string> {
  const token = await obterToken()

  const url = 'https://api.openfinancebrasil.org.br/consents/v1/consents'

  const body = {
    data: {
      loggedUser: { document: { identification: CLIENT_ID, type: 'CNPJ' } },
      businessEntity: null,
      permissions: [
        'ACCOUNTS_READ',
        'ACCOUNTS_BALANCES_READ',
        'ACCOUNTS_TRANSACTIONS_READ',
      ],
    },
  }

  try {
    const response = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })

    const consentId = response.data?.data?.consentId
    if (!consentId) throw new Error('Resposta inválida do BCB')

    return `https://auth.openfinancebrasil.org.br/auth/realms/openfinance/login-consent?consentId=${consentId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number }; message?: string }
    throw new Error(`Falha ao criar consentimento: ${axiosErr?.message || 'Erro desconhecido'}`)
  }
}

export async function obterSaldo(): Promise<{ contaId: string; saldo: number; data: string }[]> {
  const token = await obterToken()

  try {
    const response = await axios.get('https://api.openfinancebrasil.org.br/accounts/v1/accounts', {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    })

    const contas = response.data?.data || []
    const saldos = await Promise.all(
      contas.map(async (conta: { accountId: string }) => {
        try {
          const bal = await axios.get(
            `https://api.openfinancebrasil.org.br/accounts/v1/accounts/${conta.accountId}/balances`,
            { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
          )
          return {
            contaId: conta.accountId,
            saldo: bal.data?.data?.availableAmount || 0,
            data: new Date().toISOString(),
          }
        } catch {
          return { contaId: conta.accountId, saldo: 0, data: new Date().toISOString() }
        }
      })
    )

    return saldos
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number }; message?: string }
    throw new Error(`Falha ao obter saldos: ${axiosErr?.message || 'Erro desconhecido'}`)
  }
}

interface TransacoesParams {
  dataInicio?: string
  dataFim?: string
  contaId?: string
}

export async function obterTransacoes(params: TransacoesParams): Promise<unknown[]> {
  const token = await obterToken()

  const query = new URLSearchParams()
  if (params.dataInicio) query.set('fromBookingDate', params.dataInicio)
  if (params.dataFim) query.set('toBookingDate', params.dataFim)

  try {
    const response = await axios.get(
      `https://api.openfinancebrasil.org.br/accounts/v1/accounts/${params.contaId || 'all'}/transactions`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: query,
        timeout: 10000,
      }
    )
    return response.data?.data || []
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number }; message?: string }
    throw new Error(`Falha ao obter transações: ${axiosErr?.message || 'Erro desconhecido'}`)
  }
}
