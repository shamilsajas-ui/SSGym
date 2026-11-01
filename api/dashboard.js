// Everything the Dashboard needs, for the logged-in user only.
import { query } from './_lib/db.js'
import { HttpError, route, timeZone } from './_lib/http.js'
import { requireUserId } from './_lib/auth.js'
import { loadTodayWorkout } from './_lib/workouts.js'
import { streakInfo } from './_lib/users.js'

const TODAY = `(now() AT TIME ZONE $2)::date`
const KCAL_PER_MIN = 9 // rough average for mixed strength + conditioning

export default route(['GET'], async (req, res) => {
  const userId = await requireUserId(req)
  const tz = timeZone(req)

  const [userQ, weeklyQ, weekQ, prevQ, today, streaks] = await Promise.all([
    query('SELECT full_name, weekly_goal_workouts, weekly_goal_minutes FROM users WHERE id = $1', [userId]),
    // Active minutes per day for the last 7 days (today last)
    query(
      `SELECT d::date::text AS date, to_char(d, 'Dy') AS day, COALESCE(SUM(w.duration_minutes), 0)::int AS minutes
         FROM generate_series(${TODAY} - 6, ${TODAY}, interval '1 day') AS d
         LEFT JOIN workouts w ON w.user_id = $1 AND w.status = 'completed' AND w.workout_date = d::date
        GROUP BY d ORDER BY d`,
      [userId, tz],
    ),
    // This calendar week (Monday start)
    query(
      `SELECT COUNT(*)::int AS workouts, COALESCE(SUM(duration_minutes), 0)::int AS minutes
         FROM workouts
        WHERE user_id = $1 AND status = 'completed' AND workout_date >= date_trunc('week', ${TODAY})::date`,
      [userId, tz],
    ),
    // The 7 days before the chart window, for the trend badge
    query(
      `SELECT COALESCE(SUM(duration_minutes), 0)::int AS minutes
         FROM workouts
        WHERE user_id = $1 AND status = 'completed' AND workout_date BETWEEN ${TODAY} - 13 AND ${TODAY} - 7`,
      [userId, tz],
    ),
    loadTodayWorkout(userId, tz),
    streakInfo(userId, tz),
  ])

  const user = userQ.rows[0]
  if (!user) throw new HttpError(401, 'Please log in again.', 'UNAUTHENTICATED')

  const weekly = weeklyQ.rows.map((r) => ({ ...r, calories: r.minutes * KCAL_PER_MIN }))
  const last7 = weekly.reduce((s, d) => s + d.minutes, 0)
  const prev7 = prevQ.rows[0].minutes
  const week = weekQ.rows[0]
  const goalsHit = Number(week.workouts >= user.weekly_goal_workouts) + Number(week.minutes >= user.weekly_goal_minutes)

  let todayCard = null
  if (today) {
    const allSets = today.exercises.flatMap((e) => e.sets)
    // Estimate: ~45 s of work per set plus the prescribed rest
    const estSeconds = today.exercises.reduce((s, e) => s + e.sets.length * (45 + e.rest), 0)
    const estMinutes = Math.max(5, Math.round(estSeconds / 60))
    todayCard = {
      id: today.id,
      name: today.name,
      status: today.status,
      groups: [...new Set(today.exercises.map((e) => e.group))],
      exerciseCount: today.exercises.length,
      totalSets: allSets.length,
      doneSets: allSets.filter((s) => s.completed).length,
      estMinutes: today.durationMinutes ?? estMinutes,
      estCalories: (today.durationMinutes ?? estMinutes) * KCAL_PER_MIN,
    }
  }

  res.status(200).json({
    firstName: user.full_name.split(/\s+/)[0],
    today: todayCard,
    weekly,
    trendPct: prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : null,
    streak: streaks.streak,
    bestStreak: streaks.bestStreak,
    goals: {
      workouts: { done: week.workouts, goal: user.weekly_goal_workouts },
      minutes: { done: week.minutes, goal: user.weekly_goal_minutes },
      goalsHit: { done: goalsHit, goal: 2 },
    },
  })
})
