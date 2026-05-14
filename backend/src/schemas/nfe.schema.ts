import { z } from 'zod'

export const enviarNfeSaidaSchema = z.object({
  chave: z.string().length(44, 'Chave de acesso deve ter 44 dígitos'),
  uf: z.string().length(2, 'UF deve ter 2 caracteres').toUpperCase(),
})

export const consultarNfeSchema = z.object({
  chave: z.string().length(44, 'Chave de acesso deve ter 44 dígitos'),
})

export const cancelarNfeSchema = z.object({
  chave: z.string().length(44, 'Chave de acesso deve ter 44 dígitos'),
  justificativa: z.string().min(15, 'Justificativa deve ter no mínimo 15 caracteres').max(255),
})

export const vasculharNfeSchema = z.object({
  empresaId: z.string().uuid('ID da empresa inválido').optional(),
})
