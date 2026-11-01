import { motion } from 'framer-motion'
import {
  Bell, ChevronRight, Crown, Dumbbell, Flame, Heart, Lock, LogOut, MapPin, Medal, Moon, Settings, Sun, Target, Trophy, Users, Zap,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { initials } from '../lib/api'
import { achievements, user as demo } from '../data/mock'
import GlassCard from '../components/GlassCard'
import ProgressRing from '../components/ProgressRing'
import AnimatedCounter from '../components/AnimatedCounter'

const iconMap = { Zap, Flame, Medal, Sun, Dumbbell, Users, Trophy, Heart }

export default function Profile() {
  const { theme, toggleTheme, toast, user: account, logout } = useApp()
  const unlocked = achievements.filter((a) => a.unlocked).length
  // Real account data; level / membership / achievements remain demo content for now
  const user = {
    ...demo,
    name: account.fullName,
    initials: initials(account.fullName),
    handle: account.email,
    memberSince: new Date(account.createdAt).toLocaleDateString('en', { month: 'long', year: 'numeric' }),
    totalWorkouts: account.totalWorkouts,
    totalHours: Math.round((account.totalMinutes / 60) * 10) / 10,
    bestStreak: account.bestStreak,
  }

  return (
    <div>
      {/* Hero card */}
      <GlassCard hover={false} className="overflow-hidden p-0! sm:p-0!">
        <div className="bg-gradient-brand relative h-28 sm:h-36">
          <div className="grid-bg absolute inset-0 opacity-30 mix-blend-overlay" />
        </div>
        <div className="relative px-5 pb-6 sm:px-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="relative -mt-14 sm:-mt-16"
            >
              <ProgressRing value={user.xp / user.xpNext} size={120} stroke={6} label={`Level progress ${Math.round((user.xp / user.xpNext) * 100)}%`}>
                <span className="grid size-[100px] place-items-center rounded-full border-4 border-bg bg-gradient-to-br from-zinc-800 to-zinc-950 font-display text-3xl font-bold text-white">
                  {user.initials}
                </span>
              </ProgressRing>
              <span className="bg-gradient-brand absolute -right-1 bottom-1 rounded-full px-2 py-0.5 font-display text-xs font-bold text-accent-ink shadow">
                Lv {user.level}
              </span>
            </motion.div>
            <div className="flex-1 sm:pt-4">
              <h1 className="text-3xl font-bold text-ink">{user.name}</h1>
              <p className="text-ink-3">{user.handle}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 px-3 py-1 text-xs font-bold text-black/80">
                  <Crown size={13} /> {user.membership} member
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-ink-2">
                  <MapPin size={13} /> {user.homeGym}
                </span>
              </div>
            </div>
            <div className="w-full max-w-xs sm:w-56 sm:pt-6">
              <div className="flex justify-between text-xs text-ink-3">
                <span>Level {user.level}</span>
                <span className="tabular-nums">{user.xp.toLocaleString()} / {user.xpNext.toLocaleString()} XP</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                <motion.div className="bg-gradient-brand h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${(user.xp / user.xpNext) * 100}%` }} transition={{ duration: 1.2, delay: 0.3 }} />
              </div>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-6">
            {[
              ['Workouts', user.totalWorkouts],
              ['Hours', user.totalHours],
              ['Best streak', user.bestStreak],
            ].map(([k, v]) => (
              <div key={k} className="text-center">
                <dd className="font-display text-2xl font-bold text-ink sm:text-3xl"><AnimatedCounter value={v} decimals={Number.isInteger(v) ? 0 : 1} /></dd>
                <dt className="text-xs text-ink-3 sm:text-sm">{k}</dt>
              </div>
            ))}
          </dl>
        </div>
      </GlassCard>

      {/* Achievements */}
      <div className="mt-10 mb-4 flex items-end justify-between">
        <h2 className="text-2xl font-bold text-ink">Achievements</h2>
        <span className="text-sm text-ink-3">{unlocked}/{achievements.length} unlocked</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {achievements.map((a, i) => {
          const Icon = iconMap[a.icon] ?? Trophy
          return (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
              whileHover={{ y: -6 }}
              onClick={() =>
                a.unlocked
                  ? toast(a.desc, { title: `🏅 ${a.title}` })
                  : toast(`${Math.round(a.progress * 100)}% of the way there: ${a.desc.toLowerCase()}.`, { type: 'info', title: `${a.title} (locked)` })
              }
              className={`glass group relative flex flex-col items-center rounded-3xl p-5 text-center ${a.unlocked ? '' : 'opacity-70'}`}
            >
              {a.unlocked ? (
                <span className="bg-gradient-brand glow grid size-16 place-items-center rounded-2xl text-accent-ink transition-transform group-hover:rotate-6">
                  <Icon size={28} />
                </span>
              ) : (
                <ProgressRing value={a.progress} size={64} stroke={5}>
                  <Lock size={20} className="text-ink-3" />
                </ProgressRing>
              )}
              <p className="mt-3 font-semibold text-ink">{a.title}</p>
              <p className="mt-0.5 text-xs text-ink-3">{a.desc}</p>
            </motion.button>
          )
        })}
      </div>

      {/* Settings */}
      <h2 className="mt-10 mb-4 text-2xl font-bold text-ink">Settings</h2>
      <GlassCard hover={false} className="divide-y divide-line p-2! sm:p-2!">
        <button onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-surface-2">
          <span className="grid size-10 place-items-center rounded-xl bg-surface-2 text-ink-2">{theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}</span>
          <span className="flex-1">
            <span className="block font-medium text-ink">Appearance</span>
            <span className="block text-sm text-ink-3">{theme === 'dark' ? 'Dark' : 'Light'} mode</span>
          </span>
          <span className={`relative h-7 w-12 rounded-full transition-colors ${theme === 'dark' ? 'bg-accent' : 'bg-line'}`}>
            <motion.span layout className={`absolute top-1 size-5 rounded-full bg-white shadow ${theme === 'dark' ? 'right-1' : 'left-1'}`} />
          </span>
        </button>
        <div className="flex w-full items-center gap-3 rounded-2xl p-3">
          <span className="grid size-10 place-items-center rounded-xl bg-surface-2 text-ink-2"><Target size={18} /></span>
          <span className="flex-1">
            <span className="block font-medium text-ink">Weekly goals</span>
            <span className="block text-sm text-ink-3">
              {account.weeklyGoalWorkouts} workouts · {account.weeklyGoalMinutes} active minutes
            </span>
          </span>
        </div>
        {[
          { icon: Bell, title: 'Notifications', sub: 'Workout reminders, class alerts' },
          { icon: Settings, title: 'Account & privacy', sub: 'Email, password, data' },
        ].map((r) => (
          <button
            key={r.title}
            onClick={() => toast('This setting is coming soon. Thanks for your patience!', { type: 'info', title: r.title })}
            className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-surface-2"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-surface-2 text-ink-2"><r.icon size={18} /></span>
            <span className="flex-1">
              <span className="block font-medium text-ink">{r.title}</span>
              <span className="block text-sm text-ink-3">{r.sub}</span>
            </span>
            <ChevronRight size={18} className="text-ink-3" />
          </button>
        ))}
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-danger/10">
          <span className="grid size-10 place-items-center rounded-xl bg-danger/10 text-danger"><LogOut size={18} /></span>
          <span className="flex-1">
            <span className="block font-medium text-danger">Log out</span>
            <span className="block text-sm text-ink-3">Signed in as {account.email}</span>
          </span>
        </button>
      </GlassCard>
      <p className="mt-4 text-center text-xs text-ink-3">Member since {user.memberSince}</p>
    </div>
  )
}
