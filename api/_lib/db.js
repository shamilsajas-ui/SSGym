// Postgres access for /api functions. Server-side only — never import from src/.
// Per Neon's guidance for Vercel: node-postgres Pool over the pooled DATABASE_URL,
// registered with attachDatabasePool so Fluid compute can close idle clients cleanly.
import pg from 'pg'
import { attachDatabasePool } from '@vercel/functions'
import { HttpError } from './http.js'

// pg treats sslmode=require as verify-full today but will weaken it in v9.
// Pin the current (strict) behaviour explicitly.
export function normalizeConnectionString(url) {
  return url.replace(/([?&])sslmode=(require|prefer|verify-ca)\b/, '$1sslmode=verify-full')
}

let pool

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new HttpError(503, 'The database is not configured yet (DATABASE_URL is missing).', 'DB_NOT_CONFIGURED')
  }
  if (!pool) {
    pool = new pg.Pool({
      connectionString: normalizeConnectionString(process.env.DATABASE_URL),
      max: 10,
      // Short on Vercel (Fluid compute reuses instances); longer locally, where the
      // long-running dev server would otherwise pay a fresh TLS handshake after every pause.
      idleTimeoutMillis: process.env.VERCEL ? 5000 : 60000,
      connectionTimeoutMillis: 10000,
    })
    pool.on('error', (err) => console.error('[db] idle client error:', err.message))
    attachDatabasePool(pool)
  }
  return pool
}

export const query = (text, params) => getPool().query(text, params)

export async function transaction(fn) {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    throw err
  } finally {
    client.release()
  }
}
