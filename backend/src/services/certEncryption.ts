import { randomBytes, createCipheriv, createDecipheriv, scryptSync } from 'crypto'
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs'
import { join, normalize } from 'path'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16
const SALT_LENGTH = 32
const KEY_LENGTH = 32

function getKey(): Buffer {
  const secret = process.env.CERT_ENCRYPTION_KEY
  if (!secret) {
    throw new Error('CERT_ENCRYPTION_KEY não configurada')
  }
  return scryptSync(secret, 'medvante-cert-salt', KEY_LENGTH)
}

const STORAGE_PATH = process.env.CERT_STORAGE_PATH || './certs'
const ENCRYPTED_DIR = join(STORAGE_PATH, 'encrypted')

if (!existsSync(STORAGE_PATH)) {
  mkdirSync(STORAGE_PATH, { recursive: true })
}
if (!existsSync(ENCRYPTED_DIR)) {
  mkdirSync(ENCRYPTED_DIR, { recursive: true })
}

export function validateFileName(filename: string): string {
  const normalized = normalize(filename).replace(/^.*[/\\]/, '')
  if (normalized.includes('..')) {
    throw new Error('Nome de arquivo inválido: path traversal detectado')
  }
  if (!normalized.toLowerCase().endsWith('.pfx') && !normalized.toLowerCase().endsWith('.p12')) {
    throw new Error('Apenas arquivos .pfx ou .p12 são permitidos')
  }
  return normalized
}

export function encryptCertFile(buffer: Buffer, empresaId: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()])
  const tag = cipher.getAuthTag()

  const fileName = `${empresaId}_${Date.now()}.enc`
  const filePath = join(ENCRYPTED_DIR, fileName)

  const payload = Buffer.concat([iv, tag, encrypted])
  writeFileSync(filePath, payload)

  return fileName
}

export function decryptCertFile(fileName: string): Buffer {
  const key = getKey()
  const filePath = join(ENCRYPTED_DIR, fileName)

  if (!existsSync(filePath)) {
    throw new Error('Arquivo de certificado não encontrado')
  }

  const payload = readFileSync(filePath)
  const iv = payload.subarray(0, IV_LENGTH)
  const tag = payload.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const encrypted = payload.subarray(IV_LENGTH + TAG_LENGTH)

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  return Buffer.concat([decipher.update(encrypted), decipher.final()])
}

export function getEncryptedFilePath(fileName: string): string {
  return join(ENCRYPTED_DIR, fileName)
}

export function removeEncryptedFile(fileName: string): void {
  const filePath = join(ENCRYPTED_DIR, fileName)
  if (existsSync(filePath)) {
    unlinkSync(filePath)
  }
}

export function listEncryptedFiles(empresaId?: string): string[] {
  const files: string[] = []
  if (!existsSync(ENCRYPTED_DIR)) return files
  const entries = require('fs').readdirSync(ENCRYPTED_DIR)
  for (const f of entries) {
    if (f.endsWith('.enc')) {
      if (empresaId && !f.startsWith(empresaId)) continue
      files.push(f)
    }
  }
  return files
}
