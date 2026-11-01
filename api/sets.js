// Tick / untick a set. PATCH { setId, completed }
// Only sets in the logged-in user's unfinished workouts can change.
import { query } from './_lib/db.js'
import { body, HttpError, route, toInt } from './_lib/http.js'
import { requireUserId } from './_lib/auth.js'

export default route(['PATCH'], async (req, res) => {
  const userId = await requireUserId(req)
  const b = body(req)
  const setId = toInt(b.setId, 'setId')
  if (typeof b.completed !== 'boolean') throw new HttpError(400, 'completed must be true or false.', 'BAD_REQUEST')

  const { rows } = await query(
    `WITH target AS (
        SELECT s.id, w.id AS workout_id
          FROM workout_sets s
          JOIN workout_exercises we ON we.id = s.workout_exercise_id
          JOIN workouts w ON w.id = we.workout_id
         WHERE s.id = $1 AND w.user_id = $2 AND w.status <> 'completed'
     ), upd AS (
        UPDATE workout_sets s
           SET completed = $3::boolean,
               completed_at = CASE WHEN $3::boolean THEN now() END
          FROM target
         WHERE s.id = target.id
        RETURNING s.id, s.set_number, s.completed, target.workout_id
     ), started AS (
        -- First ticked set starts the clock for the workout
        UPDATE workouts
           SET status = 'in_progress', started_at = COALESCE(started_at, now())
         WHERE id IN (SELECT workout_id FROM upd) AND $3::boolean
        RETURNING id
     )
     SELECT id, set_number, completed, workout_id FROM upd`,
    [setId, userId, b.completed],
  )
  if (!rows[0]) throw new HttpError(404, 'That set can’t be changed. The workout may already be finished.', 'NOT_FOUND')
  res.status(200).json({ set: { id: rows[0].id, setNumber: rows[0].set_number, completed: rows[0].completed } })
})
