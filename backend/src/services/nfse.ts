import axios from 'axios'
import * as forge from 'node-forge'
import { readFileSync } from 'fs'
import { query } from '../config/database.js'

const AMBIENTE = process.env.SEFAZ_AMBIENTE || '2'
const CERT_PATH = process.env.SEFAZ_CERT_PATH
const CERT_PASSWORD = process.env.SEFAZ_CERT_PASSWORD || ''
const CNPJ_PRESTADOR = process.env.SEFAZ_CNPJ_EMITENTE || ''
const INSCRICAO_MUNICIPAL = process.env.NFSE_INSCRICAO_MUNICIPAL || '0000000'

// Aracaju/SE — ABRASF 2.04
const URLS: Record<string, string> = {
  '1': 'https://nfe.se.gov.br/nfse/NfseServicos',
  '2': 'https://hom.nfe.se.gov.br/nfse/NfseServicos',
}

export interface NfsePayload {
  empresaId: string
  tomador: string
  cpfCnpj: string
  descricao: string
  valor: number
  servicoCodigo?: string
  issAliquota?: number
  competencia?: string
  tomadorEndereco?: {
    logradouro: string
    numero: string
    bairro: string
    municipio: string
    uf: string
    cep: string
  }
}

export interface NfseResult {
  success: boolean
  numero?: string
  codigoVerificacao?: string
  error?: string
}

function getCertPem(): { cert: string; key: string } | null {
  if (!CERT_PATH) return null
  try {
    const buffer = readFileSync(CERT_PATH)
    const p12 = forge.pkcs12.pkcs12FromAsn1(
      forge.asn1.fromDer(forge.util.createBuffer(buffer)),
      CERT_PASSWORD
    )
    const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag] || []
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] || []
    if (!keyBags.length || !certBags.length) return null
    const key = keyBags[0].key
    const cert = certBags[0].cert
    if (!key || !cert) return null
    return {
      cert: forge.pki.certificateToPem(cert),
      key: forge.pki.privateKeyToPem(key),
    }
  } catch {
    return null
  }
}

function gerarNumeroRPS(): string {
  return String(Math.floor(Math.random() * 99999999)).padStart(8, '0')
}

function montarXmlGerarNfse(payload: NfsePayload, rpsNumero: string): string {
  const competencia = payload.competencia || new Date().toISOString().slice(0, 7)
  const issAliquota = payload.issAliquota || 2.0
  const issValor = payload.valor * (issAliquota / 100)
  const servicoCodigo = payload.servicoCodigo || '01001'
  const end = payload.tomadorEndereco || {
    logradouro: 'END', numero: '0', bairro: 'BAIRRO',
    municipio: 'ARACAJU', uf: 'SE', cep: '49000000',
  }
  const cnpjCpfTag = payload.cpfCnpj.replace(/\D/g, '').length === 11
    ? `<Cpf>${payload.cpfCnpj.replace(/\D/g, '')}</Cpf>`
    : `<Cnpj>${payload.cpfCnpj.replace(/\D/g, '')}</Cnpj>`

  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <soap:Body>
    <GerarNfseEnvio xmlns="http://www.abrasf.org.br/nfse">
      <GerarNfseRequest>
        <Rps>
          <InfDeclaracaoPrestacaoServico>
            <Rps>
              <IdentificacaoRps>
                <Numero>${rpsNumero}</Numero>
                <Serie>M</Serie>
                <Tipo>1</Tipo>
              </IdentificacaoRps>
              <DataEmissao>${new Date().toISOString()}</DataEmissao>
              <Status>1</Status>
            </Rps>
            <Competencia>${competencia}</Competencia>
            <Servico>
              <Valores>
                <ValorServicos>${payload.valor.toFixed(2)}</ValorServicos>
                <ValorDeducoes>0.00</ValorDeducoes>
                <ValorPis>0.00</ValorPis>
                <ValorCofins>0.00</ValorCofins>
                <ValorInss>0.00</ValorInss>
                <ValorIr>0.00</ValorIr>
                <ValorCsll>0.00</ValorCsll>
                <IssRetido>2</IssRetido>
                <ValorIss>${issValor.toFixed(2)}</ValorIss>
                <BaseCalculo>${payload.valor.toFixed(2)}</BaseCalculo>
                <Aliquota>${issAliquota.toFixed(4)}</Aliquota>
                <ValorLiquidoNfse>${(payload.valor - issValor).toFixed(2)}</ValorLiquidoNfse>
              </Valores>
              <ItemListaServico>${servicoCodigo}</ItemListaServico>
              <CodigoCnae>0000000</CodigoCnae>
              <Discriminacao>${payload.descricao}</Discriminacao>
              <CodigoMunicipio>2800308</CodigoMunicipio>
              <CodigoPais>1058</CodigoPais>
              <ExigibilidadeISS>1</ExigibilidadeISS>
              <MunicipioIncidencia>2800308</MunicipioIncidencia>
            </Servico>
            <Prestador>
              <IdentificacaoPrestador>
                <CpfCnpj><Cnpj>${CNPJ_PRESTADOR.replace(/\D/g, '')}</Cnpj></CpfCnpj>
                <InscricaoMunicipal>${INSCRICAO_MUNICIPAL}</InscricaoMunicipal>
              </IdentificacaoPrestador>
            </Prestador>
            <Tomador>
              <IdentificacaoTomador>
                <CpfCnpj>${cnpjCpfTag}</CpfCnpj>
              </IdentificacaoTomador>
              <RazaoSocial>${payload.tomador}</RazaoSocial>
              <Endereco>
                <Endereco>${end.logradouro}</Endereco>
                <Numero>${end.numero}</Numero>
                <Bairro>${end.bairro}</Bairro>
                <CodigoMunicipio>2800308</CodigoMunicipio>
                <Uf>${end.uf}</Uf>
                <Cep>${end.cep.replace(/\D/g, '')}</Cep>
              </Endereco>
            </Tomador>
          </InfDeclaracaoPrestacaoServico>
        </Rps>
      </GerarNfseRequest>
    </GerarNfseEnvio>
  </soap:Body>
</soap:Envelope>`
}

function montarXmlConsultarNfse(numeroRps: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ConsultarNfseEnvio xmlns="http://www.abrasf.org.br/nfse">
      <ConsultarNfseRequest>
        <IdentificacaoRps>
          <Numero>${numeroRps}</Numero>
          <Serie>M</Serie>
          <Tipo>1</Tipo>
        </IdentificacaoRps>
        <Prestador>
          <CpfCnpj><Cnpj>${CNPJ_PRESTADOR.replace(/\D/g, '')}</Cnpj></CpfCnpj>
          <InscricaoMunicipal>${INSCRICAO_MUNICIPAL}</InscricaoMunicipal>
        </Prestador>
      </ConsultarNfseRequest>
    </ConsultarNfseEnvio>
  </soap:Body>
</soap:Envelope>`
}

function montarXmlCancelarNfse(numeroNfse: string, codigoVerificacao: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <CancelarNfseEnvio xmlns="http://www.abrasf.org.br/nfse">
      <CancelarNfseRequest>
        <IdentificacaoNfse>
          <Numero>${numeroNfse}</Numero>
          <Cnpj>${CNPJ_PRESTADOR.replace(/\D/g, '')}</Cnpj>
          <InscricaoMunicipal>${INSCRICAO_MUNICIPAL}</InscricaoMunicipal>
          <CodigoMunicipio>2800308</CodigoMunicipio>
        </IdentificacaoNfse>
        <CodigoCancelamento>${codigoVerificacao}</CodigoCancelamento>
      </CancelarNfseRequest>
    </CancelarNfseEnvio>
  </soap:Body>
</soap:Envelope>`
}

export async function emitirNfse(payload: NfsePayload): Promise<NfseResult> {
  const url = URLS[AMBIENTE]
  if (!url) return { success: false, error: 'Ambiente NFSe nao configurado' }

  const rpsNumero = gerarNumeroRPS()
  const xml = montarXmlGerarNfse(payload, rpsNumero)
  const certs = getCertPem()

  try {
    const response = await axios.post(url, xml, {
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8',
      },
      timeout: 30000,
    })

    const numMatch = response.data.match(/<NumeroNfse>(\d+)<\/NumeroNfse>/)
    const codMatch = response.data.match(/<CodigoVerificacao>([^<]+)<\/CodigoVerificacao>/)
    const numero = numMatch?.[1] || null
    const codigoVerificacao = codMatch?.[1] || ''

    await query(
      `INSERT INTO nfse_saida
         (empresa_id, numero_rps, serie_rps, numero_nfse, data_emissao,
          cnpj_tomador, nome_tomador, descricao_servico, codigo_servico,
          valor_servico, valor_iss, aliquota_iss,
          municipio_prestacao, codigo_municipio, status, ambiente, xml_rps)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [
        payload.empresaId,
        rpsNumero, 'M',
        numero || rpsNumero,
        new Date().toISOString(),
        payload.cpfCnpj.replace(/\D/g, ''), payload.tomador,
        payload.descricao, payload.servicoCodigo || '01001',
        payload.valor.toFixed(2),
        (payload.valor * ((payload.issAliquota || 2.0) / 100)).toFixed(2),
        (payload.issAliquota || 2.0),
        'ARACAJU', '2800308',
        numero ? 'autorizada' : 'processada',
        parseInt(AMBIENTE, 10),
        xml,
      ]
    )

    return {
      success: true,
      numero: numero || rpsNumero,
      codigoVerificacao,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao emitir NFSe'
    return { success: false, error: message }
  }
}

export async function consultarNfse(numeroRps: string): Promise<NfseResult> {
  const url = URLS[AMBIENTE]
  if (!url) return { success: false, error: 'Ambiente NFSe nao configurado' }

  const xml = montarXmlConsultarNfse(numeroRps)

  try {
    const response = await axios.post(url, xml, {
      headers: { 'Content-Type': 'application/soap+xml; charset=utf-8' },
      timeout: 15000,
    })

    const numMatch = response.data.match(/<NumeroNfse>(\d+)<\/NumeroNfse>/)
    const codMatch = response.data.match(/<CodigoVerificacao>([^<]+)<\/CodigoVerificacao>/)

    return {
      success: true,
      numero: numMatch?.[1] || numeroRps,
      codigoVerificacao: codMatch?.[1] || '',
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao consultar NFSe'
    return { success: false, error: message }
  }
}

export async function cancelarNfse(
  numeroNfse: string,
  codigoVerificacao: string
): Promise<NfseResult> {
  const url = URLS[AMBIENTE]
  if (!url) return { success: false, error: 'Ambiente NFSe nao configurado' }

  const xml = montarXmlCancelarNfse(numeroNfse, codigoVerificacao)

  try {
    await axios.post(url, xml, {
      headers: { 'Content-Type': 'application/soap+xml; charset=utf-8' },
      timeout: 15000,
    })

    await query(
      "UPDATE nfse_saida SET status = 'cancelada' WHERE numero_nfse = $1",
      [numeroNfse]
    )

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao cancelar NFSe'
    return { success: false, error: message }
  }
}
