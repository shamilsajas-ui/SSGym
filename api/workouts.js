// Today's workout for the logged-in user.
//   GET                                  -> { workout | null }
//   POST { action: 'add', exerciseId }   -> add an exercise to today's workout (created if needed)
//   POST { action: 'remove', workoutExerciseId }
//   POST { action: 'finish', workoutId } -> mark completed, save duration
//   POST { action: 'repeat', workoutId } -> start a fresh copy of a completed workout
import { query, transaction } from './_lib/db.js'
import { body, HttpError, route, timeZone, toInt } from './_lib/http.js'
import { requireUserId } from './_lib/auth.js'
import { addExercise, getOrCreateActiveWorkout, loadTodayWorkout, renameWorkout } from './_lib/workouts.js'

export default route(['GET', 'POST'], async (req, res) => {
  const userId = await requireUserId(req)
  const tz = timeZone(req)

  if (req.method === 'GET') {
    return res.status(200).json({ workout: await loadTodayWorkout(userId, tz) })
  }

  const b = body(req)
  switch (b.action) {
    case 'add': {
      const exerciseId = toInt(b.exerciseId, 'exerciseId')
      const exists = await query('SELECT name FROM exercises WHERE id = $1', [exerciseId])
      if (!exists.rows[0]) throw new HttpError(404, 'That exercise doesn’t exist anymore.', 'NOT_FOUND')
      const added = await transaction(async (client) => {
        const workoutId = await getOrCreateActiveWorkout(client, userId, tz)
        const ok = await addExercise(client, workoutId, exerciseId)
        if (ok) await renameWorkout(client, workoutId)
        return ok
      })
      if (!added) throw new HttpError(409, `${exists.rows[0].name} is already in today’s workout.`, 'ALREADY_ADDED')
      return res.status(201).json({ workout: await loadTodayWorkout(userId, tz) })
    }

    case 'remove': {
      const weId = toInt(b.workoutExerciseId, 'workoutExerciseId')
      const removed = await transaction(async (client) => {
        const { rows } = await client.query(
          `DELETE FROM workout_exercises we
             USING workouts w
            WHERE we.id = $1 AND we.workout_id = w.id AND w.user_id = $2 AND w.status <> 'completed'
            RETURNING we.workout_id`,
          [weId, userId],
        )
        if (rows[0]) await renameWorkout(client, rows[0].workout_id)
        return Boolean(rows[0])
      })
      if (!removed) throw new HttpError(404, 'That exercise isn’t in an active workout.', 'NOT_FOUND')
      return res.status(200).json({ workout: await loadTodayWorkout(userId, tz) })
    }

    case 'finish': {
      const workoutId = toInt(b.workoutId, 'workoutId')
      const { rows } = await query(
        `UPDATE workouts
            SET status = 'completed',
                completed_at = now(),
                started_at = COALESCE(started_at, now()),
                duration_minutes = GREATEST(1, ROUND(EXTRACT(EPOCH FROM now() - COALESCE(started_at, now())) / 60))::int
          WHERE id = $1 AND user_id = $2 AND status <> 'completed'
            AND EXISTS (SELECT 1 FROM workout_exercises WHERE workout_id = $1)
            AND NOT EXISTS (
              SELECT 1 FROM workout_sets s JOIN workout_exercises we ON we.id = s.workout_exercise_id
               WHERE we.workout_id = $1 AND NOT s.completed)
          RETURNING id`,
        [workoutId, userId],
      )
      if (!rows[0]) throw new HttpError(409, 'This workout can’t be finished yet. Make sure every set is ticked.', 'NOT_FINISHABLE')
      return res.status(200).json({ workout: await loadTodayWorkout(userId, tz) })
    }

    case 'repeat': {
      const workoutId = toInt(b.workoutId, 'workoutId')
      await transaction(async (client) => {
        const src = await client.query(
          `SELECT we.exercise_id FROM workout_exercises we JOIN workouts w ON w.id = we.workout_id
            WHERE w.id = $1 AND w.user_id = $2 ORDER BY we.order_index, we.id`,
          [workoutId, userId],
        )
        if (!src.rows.length) throw new HttpError(404, 'We couldn’t find that workout.', 'NOT_FOUND')
        const newId = await getOrCreateActiveWorkout(client, userId, tz)
        for (const r of src.rows) await addExercise(client, newId, r.exercise_id)
        await renameWorkout(client, newId)
      })
      return res.status(201).json({ workout: await loadTodayWorkout(userId, tz) })
    }

    default:
      throw new HttpError(400, 'Unknown action.', 'BAD_REQUEST')
  }
})
