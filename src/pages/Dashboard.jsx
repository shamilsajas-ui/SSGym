import { motion } from 'framer-motion'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { CalendarDays, Clock, Dumbbell, Flame, Library, Play, Target, Timer, Zap } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useApiData } from '../lib/api'
import { classes } from '../data/mock'
import GlassCard from '../components/GlassCard'
import ProgressRing from '../components/ProgressRing'
import AnimatedCounter from '../components/AnimatedCounter'
import Button from '../components/Button'
import QuoteCard from '../components/QuoteCard'
import ErrorState from '../components/ErrorState'
import { Bone, LoadingLabel, SkeletonCard } from '../components/Skeleton'
import useChartTheme from '../hooks/useChartTheme'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function ActivityTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="glass rounded-xl px-3 py-2 text-sm">
      <p className="font-semibold text-ink">{d.day} · {new Date(`${d.date}T00:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
      {d.minutes ? (
        <p className="text-ink-2">
          <span className="font-semibold text-ink tabular-nums">{d.minutes}</span> min · ≈{d.calories} kcal
        </p>
      ) : (
        <p className="text-ink-3">Rest day</p>
      )}
    </div>
  )
}

function WeeklyChart({ weekly, trendPct }) {
  const c = useChartTheme()
  const total = weekly.reduce((s, d) => s + d.minutes, 0)
  const last = weekly.length - 1
  return (
    <GlassCard delay={0.2} hover={false} className="lg:col-span-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink-2">Activity · last 7 days</p>
          <p className="mt-1 font-display text-3xl font-bold text-ink">
            <AnimatedCounter value={total} /> <span className="text-base font-medium text-ink-3">active minutes</span>
          </p>
        </div>
        {trendPct != null && (
          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-text">
            {trendPct >= 0 ? '+' : ''}{trendPct}% vs prior week
          </span>
        )}
      </div>
      <div className="mt-6 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekly} margin={{ top: 8, right: 0, left: -24, bottom: 0 }} barCategoryGap="32%">
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={c.accentFrom} />
                <stop offset="1" stopColor={c.accentTo} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={c.grid} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: c.axis, fontSize: 12 }} dy={6} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: c.axis, fontSize: 12 }} allowDecimals={false} domain={[0, (max) => Math.max(30, max)]} />
            <Tooltip content={<ActivityTooltip />} cursor={{ fill: c.cursor, radius: 8 }} />
            <Bar dataKey="minutes" radius={[4, 4, 4, 4]} animationDuration={1200} animationEasing="ease-out">
              {weekly.map((d, i) => (
                <Cell key={d.date} fill="url(#barGrad)" fillOpacity={i === last ? 1 : 0.55} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <LoadingLabel text="Loading your dashboard…" />
      <SkeletonCard className="h-60 lg:col-span-2">
        <Bone className="h-6 w-32 rounded-full" />
        <Bone className="mt-4 h-10 w-2/3" />
        <Bone className="mt-3 h-4 w-1/2" />
        <Bone className="mt-8 h-14 w-40 rounded-2xl" />
      </SkeletonCard>
      <SkeletonCard className="flex h-60 flex-col items-center justify-center">
        <Bone className="size-16 rounded-2xl" />
        <Bone className="mt-4 h-12 w-16" />
        <Bone className="mt-2 h-4 w-24" />
      </SkeletonCard>
      <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:col-span-3">
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i} className="flex flex-col items-center p-4! sm:p-6!">
            <Bone className="size-[84px] rounded-full sm:size-32" />
            <Bone className="mt-4 h-5 w-14" />
          </SkeletonCard>
        ))}
      </div>
      <SkeletonCard className="h-80 lg:col-span-2" />
      <SkeletonCard className="h-80" />
    </div>
  )
}

export default function Dashboard() {
  const { navigate, booked } = useApp()
  const { data, error, loading, reload } = useApiData('/dashboard')
  const nextClass = classes.find((cl) => booked.has(cl.id))

  if (loading && !data) return <DashboardSkeleton />
  if (error && !data) return <ErrorState error={error} onRetry={reload} />

  const { today, weekly, streak, bestStreak, goals, firstName, trendPct } = data
  const inProgress = today && today.status !== 'completed' && today.doneSets > 0
  const completed = today?.status === 'completed'

  const rings = [
    { ...goals.workouts, label: 'Workouts', unit: '', icon: Dumbbell, from: '#c6ff3d', to: '#84cc16' },
    { ...goals.minutes, label: 'Active min', unit: 'min', icon: Timer, from: '#22d3ee', to: '#3b82f6' },
    { ...goals.goalsHit, label: 'Goals hit', unit: '', icon: Target, from: '#e879f9', to: '#a855f7' },
  ]

  return (
    <div>
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
        <p className="text-sm text-ink-3">
          {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-ink sm:text-4xl">
          {greeting()}, <span className="text-gradient">{firstName}</span> 👋
        </h1>
      </motion.header>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Today's workout */}
        <GlassCard delay={0.05} className="overflow-hidden lg:col-span-2">
          <div className="bg-gradient-brand pointer-events-none absolute -top-24 -right-24 size-64 rounded-full opacity-20 blur-3xl" />
          {today && today.exerciseCount > 0 ? (
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-text">
                  <Zap size={13} /> {completed ? 'Completed today' : 'Today’s workout'}
                </span>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">{today.name}</h2>
                <p className="mt-1 text-ink-2">{today.groups.join(' · ')}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-2">
                  <span className="flex items-center gap-1.5"><Clock size={16} className="text-ink-3" /> {completed ? '' : '~'}{today.estMinutes} min</span>
                  <span className="flex items-center gap-1.5"><Dumbbell size={16} className="text-ink-3" /> {today.exerciseCount} exercise{today.exerciseCount === 1 ? '' : 's'}</span>
                  <span className="flex items-center gap-1.5"><Flame size={16} className="text-ink-3" /> ≈{today.estCalories} kcal</span>
                </div>
                {inProgress && (
                  <div className="mt-4 max-w-xs">
                    <div className="flex justify-between text-xs text-ink-3">
                      <span>In progress</span>
                      <span className="tabular-nums">{today.doneSets}/{today.totalSets} sets</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <motion.div
                        className="bg-gradient-brand h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(today.doneSets / today.totalSets) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              {completed ? (
                <Button size="lg" variant="ghost" onClick={() => navigate('workout')} className="shrink-0">
                  View summary
                </Button>
              ) : (
                <Button size="lg" onClick={() => navigate('workout')} className="shrink-0">
                  <Play size={18} fill="currentColor" /> {inProgress ? 'Resume' : 'Start'}
                </Button>
              )}
            </div>
          ) : (
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-ink-2">
                  <Zap size={13} /> Today’s workout
                </span>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">No workout yet today</h2>
                <p className="mt-1 text-ink-2">Pick a few exercises from the Library and they’ll show up here.</p>
              </div>
              <Button size="lg" onClick={() => navigate('library')} className="shrink-0">
                <Library size={18} /> Open Library
              </Button>
            </div>
          )}
        </GlassCard>

        {/* Streak */}
        <GlassCard delay={0.1} className="overflow-hidden">
          <div className="pointer-events-none absolute -bottom-16 left-1/2 size-48 -translate-x-1/2 rounded-full bg-orange-500/25 blur-3xl" />
          <div className="relative flex h-full flex-col items-center justify-center text-center">
            <motion.div
              animate={streak ? { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] } : undefined}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className={`grid size-16 place-items-center rounded-2xl text-white shadow-lg ${
                streak ? 'bg-gradient-to-br from-amber-400 to-orange-600 shadow-orange-500/30' : 'bg-surface-2 text-ink-3! shadow-none'
              }`}
            >
              <Flame size={32} fill={streak ? 'currentColor' : 'none'} />
            </motion.div>
            <p className="mt-4 font-display text-5xl font-bold text-ink">
              <AnimatedCounter value={streak} />
            </p>
            <p className="font-medium text-ink-2">day streak</p>
            <div className="mt-4 flex gap-1.5" aria-label="Last 7 days">
              {weekly.map((d, i) => (
                <span
                  key={d.date}
                  title={`${d.day}: ${d.minutes ? 'trained' : 'rest'}`}
                  className={`h-2 w-5 rounded-full ${d.minutes ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-surface-2'} ${i === weekly.length - 1 ? 'ring-2 ring-orange-400/50' : ''}`}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-3">{streak ? `Best: ${bestStreak} day${bestStreak === 1 ? '' : 's'}` : 'Finish a workout to start your streak'}</p>
          </div>
        </GlassCard>

        {/* Progress rings */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:col-span-3">
          {rings.map((r, i) => (
            <GlassCard key={r.label} delay={0.15 + i * 0.05} className="flex flex-col items-center p-4! text-center sm:p-6!">
              <div className="sm:hidden">
                <ProgressRing value={r.done / r.goal} size={84} stroke={8} from={r.from} to={r.to} delay={0.3 + i * 0.15}>
                  <r.icon size={20} className="text-ink-2" />
                </ProgressRing>
              </div>
              <div className="hidden sm:block">
                <ProgressRing value={r.done / r.goal} size={128} stroke={12} from={r.from} to={r.to} delay={0.3 + i * 0.15}>
                  <div>
                    <r.icon size={20} className="mx-auto text-ink-3" />
                    <p className="mt-1 font-display text-2xl font-bold text-ink">{Math.min(100, Math.round((r.done / r.goal) * 100))}%</p>
                  </div>
                </ProgressRing>
              </div>
              <p className="mt-3 font-display text-lg font-bold text-ink sm:text-xl">
                <AnimatedCounter value={r.done} />
                <span className="text-sm font-medium text-ink-3">/{r.goal}{r.unit && ` ${r.unit}`}</span>
              </p>
              <p className="text-xs text-ink-2 sm:text-sm">{r.label} <span className="hidden text-ink-3 sm:inline">this week</span></p>
            </GlassCard>
          ))}
        </div>

        <WeeklyChart weekly={weekly} trendPct={trendPct} />

        <div className="flex flex-col gap-4">
          <QuoteCard delay={0.25} />
          <GlassCard delay={0.3}>
            <p className="text-sm font-medium text-ink-2">Next booked class</p>
            {nextClass ? (
              <div className="mt-3 flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-cyan/15 text-cyan">
                  <CalendarDays size={22} />
                </span>
                <div>
                  <p className="font-semibold text-ink">{nextClass.title}</p>
                  <p className="text-sm text-ink-3">{nextClass.day} · {nextClass.time} · {nextClass.coach}</p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-3">No classes booked yet. Find one you’ll love.</p>
            )}
            <Button variant="subtle" size="sm" className="mt-4 w-full" onClick={() => navigate('classes')}>
              Browse schedule
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
