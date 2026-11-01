// Local stand-in for Vercel Functions. Mounts every file in /api exactly as Vercel will:
//   api/stats.js       -> /api/stats
//   api/auth/login.js  -> /api/auth/login
// Files and folders starting with "_" are helpers, not routes (same rule as Vercel).
// Vite proxies /api here during `npm run dev`. Not used in production.
import { readdir } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import express from 'express'

const PORT = Number(process.env.API_PORT) || 3001
const apiDir = fileURLToPath(new URL('../api', import.meta.url))

async function findRoutes(dir) {
  const files = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await findRoutes(full)))
    else if (/\.(js|mjs)$/.test(entry.name)) files.push(full)
  }
  return files
}

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '100kb' }))

const routes = await findRoutes(apiDir)
for (const file of routes) {
  const path = '/api/' + relative(apiDir, file).split(sep).join('/').replace(/\.(js|mjs)$/, '').replace(/\/?index$/, '')
  const mod = await import(pathToFileURL(file).href)
  if (typeof mod.default !== 'function') {
    console.warn(`[api] skipping ${path}: no default export`)
    continue
  }
  app.all(path, (req, res, next) => Promise.resolve(mod.default(req, res)).catch(next))
}

app.use('/api', (req, res) => res.status(404).json({ error: `No API route for ${req.method} ${req.path}`, code: 'NOT_FOUND' }))

// Malformed JSON bodies and anything else that escapes a handler
app.use((err, req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Request body must be valid JSON.', code: 'BAD_REQUEST' })
  console.error('[api] unhandled:', err)
  res.status(500).json({ error: 'Something went wrong on our side. Please try again.', code: 'SERVER_ERROR' })
})

app.listen(PORT, () => {
  console.log(`[api] ${routes.length} routes ready on http://localhost:${PORT}`)
})
