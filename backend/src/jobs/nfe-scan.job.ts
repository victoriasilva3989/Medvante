import cron from 'node-cron'
import { query } from '../config/database.js'
import { vasculharNfeEntrada, salvarNotaEntrada } from '../services/nfe-entrada.js'
import { lancamentoAutomatico } from '../services/lancamentos.js'
import { v4 as uuidv4 } from 'uuid'

interface EmpresaAtiva {
  id: string
  cnpj: string
  uf: string
}

async function getEmpresasAtivas(): Promise<EmpresaAtiva[]> {
  const result = await query(
    "SELECT id, cnpj, uf FROM empresas WHERE ativo = true AND cnpj IS NOT NULL AND cnpj != '' AND uf IS NOT NULL"
  )
  return result.rows as EmpresaAtiva[]
}

async function registrarAuditoria(
  empresaId: string | null,
  acao: string,
  tabelaAfetada: string | null,
  registroId: string | null,
  dadosDepois: unknown
): Promise<void> {
  await query(
    `INSERT INTO auditoria (empresa_id, acao, tabela_afetada, registro_id, dados_depois)
     VALUES ($1, $2, $3, $4, $5)`,
    [empresaId, acao, tabelaAfetada, registroId, JSON.stringify(dadosDepois)]
  )
}

export async function scanNfeEntrada(): Promise<{
  empresas: number
  novasNotas: number
  erros: number
}> {
  const empresas = await getEmpresasAtivas()
  let totalNotas = 0
  let totalErros = 0

  for (const empresa of empresas) {
    try {
      const ultimoNSU = await getUltimoNSU(empresa.id)
      const { notas, novoNSU } = await vasculharNfeEntrada(ultimoNSU, empresa.cnpj, empresa.uf)

      for (const nota of notas) {
        const criada = await salvarNotaEntrada(empresa.id, nota)
        if (criada) {
          totalNotas++

          const nfe = await query(
            'SELECT id FROM nfe_entrada WHERE chave_acesso = $1',
            [nota.chaveAcesso]
          )
          if (nfe.rows.length > 0) {
            await lancamentoAutomatico(nfe.rows[0].id, 'entrada')
            await registrarAuditoria(
              empresa.id, 'vasculhagem_nfe_entrada', 'nfe_entrada',
              nfe.rows[0].id, { chave_acesso: nota.chaveAcesso, valor: nota.valor }
            )
          }
        }
      }

      await setUltimoNSU(empresa.id, novoNSU)
    } catch (err) {
      totalErros++
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error(`[nfe-scan] erro empresa ${empresa.id}: ${msg}`)
      await registrarAuditoria(empresa.id, 'vasculhagem_erro', null, null, { erro: msg })
    }
  }

  return { empresas: empresas.length, novasNotas: totalNotas, erros: totalErros }
}

export async function limparAuditoria(): Promise<void> {
  const result = await query(
    "DELETE FROM auditoria WHERE criado_em < NOW() - INTERVAL '90 days'"
  )
  if (result.rowCount && result.rowCount > 0) {
    console.log(`[nfe-scan] auditoria limpa: ${result.rowCount} registros removidos`)
  }
}

async function getUltimoNSU(empresaId: string): Promise<string> {
  const result = await query(
    `SELECT valor FROM _config WHERE chave = 'ultimo_nsu_' || $1`,
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

export function iniciarScanJob(): void {
  console.log('[job] scan NF-e entrada agendado a cada 2 horas')

  cron.schedule('0 */2 * * *', async () => {
    console.log('[job] executando scan NF-e entrada...')
    const inicio = Date.now()
    const result = await scanNfeEntrada()
    const duracao = ((Date.now() - inicio) / 1000).toFixed(1)
    console.log(
      `[job] scan concluido: ${result.empresas} empresas, ` +
      `${result.novasNotas} novas notas, ${result.erros} erros (${duracao}s)`
    )
  })

  cron.schedule('30 */2 * * *', async () => {
    await limparAuditoria()
  })
}
