import { z } from 'zod'

export const criarEmpresaSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(255),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos numéricos'),
  uf: z.string().length(2, 'UF deve ter 2 caracteres').toUpperCase(),
  cep: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos').optional(),
  cidade: z.string().max(255).optional(),
  logradouro: z.string().max(255).optional(),
  numero: z.string().max(20).optional(),
  bairro: z.string().max(255).optional(),
  telefone: z.string().max(20).optional(),
  email: z.string().email('Email inválido').max(255).optional(),
  regimeTributario: z.enum(['1', '2', '3']).optional(),
})

export const atualizarEmpresaSchema = criarEmpresaSchema.partial()
