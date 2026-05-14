import pg from 'pg'

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'medvante',
  user: process.env.DB_USER || 'medvante',
  password: process.env.DB_PASSWORD || 'medvante',
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
