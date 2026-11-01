// Shared request/response helpers. Works with both Vercel's Node runtime and the local Express server,
// since both provide req.method, req.query, req.body (parsed JSON), res.status().json().

export class HttpError extends Error {
  constructor(status, message, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

const DB_DOWN_CODES = new Set([
  'ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN', 'EHOSTUNREACH',
  '57P01', '57P03', '08000', '08001', '08003', '08004', '08006', '53300', '28P01', '3D000',
])

function isDatabaseUnavailable(err) {
  return DB_DOWN_CODES.has(err?.code) || /timeout|Connection terminated|connect ECONN|getaddrinfo/i.test(err?.message ?? '')
}

/** Wraps a handler with method checking and friendly error responses. */
export function route(methods, fn) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    if (!methods.includes(req.method)) {
      res.setHeader('Allow', methods.join(', '))
      return res.status(405).json({ error: `Method ${req.method} not allowed` })
    }
    try {
      await fn(req, res)
    } catch (err) {
      if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message, code: err.code })
      }
      if (isDatabaseUnavailable(err)) {
        console.error('[api] database unavailable:', err.code ?? '', err.message)
        return res.status(503).json({
          error: 'We can’t reach the PulseFit database right now. Check your internet connection and try again in a moment.',
          code: 'DB_UNAVAILABLE',
        })
      }
      console.error('[api] unexpected error:', err)
      return res.status(500).json({ error: 'Something went wrong on our side. Please try again.', code: 'SERVER_ERROR' })
    }
  }
}

export function body(req) {
  return req.body && typeof req.body === 'object' ? req.body : {}
}

export function toInt(value, field) {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, `${field} must be a positive whole number.`, 'BAD_REQUEST')
  return n
}

/** The browser's IANA time zone (sent as X-Timezone) so "today" matches the user's calendar. */
export function timeZone(req) {
  const tz = req.headers['x-timezone']
  if (typeof tz === 'string' && tz.length < 64) {
    try {
      new Intl.DateTimeFormat('en', { timeZone: tz })
      return tz
    } catch {
      /* fall through */
    }
  }
  return 'UTC'
}
