import pg from 'pg'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

pool.on('error', (err) => {
  console.error('[db] pool error:', err.message)
})

export async function query(text: string, params?: unknown[]): Promise<pg.QueryResult> {
  return pool.query(text, params)
}

export async function getClient(): Promise<pg.PoolClient> {
  return pool.connect()
}

export default pool
