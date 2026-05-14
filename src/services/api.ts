import axios, { AxiosError } from 'axios'

const TOKEN_KEY = 'medvante-token'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    } else if (error.response?.status === 429) {
      console.warn('[api] Rate limit atingido')
    } else if (
      error.response?.status &&
      error.response.status >= 500
    ) {
      console.error('[api] Erro interno do servidor')
    }
    return Promise.reject(error)
  }
)

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await api.get<T>(url, { params })
  return data
}

export async function post<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.post<T>(url, body)
  return data
}

export async function put<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.put<T>(url, body)
  return data
}

export async function del<T>(url: string): Promise<T> {
  const { data } = await api.delete<T>(url)
  return data
}
