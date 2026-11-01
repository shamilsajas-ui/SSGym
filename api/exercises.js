// Exercise catalogue (not user data). Optional ?group=Chest filter.
import { query } from './_lib/db.js'
import { HttpError, route } from './_lib/http.js'

const GROUPS = ['Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']

export default route(['GET'], async (req, res) => {
  const group = req.query?.group ? String(req.query.group) : null
  if (group && !GROUPS.includes(group)) throw new HttpError(400, `Unknown muscle group "${group}".`, 'BAD_REQUEST')

  const { rows } = await query(
    `SELECT id, name, muscle_group, sets, reps, difficulty, rest_seconds, equipment, description
       FROM exercises
      WHERE ($1::text IS NULL OR muscle_group = $1)
      ORDER BY array_position($2::text[], muscle_group),
               array_position(ARRAY['Beginner','Intermediate','Advanced'], difficulty) DESC,
               name`,
    [group, GROUPS],
  )
  res.status(200).json({
    exercises: rows.map((e) => ({
      id: e.id,
      name: e.name,
      group: e.muscle_group,
      sets: e.sets,
      reps: e.reps,
      difficulty: e.difficulty,
      rest: e.rest_seconds,
      equipment: e.equipment,
      description: e.description,
    })),
  })
})
