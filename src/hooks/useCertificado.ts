import { useState, useCallback } from 'react'
import { get } from '../services/api'

interface CertificadoInfo {
  id: string
  nome_titular: string
  emissor: string
  validade_fim: string
  tipo: string
  ativo: boolean
  criado_em: string
}

interface UploadResult {
  id: string
  nome_titular: string
  emissor: string
  validade_fim: string
  tipo: string
}

export function useCertificados() {
  const [data, setData] = useState<CertificadoInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await get<CertificadoInfo[]>('/api/certificado')
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao listar certificados')
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, fetch }
}

export function useUploadCertificado() {
  const [loading, setLoading] = useState(false)

  const upload = useCallback(async (file: File, senha: string): Promise<UploadResult> => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('arquivo', file)
      formData.append('senha', senha)

      const { data } = await import('../services/api').then(m =>
        m.api.post<UploadResult>('/api/certificado/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      )
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  return { upload, loading }
}
