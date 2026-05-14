type Servidor = 'proprio' | 'svan' | 'svrs'

interface UfUrls {
  autorizacao: string
  retAutorizacao: string
  consulta: string
  recepcaoEvento: string
  inutilizacao: string
}

interface EstadoConfig {
  uf: string
  codigoIBGE: string
  servidor: Servidor
  urls: {
    homologacao: UfUrls
    producao: UfUrls
  }
}

const SVAN_HOM = 'https://hom1.sefazvirtual.gov.br/nfe'
const SVAN_PROD = 'https://www.sefazvirtual.gov.br/nfe'
const SVRS_HOM = 'https://hom1.sefazvirtual.rs.gov.br/nfe'
const SVRS_PROD = 'https://nfe.sefazvirtual.rs.gov.br/nfe'

function ufs(
  baseHom: string,
  baseProd: string
): { urls: { homologacao: UfUrls; producao: UfUrls } } {
  const mk = (base: string) => ({
    autorizacao: `${base}/NFeAutorizacao4.asmx`,
    retAutorizacao: `${base}/NFeRetAutorizacao4.asmx`,
    consulta: `${base}/NFeConsultaProtocolo4.asmx`,
    recepcaoEvento: `${base}/NFeRecepcaoEvento4.asmx`,
    inutilizacao: `${base}/NFeInutilizacao4.asmx`,
  })
  return { urls: { homologacao: mk(baseHom), producao: mk(baseProd) } }
}

const estados: EstadoConfig[] = [
  // ─── SVAN ──────────────────────────────────────────
  { uf: 'AC', codigoIBGE: '12', servidor: 'svan', ...ufs(SVAN_HOM, SVAN_PROD) },
  { uf: 'AL', codigoIBGE: '27', servidor: 'svan', ...ufs(SVAN_HOM, SVAN_PROD) },
  { uf: 'AP', codigoIBGE: '16', servidor: 'svan', ...ufs(SVAN_HOM, SVAN_PROD) },
  { uf: 'DF', codigoIBGE: '53', servidor: 'svan', ...ufs(SVAN_HOM, SVAN_PROD) },
  { uf: 'ES', codigoIBGE: '32', servidor: 'svan', ...ufs(SVAN_HOM, SVAN_PROD) },
  { uf: 'PB', codigoIBGE: '25', servidor: 'svan', ...ufs(SVAN_HOM, SVAN_PROD) },
  { uf: 'PI', codigoIBGE: '22', servidor: 'svan', ...ufs(SVAN_HOM, SVAN_PROD) },
  { uf: 'RJ', codigoIBGE: '33', servidor: 'svan', ...ufs(SVAN_HOM, SVAN_PROD) },
  { uf: 'RN', codigoIBGE: '24', servidor: 'svan', ...ufs(SVAN_HOM, SVAN_PROD) },
  { uf: 'RO', codigoIBGE: '11', servidor: 'svan', ...ufs(SVAN_HOM, SVAN_PROD) },
  { uf: 'RR', codigoIBGE: '14', servidor: 'svan', ...ufs(SVAN_HOM, SVAN_PROD) },
  { uf: 'SC', codigoIBGE: '42', servidor: 'svan', ...ufs(SVAN_HOM, SVAN_PROD) },
  { uf: 'SE', codigoIBGE: '28', servidor: 'svan', ...ufs(SVAN_HOM, SVAN_PROD) },
  { uf: 'TO', codigoIBGE: '17', servidor: 'svan', ...ufs(SVAN_HOM, SVAN_PROD) },

  // ─── Servidor Próprio ────────────────────────────
  { uf: 'SP', codigoIBGE: '35', servidor: 'proprio',
    ...ufs(
      'https://homologacao.nfe.fazenda.sp.gov.br/nfe',
      'https://nfe.fazenda.sp.gov.br/nfe'
    ) },
  { uf: 'MG', codigoIBGE: '31', servidor: 'proprio',
    ...ufs(
      'https://hom1.nfe.fazenda.mg.gov.br/nfe',
      'https://nfe.fazenda.mg.gov.br/nfe'
    ) },
  { uf: 'PR', codigoIBGE: '41', servidor: 'proprio',
    ...ufs(
      'https://homologacao.nfe.sefa.pr.gov.br/nfe',
      'https://nfe.sefa.pr.gov.br/nfe'
    ) },
  { uf: 'RS', codigoIBGE: '43', servidor: 'proprio',
    ...ufs(
      'https://hom1.nfe.sefaz.rs.gov.br/nfe',
      'https://nfe.sefaz.rs.gov.br/nfe'
    ) },
  { uf: 'MT', codigoIBGE: '51', servidor: 'proprio',
    ...ufs(
      'https://homologacao.sefaz.mt.gov.br/nfe',
      'https://nfe.sefaz.mt.gov.br/nfe'
    ) },
  { uf: 'GO', codigoIBGE: '52', servidor: 'proprio',
    ...ufs(
      'https://homologacao.sefaz.go.gov.br/nfe',
      'https://nfe.sefaz.go.gov.br/nfe'
    ) },
  { uf: 'MS', codigoIBGE: '50', servidor: 'proprio',
    ...ufs(
      'https://homologacao.nfe.sefaz.ms.gov.br/nfe',
      'https://nfe.sefaz.ms.gov.br/nfe'
    ) },
  { uf: 'BA', codigoIBGE: '29', servidor: 'proprio',
    ...ufs(
      'https://nfehomologacao.sefaz.ba.gov.br/nfe',
      'https://nfe.sefaz.ba.gov.br/nfe'
    ) },
  { uf: 'PE', codigoIBGE: '26', servidor: 'proprio',
    ...ufs(
      'https://nfehomologacao.sefaz.pe.gov.br/nfe',
      'https://nfe.sefaz.pe.gov.br/nfe'
    ) },
  { uf: 'AM', codigoIBGE: '13', servidor: 'proprio',
    ...ufs(
      'https://homnfe.sefaz.am.gov.br/nfe',
      'https://nfe.sefaz.am.gov.br/nfe'
    ) },
  { uf: 'MA', codigoIBGE: '21', servidor: 'proprio',
    ...ufs(
      'https://hom.nfe.sefaz.ma.gov.br/nfe',
      'https://nfe.sefaz.ma.gov.br/nfe'
    ) },
  { uf: 'PA', codigoIBGE: '15', servidor: 'proprio',
    ...ufs(
      'https://homologacao.nfe.sefa.pa.gov.br/nfe',
      'https://nfe.sefa.pa.gov.br/nfe'
    ) },
  { uf: 'CE', codigoIBGE: '23', servidor: 'proprio',
    ...ufs(
      'https://nfehomologacao.sefaz.ce.gov.br/nfe',
      'https://nfe.sefaz.ce.gov.br/nfe'
    ) },
]

export type { EstadoConfig, UfUrls, Servidor }

const estadoMap = new Map<string, EstadoConfig>()
for (const e of estados) {
  estadoMap.set(e.uf, e)
  estadoMap.set(e.codigoIBGE, e)
}

export const SVRS: EstadoConfig = {
  uf: 'SVRS',
  codigoIBGE: '00',
  servidor: 'svrs',
  ...ufs(SVRS_HOM, SVRS_PROD),
} as EstadoConfig

export const DISTRIBUICAO_DFE = {
  homologacao:
    'https://hom1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx',
  producao:
    'https://www1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx',
}

export function getSefazUrls(
  uf: string,
  ambiente: 'homologacao' | 'producao'
): UfUrls {
  const estado = estadoMap.get(uf.toUpperCase())
  if (!estado) {
    throw new Error(`UF desconhecida: ${uf}. Usando SVRS como fallback.`)
  }
  return estado.urls[ambiente]
}

export function getEstado(uf: string): EstadoConfig {
  const estado = estadoMap.get(uf.toUpperCase())
  if (!estado) {
    throw new Error(`UF desconhecida: ${uf}`)
  }
  return estado
}

export function listarEstados(): EstadoConfig[] {
  return [...estados]
}
