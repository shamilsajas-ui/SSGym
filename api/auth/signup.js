import bcrypt from 'bcryptjs'
import { query } from '../_lib/db.js'
import { body, HttpError, route, timeZone } from '../_lib/http.js'
import { startSession } from '../_lib/auth.js'
import { loadProfile } from '../_lib/users.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default route(['POST'], async (req, res) => {
  const b = body(req)
  const fullName = String(b.fullName ?? '').trim()
  const email = String(b.email ?? '').trim().toLowerCase()
  const password = String(b.password ?? '')
  const goalWorkouts = Number(b.weeklyGoalWorkouts ?? 4)
  const goalMinutes = Number(b.weeklyGoalMinutes ?? 150)

  if (!fullName || fullName.length > 80) throw new HttpError(400, 'Please tell us your name (up to 80 characters).', 'VALIDATION')
  if (!EMAIL_RE.test(email) || email.length > 254) throw new HttpError(400, 'That email address doesn’t look right.', 'VALIDATION')
  if (password.length < 8 || password.length > 72) throw new HttpError(400, 'Your password needs 8–72 characters.', 'VALIDATION')
  if (!Number.isInteger(goalWorkouts) || goalWorkouts < 1 || goalWorkouts > 14)
    throw new HttpError(400, 'Weekly workouts goal should be between 1 and 14.', 'VALIDATION')
  if (!Number.isInteger(goalMinutes) || goalMinutes < 10 || goalMinutes > 2000)
    throw new HttpError(400, 'Weekly minutes goal should be between 10 and 2000.', 'VALIDATION')

  const hash = await bcrypt.hash(password, 10)
  let id
  try {
    const { rows } = await query(
      `INSERT INTO users (email, password_hash, full_name, weekly_goal_workouts, weekly_goal_minutes)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [email, hash, fullName, goalWorkouts, goalMinutes],
    )
    id = rows[0].id
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'An account with this email already exists. Try logging in instead.', 'EMAIL_TAKEN')
    throw err
  }

  await startSession(res, id)
  res.status(201).json({ user: await loadProfile(id, timeZone(req)) })
})
