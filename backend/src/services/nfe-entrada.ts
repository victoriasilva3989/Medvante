import axios from 'axios'
import { parseStringPromise } from 'xml2js'
import { query } from '../db/connection.js'
import { DISTRIBUICAO_DFE } from '../config/sefaz-urls.js'

const AMBIENTE = process.env.SEFAZ_AMBIENTE || '2'
const ambienteLabel: 'homologacao' | 'producao' = AMBIENTE === '1' ? 'producao' : 'homologacao'

const CODIGOS_IBGE: Record<string, string> = {
  AC: '12', AL: '27', AP: '16', AM: '13', BA: '29', CE: '23', DF: '53',
  ES: '32', GO: '52', MA: '21', MT: '51', MS: '50', MG: '31', PA: '15',
  PB: '25', PR: '41', PE: '26', PI: '22', RJ: '33', RN: '24', RS: '43',
  RO: '11', RR: '14', SC: '42', SP: '35', SE: '28', TO: '17',
}

export interface NfeResumida {
  chaveAcesso: string
  cnpjEmitente: string
  nomeEmitente: string
  valor: number
  dataEmissao: string
  situacao: string
}

function montarSoapDistDFe(ultimoNSU: string, cnpj: string, cUF: string): string {
  return '<?xml version="1.0" encoding="UTF-8"?>'
    + '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:nfe="http://www.portalfiscal.inf.br/nfe">'
    + '<soap:Header><nfe:nfeCabecMsg><nfe:cUF>' + cUF + '</nfe:cUF><nfe:versaoDados>1.01</nfe:versaoDados></nfe:nfeCabecMsg></soap:Header>'
    + '<soap:Body>'
    + '<nfe:nfeDadosMsg>'
    + '<distDFeInt xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.01">'
    + '<tpAmb>' + AMBIENTE + '</tpAmb>'
    + '<cNPJ>' + cnpj.replace(/\D/g, '') + '</cNPJ>'
    + '<consChNFe></consChNFe>'
    + '<distNSU><ultNSU>' + ultimoNSU + '</ultNSU></distNSU>'
    + '</distDFeInt>'
    + '</nfe:nfeDadosMsg>'
    + '</soap:Body>'
    + '</soap:Envelope>'
}

async function extrairNotas(xmlResponse: string): Promise<NfeResumida[]> {
  const notas: NfeResumida[] = []
  const docMatch = xmlResponse.match(/<docZip[^>]*>(.*?)<\/docZip>/gs)
  if (!docMatch) return notas

  for (const doc of docMatch) {
    const base64 = doc.replace(/<\/?docZip[^>]*>/g, '').trim()
    if (!base64) continue

    try {
      const decoded = Buffer.from(base64, 'base64').toString('utf-8')
      const parsed = await awaitParseResNFe(decoded)
      if (parsed) notas.push(parsed)
    } catch {
      // skip invalid docs
    }
  }

  return notas
}

async function awaitParseResNFe(xml: string): Promise<NfeResumida | null> {
  try {
    const parsed = await parseStringPromise(xml)
    const res = parsed?.resNFe
    if (!res) return null

    return {
      chaveAcesso: res.chNFe?.[0] || '',
      cnpjEmitente: res.CNPJ?.[0] || '',
      nomeEmitente: res.xNome?.[0] || '',
      valor: parseFloat(res.vNF?.[0] || '0'),
      dataEmissao: res.dEmi?.[0] || '',
      situacao: res.cSitNF?.[0] || '',
    }
  } catch {
    return null
  }
}

export async function vasculharNfeEntrada(
  ultimoNSU: string,
  cnpj: string,
  uf: string
): Promise<{
  notas: NfeResumida[]
  novoNSU: string
}> {
  const url = DISTRIBUICAO_DFE[ambienteLabel]
  if (!url) throw new Error('Ambiente SEFAZ nao configurado para distribuicao')
  if (!cnpj) throw new Error('CNPJ do emitente nao informado')

  const cUF = CODIGOS_IBGE[uf.toUpperCase()]
  if (!cUF) throw new Error(`UF invalida: ${uf}`)

  const soap = montarSoapDistDFe(ultimoNSU, cnpj, cUF)

  const response = await axios.post(url, soap, {
    headers: {
      'Content-Type': 'application/soap+xml; charset=utf-8',
    },
    timeout: 30000,
  })

  const notas = await extrairNotas(response.data)

  const nsuMatch = response.data.match(/<ultNSU>(\d+)<\/ultNSU>/)
  const novoNSU = nsuMatch ? nsuMatch[1] : ultimoNSU

  return { notas, novoNSU }
}

export async function salvarNotaEntrada(
  empresaId: string,
  nota: NfeResumida
): Promise<boolean> {
  const existente = await query(
    'SELECT id FROM nfe_entrada WHERE chave_acesso = $1',
    [nota.chaveAcesso]
  )
  if (existente.rows.length > 0) return false

  await query(
    `INSERT INTO nfe_entrada
      (empresa_id, chave_acesso, numero, data_emissao,
       cnpj_emitente, nome_emitente, valor_total, status, ambiente)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      empresaId,
      nota.chaveAcesso,
      nota.chaveAcesso.slice(25, 34),
      nota.dataEmissao,
      nota.cnpjEmitente,
      nota.nomeEmitente,
      nota.valor,
      'autorizada',
      parseInt(AMBIENTE, 10),
    ]
  )

  return true
}
