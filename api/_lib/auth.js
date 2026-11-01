// Session handling: a signed JWT (HS256) stored in an httpOnly cookie.
import { SignJWT, jwtVerify } from 'jose'
import { HttpError } from './http.js'

const COOKIE = 'pf_session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function secretKey() {
  const s = process.env.JWT_SECRET
  if (!s || s.length < 32) throw new HttpError(500, 'Server misconfigured: JWT_SECRET is missing or too short.', 'CONFIG')
  return new TextEncoder().encode(s)
}

function cookie(value, maxAge) {
  const parts = [`${COOKIE}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`]
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') parts.push('Secure')
  return parts.join('; ')
}

function readCookie(req) {
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === COOKIE) return v.join('=')
  }
  return null
}

export async function startSession(res, userId) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey())
  res.setHeader('Set-Cookie', cookie(token, MAX_AGE))
}

export function endSession(res) {
  res.setHeader('Set-Cookie', cookie('', 0))
}

/** Returns the logged-in user's id, or null. */
export async function currentUserId(req) {
  const key = secretKey()
  const token = readCookie(req)
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
    const id = Number(payload.sub)
    return Number.isInteger(id) && id > 0 ? id : null
  } catch {
    return null
  }
}

export async function requireUserId(req) {
  const id = await currentUserId(req)
  if (!id) throw new HttpError(401, 'Please log in to continue.', 'UNAUTHENTICATED')
  return id
}
