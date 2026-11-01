// Public community stats for the landing page.
import { query } from './_lib/db.js'
import { route } from './_lib/http.js'

export default route(['GET'], async (req, res) => {
  const { rows } = await query(`
    SELECT (SELECT COUNT(*) FROM users)::int                                   AS members,
           (SELECT COUNT(*) FROM workouts WHERE status = 'completed')::int     AS workouts_completed,
           (SELECT COUNT(*) FROM classes
             WHERE start_time >= date_trunc('week', now())
               AND start_time <  date_trunc('week', now()) + interval '7 days')::int AS classes_this_week`)
  const r = rows[0]
  res.status(200).json({ members: r.members, workoutsCompleted: r.workouts_completed, classesThisWeek: r.classes_this_week })
})
