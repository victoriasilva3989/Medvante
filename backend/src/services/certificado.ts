import { readFileSync, readdirSync, unlinkSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import * as forge from 'node-forge'
import type { CertificadoInfo } from '../types/index.js'

const STORAGE_PATH = process.env.CERT_STORAGE_PATH || './certs'

if (!existsSync(STORAGE_PATH)) {
  mkdirSync(STORAGE_PATH, { recursive: true })
}

interface PfxData {
  cert: forge.pki.Certificate
  key: forge.pki.PrivateKey
}

function parsePfxBuffer(buffer: Buffer, password: string): PfxData {
  const p12 = forge.pkcs12.pkcs12FromAsn1(
    forge.asn1.fromDer(forge.util.createBuffer(buffer)),
    password
  )

  const keyMap = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })
  const certMap = p12.getBags({ bagType: forge.pki.oids.certBag })
  const keyBags = keyMap[forge.pki.oids.pkcs8ShroudedKeyBag] || []
  const certBags = certMap[forge.pki.oids.certBag] || []

  if (!keyBags.length || !certBags.length) {
    throw new Error('Certificado .pfx inválido ou senha incorreta')
  }

  const cert = certBags[0].cert
  const key = keyBags[0].key
  if (!cert || !key) throw new Error('Certificado .pfx inválido')

  return { cert, key } as PfxData
}

function extractInfo(cert: forge.pki.Certificate, nomeArquivo: string, tipo: 'A1' | 'A3'): CertificadoInfo {
  const validade = cert.validity.notAfter
  const agora = new Date()
  const diff = validade.getTime() - agora.getTime()
  const diasRestantes = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))

  const cn = cert.subject.getField('CN')?.value || 'Desconhecido'
  const issuer = cert.issuer.getField('O')?.value || cert.issuer.getField('CN')?.value || 'Desconhecido'

  return {
    id: nomeArquivo.replace(/\.(pfx|p12)$/i, '') || Date.now().toString(),
    nome: cn,
    emissor: issuer,
    validoAte: validade.toISOString().split('T')[0],
    diasRestantes,
    tipo,
    ambiente: diasRestantes > 365 ? 'homologacao' : 'producao',
    status: diasRestantes > 0 ? 'active' : 'expired',
    uploadEm: new Date().toISOString(),
  }
}

export async function lerPfx(input: string | Buffer, password: string): Promise<CertificadoInfo> {
  const buffer = typeof input === 'string' ? readFileSync(input) : input
  const nome = typeof input === 'string'
    ? input.split(/[\\/]/).pop() || 'certificado'
    : 'certificado'

  const { cert } = parsePfxBuffer(buffer, password)
  const ext = nome.toLowerCase().endsWith('.p12') ? 'A3' : 'A1'
  return extractInfo(cert, nome, ext as 'A1' | 'A3')
}

export function parsePfx(input: string | Buffer, password: string): PfxData {
  const buffer = typeof input === 'string' ? readFileSync(input) : input
  return parsePfxBuffer(buffer, password)
}

export async function listarCertificados(): Promise<CertificadoInfo[]> {
  const files = readdirSync(STORAGE_PATH).filter(f => f.endsWith('.pfx') || f.endsWith('.p12'))
  return files.map(f => {
    const filePath = join(STORAGE_PATH, f)
    try {
      const { cert } = parsePfxBuffer(readFileSync(filePath), '')
      const tipo = f.endsWith('.p12') ? 'A3' : 'A1'
      return extractInfo(cert, f, tipo as 'A1' | 'A3')
    } catch {
      return null
    }
  }).filter(Boolean) as CertificadoInfo[]
}

export async function removerCertificado(id: string): Promise<void> {
  const files = readdirSync(STORAGE_PATH).filter(f => (f.endsWith('.pfx') || f.endsWith('.p12')) && f.startsWith(id))
  for (const f of files) {
    unlinkSync(join(STORAGE_PATH, f))
  }
}
