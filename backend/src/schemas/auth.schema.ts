import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').max(128),
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(255),
  role: z.enum(['admin', 'doctor', 'support', 'producer']).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(1, 'Senha é obrigatória').max(128),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
})
