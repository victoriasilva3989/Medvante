import winston from 'winston'
import 'winston-daily-rotate-file'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync, existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const logDir = join(__dirname, '..', '..', 'logs')
if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true })

function maskSensitive(msg: string): string {
  return msg
    .replace(/"token":"[^"]+"/g, '"token":"***"')
    .replace(/"password":"[^"]+"/g, '"password":"***"')
    .replace(/"authorization":"[^"]+"/gi, '"authorization":"***"')
    .replace(/[0-9]{3}\.\d{3}\.\d{3}-[0-9]{2}/g, (m) => m.slice(0, 4) + '.***.***-**')
    .replace(/[0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}-[0-9]{2}/g, (m) => m.slice(0, 6) + '.***/****-**')
}

const fileRotate = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: 'security-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const safe = maskSensitive(typeof message === 'string' ? message : JSON.stringify(message))
      return `[${timestamp}] ${level.toUpperCase()}: ${safe} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
    })
  ),
})

export const securityLogger = winston.createLogger({
  level: 'info',
  transports: [fileRotate],
})

export const appLogger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) =>
          `[${timestamp}] ${level.toUpperCase()}: ${maskSensitive(typeof message === 'string' ? message : JSON.stringify(message))}`
        )
      ),
    }),
  ],
})

export const errorLogger = winston.createLogger({
  level: 'error',
  transports: [
    new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '90d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, stack }) =>
          `[${timestamp}] ${level.toUpperCase()}: ${maskSensitive(typeof message === 'string' ? message : JSON.stringify(message))}${stack ? '\n' + stack : ''}`
        )
      ),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
})

export function maskCpf(cpf: string): string {
  return cpf ? cpf.slice(0, 3) + '.***.***-**' : ''
}

export function maskCnpj(cnpj: string): string {
  return cnpj ? cnpj.slice(0, 2) + '.***.***/****-**' : ''
}
