import 'dotenv/config'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsDir = join(__dirname, '..', 'migrations')

async function run() {
  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL) {
    console.error('ERROR: DATABASE_URL not set. Configure backend/.env')
    process.exit(1)
  }

  const pool = new pg.Pool({ connectionString: DATABASE_URL })

  try {
    await pool.query('SELECT NOW()')
    console.log('✓ PostgreSQL connected')
  } catch (err) {
    console.error('✗ PostgreSQL connection failed:', (err as Error).message)
    console.error('  Make sure PostgreSQL is running and DATABASE_URL is correct.')
    process.exit(1)
  }

  // Create migrations tracker
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      file VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT NOW()
    )
  `)

  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  if (files.length === 0) {
    console.log('No migration files found in migrations/')
    await pool.end()
    return
  }

  for (const file of files) {
    const { rowCount } = await pool.query(
      'SELECT id FROM _migrations WHERE file = $1',
      [file]
    )
    if (rowCount && rowCount > 0) {
      console.log(`  SKIP ${file} (already executed)`)
      continue
    }

    const sql = readFileSync(join(migrationsDir, file), 'utf-8')
    console.log(`  RUN  ${file}...`)

    await pool.query(sql)
    await pool.query('INSERT INTO _migrations (file) VALUES ($1)', [file])

    console.log(`  OK   ${file}`)
  }

  console.log('\n✓ All migrations executed successfully')

  // List tables
  const tables = await pool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `)
  console.log(`\nTables created (${tables.rows.length}):`)
  for (const t of tables.rows) {
    const count = await pool.query(`SELECT COUNT(*) FROM "${t.table_name}"`)
    console.log(`  - ${t.table_name} (${count.rows[0].count} rows)`)
  }

  await pool.end()
}

run().catch((err) => {
  console.error('Setup failed:', err.message)
  process.exit(1)
})
