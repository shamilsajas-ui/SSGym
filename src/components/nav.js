import { CalendarDays, ChartLine, Dumbbell, House, Timer, User } from 'lucide-react'

export const navItems = [
  { key: 'dashboard', label: 'Dashboard', short: 'Home', icon: House },
  { key: 'library', label: 'Workout Library', short: 'Library', icon: Dumbbell },
  { key: 'workout', label: 'Live Workout', short: 'Train', icon: Timer, primary: true },
  { key: 'progress', label: 'Progress', short: 'Progress', icon: ChartLine },
  { key: 'classes', label: 'Class Booking', short: 'Classes', icon: CalendarDays },
  { key: 'profile', label: 'Profile', short: 'Profile', icon: User },
]
