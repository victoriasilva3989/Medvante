import 'dotenv/config'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { query } from '../db/connection.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const MIGRATION_DIRS = [
  __dirname,
  join(__dirname, '..', '..', 'migrations'),
]

export async function runMigrations(): Promise<void> {
  console.log('[migrate] running migrations...')

  await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      file VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT NOW()
    )
  `)

  const seen = new Set<string>()
  const files: string[] = []

  for (const dir of MIGRATION_DIRS) {
    try {
      for (const f of readdirSync(dir)) {
        if (f.endsWith('.sql') && !seen.has(f)) {
          seen.add(f)
          files.push(f)
        }
      }
    } catch {
      /* dir may not exist */
    }
  }

  const filtered = files.filter(f => f !== '001_schema.sql').sort()

  if (filtered.length === 0) {
    console.log('[migrate] no migration files found')
    return
  }

  for (const file of filtered) {
    const result = await query('SELECT id FROM _migrations WHERE file = $1', [file])
    if (result.rows.length > 0) {
      console.log(`[migrate] ${file} already executed, skipping`)
      continue
    }

    let sql: string | null = null
    for (const dir of MIGRATION_DIRS) {
      try {
        sql = readFileSync(join(dir, file), 'utf-8')
        break
      } catch {
        /* try next */
      }
    }

    if (!sql) {
      console.error(`[migrate] ${file} not found in any migration directory`)
      continue
    }

    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const stmt of statements) {
      try {
        await query(stmt)
      } catch (err) {
        const msg = (err as Error).message
        if (
          !msg.includes('already exists') &&
          !msg.includes('duplicate key') &&
          !msg.includes('IF NOT EXISTS')
        ) {
          console.error(`[migrate] error in ${file}:`, msg)
          throw err
        }
      }
    }

    await query('INSERT INTO _migrations (file) VALUES ($1)', [file])
    console.log(`[migrate] ${file} executed`)
  }

  console.log('[migrate] done')
}

const isMain = process.argv[1] && (
  process.argv[1] === fileURLToPath(import.meta.url) ||
  process.argv[1].endsWith('run.ts') ||
  process.argv[1].endsWith('run.js')
)

if (isMain) {
  runMigrations().catch((err: Error) => {
    console.error('[migrate] error:', err && err.stack ? err.stack : err)
    process.exit(1)
  })
}
