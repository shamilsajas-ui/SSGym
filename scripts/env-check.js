// Ensures .env has what PulseFit needs before anything starts.
// - JWT_SECRET missing  -> generate a strong one and append it to .env
// - DATABASE_URL missing -> explain where to get it, then exit
import { randomBytes } from 'node:crypto'
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const envPath = fileURLToPath(new URL('../.env', import.meta.url))

export function ensureJwtSecret() {
  if (process.env.JWT_SECRET) return
  const secret = randomBytes(48).toString('base64url')
  const current = existsSync(envPath) ? readFileSync(envPath, 'utf8') : ''
  appendFileSync(envPath, `${current && !current.endsWith('\n') ? '\n' : ''}JWT_SECRET=${secret}\n`)
  process.env.JWT_SECRET = secret
  console.log('✓ JWT_SECRET was missing, so a strong random one was generated and saved to .env')
}

export function requireDatabaseUrl() {
  if (process.env.DATABASE_URL) return
  console.error(`
✗ DATABASE_URL is missing from .env

  Get it from the Neon dashboard:
    1. Open https://console.neon.tech and select your project
    2. Click "Connect" (top right of the project dashboard)
    3. Keep Branch / Database / Role on their defaults, leave "Connection pooling" ON
    4. Click "Copy snippet" and paste it into .env as:
       DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require

  Or, with the Neon CLI in this folder:  neon env pull
`)
  process.exit(1)
}

// When run directly (npm "predev"), perform both checks.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  ensureJwtSecret()
  requireDatabaseUrl()
}
