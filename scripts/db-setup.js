// Runs db/schema.sql then db/seed.sql. Idempotent, so it's safe to run any number of times.
// Uses the direct (unpooled) connection, as Neon recommends for schema changes.
import { readFile } from 'node:fs/promises'
import pg from 'pg'
import { requireDatabaseUrl } from './env-check.js'
import { normalizeConnectionString } from '../api/_lib/db.js'

requireDatabaseUrl()
const connectionString = normalizeConnectionString(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL)
const client = new pg.Client({ connectionString, connectionTimeoutMillis: 15000 })

const run = async (file) => {
  const sql = await readFile(new URL(`../db/${file}`, import.meta.url), 'utf8')
  await client.query(sql)
  console.log(`✓ ${file}`)
}

try {
  await client.connect()
  await run('schema.sql')
  await run('seed.sql')
  const { rows } = await client.query(`
    SELECT 'exercises' AS table, count(*)::int AS rows FROM exercises
    UNION ALL SELECT 'classes', count(*)::int FROM classes
    UNION ALL SELECT 'users', count(*)::int FROM users
    UNION ALL SELECT 'workouts', count(*)::int FROM workouts`)
  console.table(rows)
} catch (err) {
  console.error(`\n✗ Database setup failed: ${err.message}`)
  process.exitCode = 1
} finally {
  await client.end().catch(() => {})
}
