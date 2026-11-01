import { query } from './db.js'

const TODAY = `(now() AT TIME ZONE $2)::date`

/** Today's workout for the user: the unfinished one if any, otherwise the latest completed one. */
export async function loadTodayWorkout(userId, tz, db = { query }) {
  const { rows } = await db.query(
    `SELECT id, name, status, workout_date::text AS workout_date, duration_minutes, started_at, completed_at
       FROM workouts
      WHERE user_id = $1 AND workout_date = ${TODAY}
      ORDER BY (status <> 'completed') DESC, id DESC
      LIMIT 1`,
    [userId, tz],
  )
  const w = rows[0]
  if (!w) return null

  const { rows: exercises } = await db.query(
    `SELECT we.id AS workout_exercise_id, we.order_index,
            e.id AS exercise_id, e.name, e.muscle_group, e.sets AS target_sets, e.reps,
            e.difficulty, e.rest_seconds, e.equipment,
            COALESCE(
              json_agg(json_build_object('id', s.id, 'setNumber', s.set_number, 'completed', s.completed)
                       ORDER BY s.set_number) FILTER (WHERE s.id IS NOT NULL),
              '[]') AS sets
       FROM workout_exercises we
       JOIN exercises e ON e.id = we.exercise_id
       LEFT JOIN workout_sets s ON s.workout_exercise_id = we.id
      WHERE we.workout_id = $1
      GROUP BY we.id, e.id
      ORDER BY we.order_index, we.id`,
    [w.id],
  )

  return {
    id: w.id,
    name: w.name,
    status: w.status,
    date: w.workout_date,
    durationMinutes: w.duration_minutes,
    startedAt: w.started_at,
    completedAt: w.completed_at,
    exercises: exercises.map((e) => ({
      workoutExerciseId: e.workout_exercise_id,
      exerciseId: e.exercise_id,
      name: e.name,
      group: e.muscle_group,
      reps: e.reps,
      difficulty: e.difficulty,
      rest: e.rest_seconds,
      equipment: e.equipment,
      sets: e.sets,
    })),
  }
}

/** Gets (or creates) the user's unfinished workout for today. Must run inside a transaction client. */
export async function getOrCreateActiveWorkout(client, userId, tz) {
  const inserted = await client.query(
    `INSERT INTO workouts (user_id, name, workout_date, status)
     VALUES ($1, 'Today''s Workout', ${TODAY}, 'planned')
     ON CONFLICT (user_id, workout_date) WHERE status <> 'completed' DO NOTHING
     RETURNING id`,
    [userId, tz],
  )
  if (inserted.rows[0]) return inserted.rows[0].id
  const existing = await client.query(
    `SELECT id FROM workouts WHERE user_id = $1 AND workout_date = ${TODAY} AND status <> 'completed'`,
    [userId, tz],
  )
  return existing.rows[0].id
}

/** Adds an exercise (and its sets) to a workout. Returns false if it was already there. */
export async function addExercise(client, workoutId, exerciseId) {
  const we = await client.query(
    `INSERT INTO workout_exercises (workout_id, exercise_id, order_index)
     VALUES ($1, $2, (SELECT COALESCE(MAX(order_index) + 1, 0) FROM workout_exercises WHERE workout_id = $1))
     ON CONFLICT (workout_id, exercise_id) DO NOTHING
     RETURNING id`,
    [workoutId, exerciseId],
  )
  if (!we.rows[0]) return false
  await client.query(
    `INSERT INTO workout_sets (workout_exercise_id, set_number)
     SELECT $1, g FROM generate_series(1, (SELECT sets FROM exercises WHERE id = $2)) AS g`,
    [we.rows[0].id, exerciseId],
  )
  return true
}

/** Names the workout after its muscle groups, e.g. "Chest & Arms Day". */
export async function renameWorkout(client, workoutId) {
  await client.query(
    `UPDATE workouts w SET name = sub.name
       FROM (SELECT CASE
                      WHEN COUNT(DISTINCT e.muscle_group) = 0 THEN 'Today''s Workout'
                      WHEN COUNT(DISTINCT e.muscle_group) > 2 THEN 'Full Body Mix'
                      ELSE string_agg(DISTINCT e.muscle_group, ' & ') || ' Day'
                    END AS name
               FROM workout_exercises we
               JOIN exercises e ON e.id = we.exercise_id
              WHERE we.workout_id = $1) sub
      WHERE w.id = $1`,
    [workoutId],
  )
}
