import { query } from './db.js'

function addDays(isoDate, n) {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/**
 * Streak = consecutive days with a completed workout, ending today
 * (or yesterday, so the streak stays alive until the day is over).
 */
export async function streakInfo(userId, tz) {
  const { rows } = await query(
    `SELECT (now() AT TIME ZONE $2)::date::text AS today,
            COALESCE(array_agg(DISTINCT w.workout_date::text) FILTER (WHERE w.id IS NOT NULL), '{}') AS days
       FROM (SELECT 1) one
       LEFT JOIN workouts w ON w.user_id = $1 AND w.status = 'completed'`,
    [userId, tz],
  )
  const { today, days } = rows[0]
  const set = new Set(days)

  let cursor = set.has(today) ? today : addDays(today, -1)
  let current = 0
  while (set.has(cursor)) {
    current++
    cursor = addDays(cursor, -1)
  }

  let best = 0
  let run = 0
  let prev = null
  for (const d of [...days].sort()) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1
    best = Math.max(best, run)
    prev = d
  }
  return { streak: current, bestStreak: best, trainedToday: set.has(today) }
}

export function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    weeklyGoalWorkouts: row.weekly_goal_workouts,
    weeklyGoalMinutes: row.weekly_goal_minutes,
    createdAt: row.created_at,
  }
}

/** The logged-in user's account plus lifetime totals. Returns null if the user no longer exists. */
export async function loadProfile(userId, tz) {
  const [{ rows }, streaks] = await Promise.all([
    query(
      `SELECT u.id, u.email, u.full_name, u.weekly_goal_workouts, u.weekly_goal_minutes, u.created_at,
              COUNT(w.id)::int AS total_workouts,
              COALESCE(SUM(w.duration_minutes), 0)::int AS total_minutes
         FROM users u
         LEFT JOIN workouts w ON w.user_id = u.id AND w.status = 'completed'
        WHERE u.id = $1
        GROUP BY u.id`,
      [userId],
    ),
    streakInfo(userId, tz),
  ])
  if (!rows[0]) return null
  return {
    ...publicUser(rows[0]),
    totalWorkouts: rows[0].total_workouts,
    totalMinutes: rows[0].total_minutes,
    ...streaks,
  }
}
