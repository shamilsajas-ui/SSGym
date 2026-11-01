// Demo content for screens not yet backed by the database (Progress, Class Booking, Profile extras, quotes).
// Exercises, workouts, dashboard and landing stats now come from /api.

export const user = {
  name: 'Alex Rivera',
  firstName: 'Alex',
  handle: '@alexlifts',
  initials: 'AR',
  membership: 'Elite',
  memberSince: 'March 2024',
  homeGym: 'PulseFit Downtown',
  streak: 12,
  bestStreak: 21,
  totalWorkouts: 186,
  totalHours: 214,
  level: 27,
  xp: 7420,
  xpNext: 8000,
}

export const muscleGroups = ['Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']

// Estimated 1RM in kg, weekly
export const strengthHistory = [
  { week: 'W1', bench: 80, squat: 110, deadlift: 140 },
  { week: 'W2', bench: 82.5, squat: 112.5, deadlift: 142.5 },
  { week: 'W3', bench: 82.5, squat: 115, deadlift: 147.5 },
  { week: 'W4', bench: 85, squat: 117.5, deadlift: 150 },
  { week: 'W5', bench: 85, squat: 120, deadlift: 152.5 },
  { week: 'W6', bench: 87.5, squat: 122.5, deadlift: 157.5 },
  { week: 'W7', bench: 90, squat: 125, deadlift: 160 },
  { week: 'W8', bench: 90, squat: 127.5, deadlift: 162.5 },
  { week: 'W9', bench: 92.5, squat: 130, deadlift: 167.5 },
  { week: 'W10', bench: 95, squat: 132.5, deadlift: 170 },
  { week: 'W11', bench: 95, squat: 135, deadlift: 175 },
  { week: 'W12', bench: 97.5, squat: 140, deadlift: 180 },
]

export const lifts = [
  { key: 'bench', label: 'Bench' },
  { key: 'squat', label: 'Squat' },
  { key: 'deadlift', label: 'Deadlift' },
]

export const personalRecords = [
  { id: 1, lift: 'Deadlift', value: 180, unit: 'kg', date: 'Oct 22', delta: '+5 kg', tier: 'gold' },
  { id: 2, lift: 'Back Squat', value: 140, unit: 'kg', date: 'Oct 21', delta: '+5 kg', tier: 'gold' },
  { id: 3, lift: 'Bench Press', value: 97.5, unit: 'kg', date: 'Oct 20', delta: '+2.5 kg', tier: 'silver' },
  { id: 4, lift: 'Pull-Ups', value: 18, unit: 'reps', date: 'Oct 14', delta: '+2 reps', tier: 'silver' },
  { id: 5, lift: '5K Run', value: '22:41', unit: '', date: 'Oct 09', delta: '−38 s', tier: 'bronze' },
  { id: 6, lift: 'Plank', value: '3:15', unit: '', date: 'Sep 30', delta: '+20 s', tier: 'bronze' },
]

export const classTypes = ['Yoga', 'HIIT', 'Spin', 'Boxing']

export const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const classes = [
  { id: 'c1', day: 'Mon', type: 'Yoga', title: 'Sunrise Flow', time: '07:00', duration: 50, coach: 'Maya Chen', spots: 6, capacity: 20, intensity: 1 },
  { id: 'c2', day: 'Mon', type: 'HIIT', title: 'Metcon Burn', time: '12:15', duration: 35, coach: 'Jordan Blake', spots: 3, capacity: 16, intensity: 3 },
  { id: 'c3', day: 'Mon', type: 'Boxing', title: 'Fight Club Basics', time: '18:30', duration: 45, coach: 'Dre Okafor', spots: 0, capacity: 14, intensity: 3 },
  { id: 'c4', day: 'Tue', type: 'Spin', title: 'Rhythm Ride', time: '06:30', duration: 45, coach: 'Sofia Ruiz', spots: 11, capacity: 24, intensity: 2 },
  { id: 'c5', day: 'Tue', type: 'Yoga', title: 'Power Vinyasa', time: '19:00', duration: 60, coach: 'Maya Chen', spots: 4, capacity: 20, intensity: 2 },
  { id: 'c6', day: 'Wed', type: 'HIIT', title: 'Tabata Thunder', time: '07:00', duration: 30, coach: 'Jordan Blake', spots: 8, capacity: 16, intensity: 3 },
  { id: 'c7', day: 'Wed', type: 'Boxing', title: 'Pad Work Power', time: '17:45', duration: 50, coach: 'Dre Okafor', spots: 2, capacity: 14, intensity: 3 },
  { id: 'c8', day: 'Wed', type: 'Spin', title: 'Climb & Conquer', time: '19:30', duration: 45, coach: 'Sofia Ruiz', spots: 14, capacity: 24, intensity: 2 },
  { id: 'c9', day: 'Thu', type: 'Yoga', title: 'Yin & Restore', time: '20:00', duration: 60, coach: 'Lena Park', spots: 9, capacity: 20, intensity: 1 },
  { id: 'c10', day: 'Thu', type: 'HIIT', title: 'Engine Builder', time: '12:15', duration: 40, coach: 'Jordan Blake', spots: 5, capacity: 16, intensity: 3 },
  { id: 'c11', day: 'Fri', type: 'Spin', title: 'Friday Night Lights', time: '18:00', duration: 45, coach: 'Sofia Ruiz', spots: 1, capacity: 24, intensity: 3 },
  { id: 'c12', day: 'Fri', type: 'Boxing', title: 'Combo Conditioning', time: '07:15', duration: 45, coach: 'Dre Okafor', spots: 7, capacity: 14, intensity: 2 },
  { id: 'c13', day: 'Sat', type: 'HIIT', title: 'Weekend Warrior', time: '09:00', duration: 45, coach: 'Jordan Blake', spots: 10, capacity: 20, intensity: 3 },
  { id: 'c14', day: 'Sat', type: 'Yoga', title: 'Slow Flow Stretch', time: '11:00', duration: 60, coach: 'Lena Park', spots: 12, capacity: 20, intensity: 1 },
  { id: 'c15', day: 'Sun', type: 'Spin', title: 'Recovery Ride', time: '10:00', duration: 30, coach: 'Sofia Ruiz', spots: 18, capacity: 24, intensity: 1 },
]

export const achievements = [
  { id: 'a1', title: 'First Rep', desc: 'Complete your first workout', icon: 'Zap', unlocked: true },
  { id: 'a2', title: 'On Fire', desc: '7-day workout streak', icon: 'Flame', unlocked: true },
  { id: 'a3', title: 'Century Club', desc: '100 workouts logged', icon: 'Medal', unlocked: true },
  { id: 'a4', title: 'Early Bird', desc: '10 workouts before 7am', icon: 'Sun', unlocked: true },
  { id: 'a5', title: 'Iron Will', desc: 'Lift 10,000 kg in a week', icon: 'Dumbbell', unlocked: true },
  { id: 'a6', title: 'Class Act', desc: 'Attend 25 classes', icon: 'Users', unlocked: false, progress: 0.72 },
  { id: 'a7', title: 'Unstoppable', desc: '30-day workout streak', icon: 'Trophy', unlocked: false, progress: 0.4 },
  { id: 'a8', title: 'Cardio King', desc: 'Burn 50,000 kcal', icon: 'Heart', unlocked: false, progress: 0.58 },
]

export const quotes = [
  { text: 'The only bad workout is the one that didn’t happen.', author: 'Unknown' },
  { text: 'Strength doesn’t come from what you can do. It comes from overcoming the things you once thought you couldn’t.', author: 'Rikki Rogers' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
  { text: 'Take care of your body. It’s the only place you have to live.', author: 'Jim Rohn' },
  { text: 'Success isn’t always about greatness. It’s about consistency.', author: 'Dwayne Johnson' },
  { text: 'You don’t have to be extreme, just consistent.', author: 'Unknown' },
  { text: 'Sweat is just fat crying.', author: 'Gym folklore' },
]
