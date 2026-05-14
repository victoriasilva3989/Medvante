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
  console.error('[database] pool error:', err.message)
})

export async function query(text: string, params?: unknown[]): Promise<pg.QueryResult> {
  return pool.query(text, params)
}

export async function getClient(): Promise<pg.PoolClient> {
  return pool.connect()
}

export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as now')
    console.log('[database] connected at', result.rows[0].now)
    return true
  } catch (err) {
    console.error('[database] connection failed:', (err as Error).message)
    return false
  }
}

export default pool
