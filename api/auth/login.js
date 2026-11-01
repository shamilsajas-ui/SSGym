import bcrypt from 'bcryptjs'
import { query } from '../_lib/db.js'
import { body, HttpError, route, timeZone } from '../_lib/http.js'
import { startSession } from '../_lib/auth.js'
import { loadProfile } from '../_lib/users.js'

// Compared against when the email doesn't exist, so response time doesn't reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync('pulsefit-timing-guard', 10)

export default route(['POST'], async (req, res) => {
  const b = body(req)
  const email = String(b.email ?? '').trim().toLowerCase()
  const password = String(b.password ?? '')
  if (!email || !password) throw new HttpError(400, 'Please enter your email and password.', 'VALIDATION')

  const { rows } = await query('SELECT id, password_hash FROM users WHERE email = $1', [email])
  const ok = await bcrypt.compare(password, rows[0]?.password_hash ?? DUMMY_HASH)
  if (!rows[0] || !ok) throw new HttpError(401, 'That email and password don’t match. Please try again.', 'INVALID_CREDENTIALS')

  await startSession(res, rows[0].id)
  res.status(200).json({ user: await loadProfile(rows[0].id, timeZone(req)) })
})
