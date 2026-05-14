import { useState, useCallback } from 'react'
import { get, post } from '../services/api'

interface NFeEntrada {
  id: string
  chave_acesso: string
  nome_emitente: string
  valor_total: number
  data_emissao: string
  status: string
}

interface NFeSaida {
  id: string
  chave_acesso: string
  nome_destinatario: string
  valor_total: number
  data_emissao: string
  status: string
}

interface ScanResult {
  empresas: number
  novasNotas: number
  erros: number
}

export function useNFeEntrada() {
  const [data, setData] = useState<NFeEntrada[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await get<{ data: NFeEntrada[] }>('/api/nfe-entrada')
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar NF-e entrada')
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, fetch }
}

export function useNFeSaida() {
  const [data, setData] = useState<NFeSaida[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await get<NFeSaida[]>('/api/nfe')
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar NF-e saída')
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, fetch }
}

export function useVasculharNFe() {
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<ScanResult | null>(null)

  const trigger = useCallback(async () => {
    setLoading(true)
    try {
      const result = await post<ScanResult>('/api/nfe-entrada/vasculhar')
      setResultado(result)
      return result
    } finally {
      setLoading(false)
    }
  }, [])

  return { trigger, loading, resultado }
}
