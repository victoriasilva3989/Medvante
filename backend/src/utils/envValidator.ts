export function validateEnv(): void {
  const required: string[] = [
    'DATABASE_URL',
    'JWT_SECRET',
    'CERT_ENCRYPTION_KEY',
  ]

  let missing = false
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`[ENV] ERRO: Variável de ambiente ${key} não configurada`)
      missing = true
    }
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error('[ENV] ERRO: JWT_SECRET deve ter no mínimo 32 caracteres')
    missing = true
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.FRONTEND_URL) {
      console.warn('[ENV] AVISO: FRONTEND_URL não configurada. CORS pode bloquear o frontend.')
      console.warn('[ENV] Configure FRONTEND_URL com a URL do Vercel após o deploy do frontend.')
    }
  }

  if (missing) {
    console.error('[ENV] Verificação de ambiente falhou. Encerrando aplicação.')
    process.exit(1)
  }

  console.log('[ENV] Todas as variáveis de ambiente obrigatórias estão configuradas')
}
