import cron from 'node-cron'
import { query } from '../config/database.js'
import { vasculharNfeEntrada, salvarNotaEntrada } from '../services/nfe-entrada.js'
import { processarAutoLancamento } from '../services/auto-lancamento.js'

interface EmpresaScan {
  id: string
  cnpj: string
  uf: string
  razao_social: string
}

async function getEmpresasParaScan(): Promise<EmpresaScan[]> {
  const result = await query(
    `SELECT id, cnpj, uf, razao_social FROM empresas
     WHERE ativo = true AND cnpj IS NOT NULL AND cnpj != '' AND uf IS NOT NULL`
  )
  return result.rows as EmpresaScan[]
}

async function getUltimoNSU(empresaId: string): Promise<string> {
  const result = await query(
    "SELECT valor FROM _config WHERE chave = 'ultimo_nsu_' || $1",
    [empresaId]
  )
  return result.rows.length > 0 ? result.rows[0].valor : '0'
}

async function setUltimoNSU(empresaId: string, nsu: string): Promise<void> {
  const chave = `ultimo_nsu_${empresaId}`
  await query(
    `INSERT INTO _config (chave, valor) VALUES ($1, $2)
     ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor, atualizado_em = NOW()`,
    [chave, nsu]
  )
}

export async function executarVasculhagem(): Promise<{
  empresas: number
  notas: number
  erros: number
  detalhes: string[]
}> {
  const empresas = await getEmpresasParaScan()
  let totalNotas = 0
  let totalErros = 0
  const detalhes: string[] = []

  if (empresas.length === 0) {
    console.log('[vasculhagem] nenhuma empresa ativa com UF e CNPJ configurados')
    return { empresas: 0, notas: 0, erros: 0, detalhes: ['Nenhuma empresa ativa configurada'] }
  }

  for (const empresa of empresas) {
    try {
      const ultimoNSU = await getUltimoNSU(empresa.id)
      console.log(`[vasculhagem] UF=${empresa.uf} empresa=${empresa.razao_social} NSU=${ultimoNSU}`)

      const { notas, novoNSU } = await vasculharNfeEntrada(
        ultimoNSU,
        empresa.cnpj,
        empresa.uf
      )

      for (const nota of notas) {
        const criada = await salvarNotaEntrada(empresa.id, nota)
        if (criada) {
          totalNotas++
          await processarAutoLancamento(empresa.id, nota.chaveAcesso)
        }
      }

      await setUltimoNSU(empresa.id, novoNSU)
      detalhes.push(`${empresa.uf}/${empresa.razao_social}: ${notas.length} notas, novo NSU=${novoNSU}`)
    } catch (err) {
      totalErros++
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error(`[vasculhagem] erro ${empresa.uf}/${empresa.razao_social}:`, msg)
      detalhes.push(`${empresa.uf}/${empresa.razao_social}: ERRO - ${msg}`)
    }
  }

  return {
    empresas: empresas.length,
    notas: totalNotas,
    erros: totalErros,
    detalhes,
  }
}

export function iniciarJob(): void {
  console.log('[job] vasculhagem NF-e multi-UF agendada a cada 2 horas')

  cron.schedule('0 */2 * * *', async () => {
    console.log('[job] executando vasculhagem NF-e (multi-UF)...')
    const inicio = Date.now()
    const result = await executarVasculhagem()
    const duracao = ((Date.now() - inicio) / 1000).toFixed(1)
    console.log(`[job] concluido: ${result.empresas} empresas, ${result.notas} novas notas, ${result.erros} erros (${duracao}s)`)
    for (const d of result.detalhes) {
      console.log(`[job]   ${d}`)
    }
  })

  cron.schedule('1 */2 * * *', async () => {
    console.log('[job] executando limpeza de auditoria...')
    await query("DELETE FROM auditoria WHERE criado_em < NOW() - INTERVAL '90 days'")
  })
}
