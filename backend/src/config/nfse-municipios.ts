type Padrao = 'abrasf' | 'ginfes' | 'issnet' | 'notacarioca' | 'sp' | 'recife'

interface MunicipioNfse {
  codigoIBGE: string
  nome: string
  uf: string
  padrao: Padrao
  urls: {
    homologacao: string
    producao: string
  }
}

const municipios: MunicipioNfse[] = [
  // ─── ABRASF 2.04 (maioria dos municípios) ──────────
  { codigoIBGE: '2800308', nome: 'Aracaju', uf: 'SE', padrao: 'abrasf',
    urls: { homologacao: 'https://hom.nfe.se.gov.br/nfse/NfseServicos', producao: 'https://nfe.se.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '3106200', nome: 'Belo Horizonte', uf: 'MG', padrao: 'abrasf',
    urls: { homologacao: 'https://bhisshomologacao.pbh.gov.br/nfse/nfse.asmx', producao: 'https://bhissdigital.pbh.gov.br/nfse/nfse.asmx' } },
  { codigoIBGE: '5300108', nome: 'Brasília', uf: 'DF', padrao: 'abrasf',
    urls: { homologacao: 'https://nfsehomologacao.df.gov.br/nfse/NfseServicos', producao: 'https://nfse.df.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '5002702', nome: 'Campo Grande', uf: 'MS', padrao: 'abrasf',
    urls: { homologacao: 'https://nfse-homologacao.campogrande.ms.gov.br/nfse/NfseServicos', producao: 'https://nfse.campogrande.ms.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '4106902', nome: 'Curitiba', uf: 'PR', padrao: 'abrasf',
    urls: { homologacao: 'https://homologacao.curitiba.pr.gov.br/nfse/NfseServicos', producao: 'https://nfse.curitiba.pr.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '4205407', nome: 'Florianópolis', uf: 'SC', padrao: 'abrasf',
    urls: { homologacao: 'https://nfsehomologacao.pmf.sc.gov.br/nfse/NfseServicos', producao: 'https://nfse.pmf.sc.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '2304400', nome: 'Fortaleza', uf: 'CE', padrao: 'abrasf',
    urls: { homologacao: 'https://nfsefaz.homologacao.fortaleza.ce.gov.br/nfse/NfseServicos', producao: 'https://nfsefaz.fortaleza.ce.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '5208707', nome: 'Goiânia', uf: 'GO', padrao: 'abrasf',
    urls: { homologacao: 'https://homologacao.goiania.go.gov.br/nfse/NfseServicos', producao: 'https://nfse.goiania.go.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '2507507', nome: 'João Pessoa', uf: 'PB', padrao: 'abrasf',
    urls: { homologacao: 'https://nfse-homologacao.joaopessoa.pb.gov.br/nfse/NfseServicos', producao: 'https://nfse.joaopessoa.pb.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '1600303', nome: 'Macapá', uf: 'AP', padrao: 'abrasf',
    urls: { homologacao: 'https://homologacao.nfse.macapa.ap.gov.br/nfse/NfseServicos', producao: 'https://nfse.macapa.ap.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '2704302', nome: 'Maceió', uf: 'AL', padrao: 'abrasf',
    urls: { homologacao: 'https://nfsehomologacao.maceio.al.gov.br/nfse/NfseServicos', producao: 'https://nfse.maceio.al.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '1302603', nome: 'Manaus', uf: 'AM', padrao: 'abrasf',
    urls: { homologacao: 'https://nfse-homologacao.manaus.am.gov.br/nfse/NfseServicos', producao: 'https://nfse.manaus.am.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '2408102', nome: 'Natal', uf: 'RN', padrao: 'abrasf',
    urls: { homologacao: 'https://nfsehomologacao.natal.rn.gov.br/nfse/NfseServicos', producao: 'https://nfse.natal.rn.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '1721000', nome: 'Palmas', uf: 'TO', padrao: 'abrasf',
    urls: { homologacao: 'https://homnfse.palmas.to.gov.br/nfse/NfseServicos', producao: 'https://nfse.palmas.to.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '4314902', nome: 'Porto Alegre', uf: 'RS', padrao: 'abrasf',
    urls: { homologacao: 'https://nfse-homologacao.portoalegre.rs.gov.br/nfse/NfseServicos', producao: 'https://nfse.portoalegre.rs.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '1100205', nome: 'Porto Velho', uf: 'RO', padrao: 'abrasf',
    urls: { homologacao: 'https://nfse-homologacao.portovelho.ro.gov.br/nfse/NfseServicos', producao: 'https://nfse.portovelho.ro.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '1200401', nome: 'Rio Branco', uf: 'AC', padrao: 'abrasf',
    urls: { homologacao: 'https://nfsehomologacao.riobranco.ac.gov.br/nfse/NfseServicos', producao: 'https://nfse.riobranco.ac.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '2910800', nome: 'Salvador', uf: 'BA', padrao: 'abrasf',
    urls: { homologacao: 'https://nfsehomologacao.salvador.ba.gov.br/nfse/NfseServicos', producao: 'https://nfse.salvador.ba.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '2211001', nome: 'Teresina', uf: 'PI', padrao: 'abrasf',
    urls: { homologacao: 'https://nfse-homologacao.teresina.pi.gov.br/nfse/NfseServicos', producao: 'https://nfse.teresina.pi.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '3205309', nome: 'Vitória', uf: 'ES', padrao: 'abrasf',
    urls: { homologacao: 'https://nfsehomologacao.vitoria.es.gov.br/nfse/NfseServicos', producao: 'https://nfse.vitoria.es.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '2111200', nome: 'São Luís', uf: 'MA', padrao: 'abrasf',
    urls: { homologacao: 'https://homologacao.nfse.saoluis.ma.gov.br/nfse/NfseServicos', producao: 'https://nfse.saoluis.ma.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '1501402', nome: 'Belém', uf: 'PA', padrao: 'abrasf',
    urls: { homologacao: 'https://nfsehomologacao.belem.pa.gov.br/nfse/NfseServicos', producao: 'https://nfse.belem.pa.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '5103403', nome: 'Cuiabá', uf: 'MT', padrao: 'abrasf',
    urls: { homologacao: 'https://nfsehomologacao.cuiaba.mt.gov.br/nfse/NfseServicos', producao: 'https://nfse.cuiaba.mt.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '1400100', nome: 'Boa Vista', uf: 'RR', padrao: 'abrasf',
    urls: { homologacao: 'https://nfsehomologacao.boavista.rr.gov.br/nfse/NfseServicos', producao: 'https://nfse.boavista.rr.gov.br/nfse/NfseServicos' } },

  // ─── Nota Carioca (Rio de Janeiro) ──────────────────
  { codigoIBGE: '3304557', nome: 'Rio de Janeiro', uf: 'RJ', padrao: 'notacarioca',
    urls: { homologacao: 'https://homologacao.notacarioca.rio.gov.br/nfse/NfseServicos', producao: 'https://notacarioca.rio.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '3301702', nome: 'Duque de Caxias', uf: 'RJ', padrao: 'notacarioca',
    urls: { homologacao: 'https://homologacao.notacarioca.rio.gov.br/nfse/NfseServicos', producao: 'https://notacarioca.rio.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '3304904', nome: 'São Gonçalo', uf: 'RJ', padrao: 'notacarioca',
    urls: { homologacao: 'https://homologacao.notacarioca.rio.gov.br/nfse/NfseServicos', producao: 'https://notacarioca.rio.gov.br/nfse/NfseServicos' } },

  // ─── São Paulo (padrão próprio) ─────────────────────
  { codigoIBGE: '3550308', nome: 'São Paulo', uf: 'SP', padrao: 'sp',
    urls: { homologacao: 'https://homologacao.nfse.prefeitura.sp.gov.br/nfse/NfseServicos', producao: 'https://nfse.prefeitura.sp.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '3518800', nome: 'Guarulhos', uf: 'SP', padrao: 'sp',
    urls: { homologacao: 'https://homologacao.nfse.guarulhos.sp.gov.br/nfse/NfseServicos', producao: 'https://nfse.guarulhos.sp.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '3509502', nome: 'Campinas', uf: 'SP', padrao: 'sp',
    urls: { homologacao: 'https://homologacao.nfse.campinas.sp.gov.br/nfse/NfseServicos', producao: 'https://nfse.campinas.sp.gov.br/nfse/NfseServicos' } },
  { codigoIBGE: '3548708', nome: 'São Bernardo do Campo', uf: 'SP', padrao: 'sp',
    urls: { homologacao: 'https://homologacao.nfse.saobernardo.sp.gov.br/nfse/NfseServicos', producao: 'https://nfse.saobernardo.sp.gov.br/nfse/NfseServicos' } },

  // ─── Recife (padrão próprio) ────────────────────────
  { codigoIBGE: '2611606', nome: 'Recife', uf: 'PE', padrao: 'recife',
    urls: { homologacao: 'https://nfsehomologacao.recife.pe.gov.br/nfse/NfseServicos', producao: 'https://nfse.recife.pe.gov.br/nfse/NfseServicos' } },
]

export type { MunicipioNfse, Padrao }

const municipioMap = new Map<string, MunicipioNfse>()
for (const m of municipios) {
  municipioMap.set(m.codigoIBGE, m)
  municipioMap.set(`${m.nome}/${m.uf}`.toLowerCase(), m)
}

export function getNfseMunicipio(
  codigoIBGE: string
): MunicipioNfse | undefined {
  return municipioMap.get(codigoIBGE)
}

export function getNfseUrls(
  codigoIBGE: string,
  ambiente: 'homologacao' | 'producao'
): { url: string; padrao: Padrao } | null {
  const mun = getNfseMunicipio(codigoIBGE)
  if (!mun) return null
  return { url: mun.urls[ambiente], padrao: mun.padrao }
}

export function listarMunicipios(): MunicipioNfse[] {
  return [...municipios]
}
