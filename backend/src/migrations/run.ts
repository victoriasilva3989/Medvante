import 'dotenv/config'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { query } from '../db/connection.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function runMigrations() {
  console.log('[migrate] running migrations...')

  await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      file VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // Collect all .sql files from both migration directories
  const dirs = [
    __dirname,
    join(__dirname, '..', '..', 'migrations'),
  ]

  const seen = new Set<string>()
  const files: string[] = []

  for (const dir of dirs) {
    try {
      for (const f of readdirSync(dir)) {
        if (f.endsWith('.sql') && !seen.has(f)) {
          seen.add(f)
          files.push(f)
        }
      }
    } catch {
      // skip if dir doesn't exist
    }
  }

  // Skip old schema, use the new _inicial version
  const filtered = files.filter(f => f !== '001_schema.sql').sort()

  if (filtered.length === 0) {
    console.log('[migrate] no migration files found')
    process.exit(0)
  }

  for (const file of filtered) {
    const result = await query('SELECT id FROM _migrations WHERE file = $1', [file])
    if (result.rows.length > 0) {
      console.log(`[migrate] ${file} already executed, skipping`)
      continue
    }

    // Try both directories
    let sql: string | null = null
    for (const dir of dirs) {
      try {
        sql = readFileSync(join(dir, file), 'utf-8')
        break
      } catch {
        // try next
      }
    }

    if (!sql) {
      console.error(`[migrate] ${file} not found in any migration directory`)
      continue
    }

    // Split into individual statements and execute each
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const stmt of statements) {
      try {
        await query(stmt)
      } catch (err) {
        const msg = (err as Error).message
        // Ignore "already exists" errors for idempotency
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
  process.exit(0)
}

runMigrations().catch((err) => {
  console.error('[migrate] error:', err.message)
  process.exit(1)
})
