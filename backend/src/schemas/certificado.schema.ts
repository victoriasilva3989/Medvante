import { z } from 'zod'

export const uploadCertificadoSchema = z.object({
  senha: z.string().min(1, 'Senha do certificado é obrigatória').max(256),
})

const PFX_EXTENSIONS = ['.pfx', '.p12']

export const certificadoFileSchema = z.object({
  fieldname: z.literal('file'),
  originalname: z.string().refine(
    (name) => {
      const lower = name.toLowerCase()
      return PFX_EXTENSIONS.some((ext) => lower.endsWith(ext))
    },
    { message: 'Apenas arquivos .pfx ou .p12 são permitidos' }
  ).refine(
    (name) => {
      return !name.includes('..') && !name.includes('/') && !name.includes('\\')
    },
    { message: 'Nome de arquivo inválido' }
  ),
  size: z.number().max(5 * 1024 * 1024, 'Arquivo deve ter no máximo 5MB'),
  mimetype: z.string().optional(),
  buffer: z.instanceof(Buffer).optional(),
})

export type CertificadoUpload = z.infer<typeof uploadCertificadoSchema>
