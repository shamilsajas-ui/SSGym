-- PulseFit sample data. Safe to run repeatedly: upserts by unique keys, never duplicates.

INSERT INTO exercises (name, muscle_group, sets, reps, difficulty, rest_seconds, equipment, description) VALUES
  -- Chest
  ('Barbell Bench Press',     'Chest', 4, '6–8',      'Advanced',     90,  'Barbell',     'The classic upper-body strength builder. Keep your shoulder blades pinned and drive through your feet.'),
  ('Incline Dumbbell Press',  'Chest', 3, '8–10',     'Intermediate', 75,  'Dumbbells',   'Targets the upper chest. Set the bench to about 30° and lower the weights under control.'),
  ('Tempo Push-Ups',          'Chest', 3, '15',       'Beginner',     45,  'Bodyweight',  'Three seconds down, one second up. Brace your core and keep a straight line from head to heels.'),
  ('Cable Crossover Fly',     'Chest', 3, '12',       'Intermediate', 60,  'Cable',       'Hug a big tree: soft elbows, squeeze the handles together and feel the chest stretch on the way back.'),
  ('Machine Chest Press',     'Chest', 3, '10–12',    'Beginner',     60,  'Machine',     'A stable pressing pattern that lets you push close to failure safely.'),
  -- Back
  ('Conventional Deadlift',   'Back',  5, '5',        'Advanced',     120, 'Barbell',     'Hinge at the hips, keep the bar close and stand tall. Builds the whole posterior chain.'),
  ('Weighted Pull-Ups',       'Back',  4, '6',        'Advanced',     90,  'Pull-up bar', 'Full hang to chin over the bar. Add weight once you can do 10 clean bodyweight reps.'),
  ('Bent-Over Barbell Row',   'Back',  4, '8',        'Intermediate', 75,  'Barbell',     'Flat back, torso at about 45°. Pull the bar to your lower ribs.'),
  ('Lat Pulldown',            'Back',  3, '10–12',    'Beginner',     60,  'Machine',     'Lead with your elbows and pull the bar to your upper chest without leaning back too far.'),
  ('Seated Cable Row',        'Back',  3, '12',       'Beginner',     60,  'Cable',       'Sit tall, pull the handle to your stomach and pause for a second with your shoulder blades squeezed.'),
  -- Legs
  ('Back Squat',              'Legs',  5, '5',        'Advanced',     120, 'Barbell',     'Brace hard, sit between your hips and drive up through the whole foot.'),
  ('Romanian Deadlift',       'Legs',  4, '8',        'Intermediate', 90,  'Barbell',     'Soft knees, push your hips back until you feel a deep hamstring stretch, then stand up.'),
  ('Walking Lunges',          'Legs',  3, '12 / leg', 'Intermediate', 60,  'Dumbbells',   'Long steps, back knee kisses the floor. Great for balance and glutes.'),
  ('Leg Press',               'Legs',  3, '12',       'Beginner',     75,  'Machine',     'Feet shoulder-width apart on the platform. Lower until your knees reach about 90°.'),
  ('Bulgarian Split Squat',   'Legs',  3, '10 / leg', 'Advanced',     75,  'Dumbbells',   'Rear foot on a bench and front knee tracking over your toes. Tough, and it works.'),
  -- Arms
  ('EZ-Bar Curl',             'Arms',  3, '10',       'Beginner',     60,  'EZ bar',      'Elbows pinned to your sides. Curl up, squeeze, and lower slowly.'),
  ('Parallel Bar Dips',       'Arms',  3, '8–12',     'Intermediate', 75,  'Dip bars',    'Stay upright to hit the triceps. Lower until your upper arms are parallel to the floor.'),
  ('Hammer Curl',             'Arms',  3, '12',       'Beginner',     45,  'Dumbbells',   'Neutral grip, thumbs up. Builds the forearms and the brachialis.'),
  ('Skull Crushers',          'Arms',  3, '10',       'Intermediate', 60,  'EZ bar',      'Lower the bar towards your forehead with your elbows pointing at the ceiling.'),
  ('Cable Triceps Pushdown',  'Arms',  3, '12–15',    'Beginner',     45,  'Cable',       'Lock your elbows at your sides and press down until your arms are fully straight.'),
  -- Core
  ('Weighted Plank',          'Core',  3, '45 s',     'Beginner',     45,  'Plate',       'Plate on your upper back, glutes squeezed, ribs down. Breathe slowly.'),
  ('Hanging Leg Raise',       'Core',  3, '12',       'Intermediate', 60,  'Pull-up bar', 'Curl your pelvis up rather than just lifting your legs. No swinging.'),
  ('Ab Wheel Rollout',        'Core',  3, '10',       'Advanced',     60,  'Ab wheel',    'Roll out only as far as you can without your lower back sagging.'),
  ('Cable Woodchopper',       'Core',  3, '12 / side','Intermediate', 45,  'Cable',       'Rotate from your hips and torso, high to low, keeping your arms long.'),
  ('Dead Bug',                'Core',  3, '10 / side','Beginner',     30,  'Bodyweight',  'Lower back glued to the floor while you extend the opposite arm and leg.'),
  -- Cardio
  ('Rower Intervals',         'Cardio',6, '250 m',    'Intermediate', 60,  'Rower',       'Legs, then hips, then arms. Hold a hard but steady pace for each 250 m.'),
  ('Burpee Ladder',           'Cardio',5, '10',       'Advanced',     45,  'Bodyweight',  'Chest to the floor and a jump at the top. Keep a steady rhythm.'),
  ('Assault Bike Sprints',    'Cardio',8, '20 s',     'Advanced',     40,  'Air bike',    'All-out 20-second efforts. Push and pull with your arms as hard as you drive with your legs.'),
  ('Jump Rope Rounds',        'Cardio',5, '60 s',     'Beginner',     30,  'Jump rope',   'Light bounces on the balls of your feet with your wrists doing the work.'),
  ('Incline Treadmill Walk',  'Cardio',3, '5 min',    'Beginner',     60,  'Treadmill',   '10–12% incline at a brisk walking pace. Low impact, high burn.')
ON CONFLICT (name) DO UPDATE SET
  muscle_group = EXCLUDED.muscle_group,
  sets         = EXCLUDED.sets,
  reps         = EXCLUDED.reps,
  difficulty   = EXCLUDED.difficulty,
  rest_seconds = EXCLUDED.rest_seconds,
  equipment    = EXCLUDED.equipment,
  description  = EXCLUDED.description;

-- 10 classes for the current week (Monday-based, UTC). Re-running in the same week adds nothing.
INSERT INTO classes (title, class_type, coach_name, start_time, duration_minutes, capacity, intensity)
SELECT c.title, c.class_type, c.coach_name,
       date_trunc('week', now()) + c.day_offset * interval '1 day' + c.start_at,
       c.duration_minutes, c.capacity, c.intensity
FROM (VALUES
  ('Sunrise Flow',        'Yoga',     'Maya Chen',    0, time '07:00', 50, 20, 1),
  ('Metcon Burn',         'HIIT',     'Jordan Blake', 0, time '12:15', 35, 16, 3),
  ('Rhythm Ride',         'Spin',     'Sofia Ruiz',   1, time '06:30', 45, 24, 2),
  ('Pad Work Power',      'Boxing',   'Dre Okafor',   1, time '18:30', 50, 14, 3),
  ('Barbell Basics',      'Strength', 'Sam Patel',    2, time '17:30', 60, 12, 2),
  ('Power Vinyasa',       'Yoga',     'Maya Chen',    2, time '19:00', 60, 20, 2),
  ('Tabata Thunder',      'HIIT',     'Jordan Blake', 3, time '07:00', 30, 16, 3),
  ('Friday Night Lights', 'Spin',     'Sofia Ruiz',   4, time '18:00', 45, 24, 3),
  ('Glutes & Guns',       'Strength', 'Priya Nair',   5, time '10:00', 50, 14, 2),
  ('Yin & Restore',       'Yoga',     'Lena Park',    6, time '10:00', 60, 20, 1)
) AS c(title, class_type, coach_name, day_offset, start_at, duration_minutes, capacity, intensity)
ON CONFLICT (title, start_time) DO NOTHING;
