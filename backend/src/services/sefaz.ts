import axios from 'axios'
import { parseStringPromise } from 'xml2js'
import { readFileSync } from 'fs'
import * as forge from 'node-forge'
import { query } from '../config/database.js'
import { getSefazUrls, DISTRIBUICAO_DFE } from '../config/sefaz-urls.js'
import { lancamentoAutomatico } from './lancamentos.js'

const AMBIENTE = process.env.SEFAZ_AMBIENTE || '2'
const CERT_PATH = process.env.SEFAZ_CERT_PATH
const CERT_PASSWORD = process.env.SEFAZ_CERT_PASSWORD || ''

const ambienteLabel: 'homologacao' | 'producao' = AMBIENTE === '1' ? 'producao' : 'homologacao'

const CODIGOS_IBGE: Record<string, string> = {
  AC: '12', AL: '27', AP: '16', AM: '13', BA: '29', CE: '23', DF: '53',
  ES: '32', GO: '52', MA: '21', MT: '51', MS: '50', MG: '31', PA: '15',
  PB: '25', PR: '41', PE: '26', PI: '22', RJ: '33', RN: '24', RS: '43',
  RO: '11', RR: '14', SC: '42', SP: '35', SE: '28', TO: '17',
}

interface EmpresaSefazData {
  uf: string
  cnpj: string
  razaoSocial: string
  endereco: {
    logradouro?: string
    numero?: string
    bairro?: string
    cidade?: string
    uf?: string
    cep?: string
  }
  inscricaoEstadual?: string
  regimeTributario?: string
}

async function getEmpresaSefazData(empresaId: string): Promise<EmpresaSefazData | null> {
  const result = await query(
    `SELECT uf, cnpj, razao_social, endereco, inscricao_estadual, regime_tributario
     FROM empresas WHERE id = $1 AND ativo = true`,
    [empresaId]
  )
  if (result.rows.length === 0) return null
  const row = result.rows[0]
  return {
    uf: row.uf || 'SP',
    cnpj: row.cnpj || '',
    razaoSocial: row.razao_social || '',
    endereco: row.endereco || {},
    inscricaoEstadual: row.inscricao_estadual || '',
    regimeTributario: row.regime_tributario || '3',
  }
}

function getCertificates() {
  if (!CERT_PATH) return undefined
  try {
    const buffer = readFileSync(CERT_PATH)
    const p12 = forge.pkcs12.pkcs12FromAsn1(
      forge.asn1.fromDer(forge.util.createBuffer(buffer)),
      CERT_PASSWORD
    )
    const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag] || []
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] || []
    if (!keyBags.length || !certBags.length) return undefined
    const key = keyBags[0].key
    const cert = certBags[0].cert
    if (!key || !cert) return undefined
    return { key: forge.pki.privateKeyToPem(key), cert: forge.pki.certificateToPem(cert) }
  } catch {
    return undefined
  }
}

interface NfePayload {
  empresaId?: string
  tomador: string
  cpfCnpj: string
  descricao: string
  valor: number
  quantidade?: number
}

interface NfeResult {
  success: boolean
  chaveAcesso?: string
  protocolo?: string
  numero?: string
  nfeId?: string
  error?: string
}

function gerarChaveAcesso(cUF: string): string {
  const ano = new Date().getFullYear().toString().slice(-2)
  const mes = String(new Date().getMonth() + 1).padStart(2, '0')
  const cnpj = '00000000000000'
  const modelo = '55'
  const serie = '001'
  const nNF = String(Math.floor(Math.random() * 999999999)).padStart(9, '0')
  const tpEmis = '1'
  const cNF = String(Math.floor(Math.random() * 99999999)).padStart(8, '0')
  const base = `${cUF}${ano}${mes}${cnpj}${modelo}${serie}${nNF}${tpEmis}${cNF}`
  const dv = '0'
  return base + dv
}

function montarXmlNfe(
  payload: NfePayload,
  chaveAcesso: string,
  empresa?: EmpresaSefazData
): string {
  const { tomador, cpfCnpj, descricao, valor, quantidade } = payload
  const qtd = quantidade || 1
  const vTotal = (valor * qtd).toFixed(2)
  const vUn = valor.toFixed(2)

  const cUF = chaveAcesso.slice(0, 2)
  const cMunFG = `${cUF}${'00000'}`
  const cnpjEmit = empresa?.cnpj ? empresa.cnpj.replace(/\D/g, '') : '00000000000000'
  const xNomeEmit = empresa?.razaoSocial || 'EMITENTE NAO CONFIGURADO'
  const end = empresa?.endereco || {}
  const ie = empresa?.inscricaoEstadual || '000000000000'
  const crt = empresa?.regimeTributario || '3'
  const uf = empresa?.uf || chaveAcesso.slice(0, 2)

  return '<?xml version="1.0" encoding="UTF-8"?>'
    + '<enviNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">'
    + '<idLote>' + Date.now() + '</idLote>'
    + '<indSinc>0</indSinc>'
    + '<NFe xmlns="http://www.portalfiscal.inf.br/nfe">'
    + '<infNFe versao="4.00" Id="NFe' + chaveAcesso + '">'
    + '<ide>'
    + '<cUF>' + cUF + '</cUF>'
    + '<cNF>' + chaveAcesso.slice(-8) + '</cNF>'
    + '<natOp>VENDA</natOp><mod>55</mod><serie>1</serie>'
    + '<nNF>' + chaveAcesso.slice(20, 29) + '</nNF>'
    + '<dhEmi>' + new Date().toISOString() + '</dhEmi>'
    + '<tpNF>1</tpNF><idDest>1</idDest><cMunFG>' + cMunFG + '</cMunFG>'
    + '<tpImp>1</tpImp><tpEmis>1</tpEmis>'
    + '<cDV>' + chaveAcesso.slice(-1) + '</cDV>'
    + '<tpAmb>' + AMBIENTE + '</tpAmb>'
    + '<finNFe>1</finNFe><indFinal>1</indFinal><indPres>1</indPres>'
    + '<procEmi>0</procEmi><verProc>Medvante 0.1.0</verProc>'
    + '</ide>'
    + '<emit>'
    + '<CNPJ>' + cnpjEmit + '</CNPJ><xNome>' + xNomeEmit + '</xNome>'
    + '<enderEmit>'
    + '<xLgr>' + (end.logradouro || 'END') + '</xLgr>'
    + '<nro>' + (end.numero || '0') + '</nro>'
    + '<xBairro>' + (end.bairro || 'BAIRRO') + '</xBairro>'
    + '<cMun>' + (CODIGOS_IBGE[uf] || '35') + '0000' + '</cMun>'
    + '<xMun>' + (end.cidade || 'SAO PAULO') + '</xMun>'
    + '<UF>' + uf + '</UF>'
    + '<CEP>' + (end.cep || '00000000') + '</CEP>'
    + '<cPais>1058</cPais><xPais>BRASIL</xPais></enderEmit>'
    + '<IE>' + ie + '</IE><CRT>' + crt + '</CRT>'
    + '</emit>'
    + '<dest>'
    + '<CNPJ>' + cpfCnpj.replace(/\D/g, '') + '</CNPJ>'
    + '<xNome>' + tomador + '</xNome>'
    + '<enderDest><xLgr>END</xLgr><nro>0</nro><xBairro>BAIRRO</xBairro>'
    + '<cMun>' + cMunFG + '</cMun><xMun>SAO PAULO</xMun><UF>SP</UF>'
    + '<CEP>00000000</CEP><cPais>1058</cPais><xPais>BRASIL</xPais></enderDest>'
    + '<indIEDest>2</indIEDest>'
    + '</dest>'
    + '<det nItem="1">'
    + '<prod>'
    + '<cProd>0001</cProd>'
    + '<xProd>' + descricao + '</xProd>'
    + '<NCM>00000000</NCM><CFOP>5102</CFOP>'
    + '<uCom>UN</uCom><qCom>' + qtd + '</qCom>'
    + '<vUnCom>' + vUn + '</vUnCom>'
    + '<vProd>' + vTotal + '</vProd>'
    + '<uTrib>UN</uTrib><qTrib>' + qtd + '</qTrib>'
    + '<vUnTrib>' + vUn + '</vUnTrib><indTot>1</indTot>'
    + '</prod>'
    + '<imposto>'
    + '<vTotTrib>0.00</vTotTrib>'
    + '<ICMS><ICMSSN101><orig>0</orig><pCredSN>0.00</pCredSN><vCredICMSSN>0.00</vCredICMSSN></ICMSSN101></ICMS>'
    + '<PIS><PISNT><CST>08</CST></PISNT></PIS>'
    + '<COFINS><COFINSNT><CST>08</CST></COFINSNT></COFINS>'
    + '</imposto>'
    + '</det>'
    + '<total>'
    + '<ICMSTot>'
    + '<vBC>0.00</vBC><vICMS>0.00</vICMS><vICMSDeson>0.00</vICMSDeson><vFCP>0.00</vFCP>'
    + '<vBCST>0.00</vBCST><vST>0.00</vST><vFCPST>0.00</vFCPST><vFCPSTRet>0.00</vFCPSTRet>'
    + '<vProd>' + vTotal + '</vProd>'
    + '<vFrete>0.00</vFrete><vSeg>0.00</vSeg><vDesc>0.00</vDesc><vII>0.00</vII>'
    + '<vIPI>0.00</vIPI><vIPIDevol>0.00</vIPIDevol>'
    + '<vPIS>0.00</vPIS><vCOFINS>0.00</vCOFINS><vOutro>0.00</vOutro>'
    + '<vNF>' + vTotal + '</vNF>'
    + '<vTotTrib>0.00</vTotTrib>'
    + '</ICMSTot>'
    + '</total>'
    + '<transp><modFrete>9</modFrete></transp>'
    + '<cobr><fat><nFat>' + chaveAcesso.slice(-9) + '</nFat>'
    + '<vOrig>' + vTotal + '</vOrig></fat></cobr>'
    + '<infAdic><infCpl>Nota fiscal gerada pelo Medvante</infCpl></infAdic>'
    + '</infNFe>'
    + '</NFe>'
    + '</enviNFe>'
}

export async function enviarNfe(payload: NfePayload): Promise<NfeResult> {
  if (!payload.empresaId) {
    return { success: false, protocolo: '', error: 'empresaId é obrigatório' }
  }

  const empresaData = await getEmpresaSefazData(payload.empresaId)
  if (!empresaData) {
    return { success: false, protocolo: '', error: 'Empresa não encontrada ou inativa' }
  }

  const cUF = CODIGOS_IBGE[empresaData.uf]
  if (!cUF) {
    return { success: false, protocolo: '', error: `UF inválida: ${empresaData.uf}` }
  }

  const chaveAcesso = gerarChaveAcesso(cUF)
  const xml = montarXmlNfe(payload, chaveAcesso, empresaData)

  const urls = getSefazUrls(empresaData.uf, ambienteLabel)
  const url = urls.autorizacao

  const certs = getCertificates()

  try {
    const response = await axios.post(url, xml, {
      headers: { 'Content-Type': 'application/soap+xml; charset=utf-8' },
      timeout: 30000,
    })

    const parsed = await parseStringPromise(response.data)
    const retEnv = parsed?.['soap:Envelope']?.['soap:Body']?.[0]?.nfeResultMsg?.[0]

    if (retEnv?.retEnviNFe?.cStat?.[0] === '103') {
      const result = await query(
        `INSERT INTO nfe_saida
           (empresa_id, chave_acesso, numero, serie, data_emissao,
            cnpj_destinatario, nome_destinatario, valor_total, cfop, status, ambiente,
            xml_assinado, protocolo_autorizacao)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING id`,
        [
          payload.empresaId, chaveAcesso, chaveAcesso.slice(25, 34), '1',
          new Date().toISOString(),
          payload.cpfCnpj.replace(/\D/g, ''), payload.tomador,
          (payload.valor * (payload.quantidade || 1)).toFixed(2),
          '5102', 'autorizada', parseInt(AMBIENTE, 10),
          xml, retEnv.retEnviNFe.protocolo?.[0] || '',
        ]
      )
      const nfeId = result.rows[0]?.id
      if (nfeId) {
        await lancamentoAutomatico(nfeId, 'saida')
      }

      return {
        success: true,
        chaveAcesso,
        protocolo: retEnv.retEnviNFe.protocolo?.[0],
        numero: chaveAcesso.slice(20, 29),
        nfeId,
      }
    }

    return {
      success: false,
      protocolo: chaveAcesso,
      error: `SEFAZ rejeitou: ${retEnv?.retEnviNFe?.xMotivo?.[0] || 'Erro desconhecido'}`,
    }
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number }; message?: string }
    return {
      success: false,
      protocolo: chaveAcesso,
      error: `Falha na comunicação com SEFAZ: ${axiosErr?.message || 'Erro desconhecido'}`,
    }
  }
}

export async function calcularDANFE(
  chaveAcesso: string,
  uf?: string
): Promise<Buffer> {
  const estadoUf = uf || chaveAcesso.slice(0, 2)
  const urls = getSefazUrls(estadoUf, ambienteLabel)

  const soap = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
    <soap:Body>
      <consSitNFe xmlns="http://www.portalfiscal.inf.br/nfe">
        <tpAmb>${AMBIENTE}</tpAmb>
        <xServ>CONSULTAR</xServ>
        <chNFe>${chaveAcesso}</chNFe>
      </consSitNFe>
    </soap:Body>
  </soap:Envelope>`

  try {
    const response = await axios.post(urls.consulta, soap, {
      headers: { 'Content-Type': 'application/soap+xml; charset=utf-8' },
      timeout: 15000,
    })
    return Buffer.from(response.data, 'utf-8')
  } catch {
    return Buffer.from(`DANFE simulada para chave ${chaveAcesso}`, 'utf-8')
  }
}

export { getEmpresaSefazData }
