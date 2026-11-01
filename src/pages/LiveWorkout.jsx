import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  Check, Clock, Dumbbell, House, Library, LoaderCircle, Pause, Play, Plus, RotateCcw, SkipForward, Timer, Trash2, Trophy,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { api, useApiData } from '../lib/api'
import ProgressRing from '../components/ProgressRing'
import GlassCard from '../components/GlassCard'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { Bone, LoadingLabel, SkeletonCard } from '../components/Skeleton'

const KCAL_PER_MIN = 9

const fmt = (s) => {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

/** Rest timer driven by wall-clock time so it stays accurate when the tab is throttled. */
function useRestTimer(onFinish) {
  const [total, setTotal] = useState(90)
  const [remaining, setRemaining] = useState(90)
  const [running, setRunning] = useState(false)
  const endAt = useRef(0)
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const left = Math.max(0, (endAt.current - Date.now()) / 1000)
      setRemaining(left)
      if (left <= 0) {
        setRunning(false)
        finishRef.current?.()
      }
    }, 200)
    return () => clearInterval(id)
  }, [running])

  const start = useCallback((secs) => {
    setTotal(secs)
    setRemaining(secs)
    endAt.current = Date.now() + secs * 1000
    setRunning(true)
  }, [])
  const pause = () => setRunning(false)
  const resume = () => {
    if (remaining <= 0) return start(total)
    endAt.current = Date.now() + remaining * 1000
    setRunning(true)
  }
  const add = (secs) => {
    const next = Math.max(1, remaining + secs)
    setRemaining(next)
    setTotal((t) => Math.max(t, next))
    if (running) endAt.current = Date.now() + next * 1000
  }
  const skip = useCallback(() => {
    setRunning(false)
    setRemaining(0)
  }, [])
  return { total, remaining, running, start, pause, resume, add, skip }
}

function fireConfetti() {
  const colors = ['#c6ff3d', '#22d3ee', '#ffffff', '#a855f7']
  const end = Date.now() + 1600
  ;(function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0, y: 0.75 }, colors })
    confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1, y: 0.75 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
  setTimeout(() => confetti({ particleCount: 160, spread: 110, startVelocity: 45, origin: { y: 0.55 }, colors }), 250)
}

function CompleteModal({ open, stats, onClose, onRestart, onHome, restarting }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="complete-title"
            initial={{ scale: 0.8, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="glass relative w-full max-w-md overflow-hidden rounded-[2rem] p-8 text-center"
            style={{ background: 'color-mix(in srgb, var(--bg) 92%, transparent)' }}
          >
            <div className="bg-gradient-brand pointer-events-none absolute -top-20 left-1/2 size-56 -translate-x-1/2 rounded-full opacity-30 blur-3xl" />
            <motion.div
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', delay: 0.15, stiffness: 260, damping: 14 }}
              className="bg-gradient-brand glow relative mx-auto grid size-20 place-items-center rounded-3xl text-accent-ink"
            >
              <Trophy size={38} />
            </motion.div>
            <h2 id="complete-title" className="relative mt-5 text-3xl font-bold text-ink">Workout complete!</h2>
            <p className="relative mt-1 text-ink-2">
              Crushed it.{stats.streak ? ` That’s a ${stats.streak}-day streak 🔥` : ' Saved to your history.'}
            </p>
            <div className="relative mt-6 grid grid-cols-3 gap-2">
              {[
                ['Minutes', stats.minutes],
                ['Sets', stats.sets],
                ['kcal', `≈${stats.kcal}`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-surface-2 p-3">
                  <p className="font-display text-2xl font-bold text-ink">{v}</p>
                  <p className="text-xs text-ink-3">{k}</p>
                </div>
              ))}
            </div>
            <div className="relative mt-6 flex flex-col gap-2 sm:flex-row">
              <Button className="flex-1" onClick={onHome}><House size={16} /> Dashboard</Button>
              <Button variant="ghost" className="flex-1" onClick={onRestart} disabled={restarting}>
                {restarting ? <LoaderCircle size={16} className="animate-spin" /> : <RotateCcw size={16} />} Train again
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function WorkoutSkeleton() {
  return (
    <div>
      <LoadingLabel text="Loading today’s workout…" />
      <Bone className="h-4 w-16" />
      <Bone className="mt-3 h-10 w-64" />
      <Bone className="mt-6 h-2.5 w-full rounded-full" />
      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
        <SkeletonCard className="flex h-[420px] flex-col items-center justify-center">
          <Bone className="size-60 rounded-full" />
        </SkeletonCard>
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} className="p-5!">
              <div className="flex gap-3">
                <Bone className="size-11 rounded-2xl" />
                <div className="flex-1">
                  <Bone className="h-5 w-1/2" />
                  <Bone className="mt-2 h-4 w-1/3" />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {[0, 1, 2].map((j) => <Bone key={j} className="h-12 w-20 rounded-2xl" />)}
              </div>
            </SkeletonCard>
          ))}
        </div>
      </div>
    </div>
  )
}

const mapSet = (workout, setId, completed) => ({
  ...workout,
  exercises: workout.exercises.map((e) => ({
    ...e,
    sets: e.sets.map((s) => (s.id === setId ? { ...s, completed } : s)),
  })),
})

export default function LiveWorkout() {
  const { navigate, toast, refreshUser, user } = useApp()
  const { data, error, loading, reload, setData } = useApiData('/workouts')
  const workout = data?.workout ?? null

  const [showDone, setShowDone] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [restarting, setRestarting] = useState(false)
  const [localStart, setLocalStart] = useState(null)
  const [now, setNow] = useState(Date.now())
  const queue = useRef(Promise.resolve())

  // Every write goes through one queue so saves land in the order the user tapped
  const enqueue = useCallback((fn) => {
    const p = queue.current.then(fn)
    queue.current = p.catch(() => {})
    return p
  }, [])

  const timer = useRestTimer(() => {
    navigator.vibrate?.([120, 60, 120])
    toast('Rest over. Time for your next set 💪', { type: 'info', title: 'Let’s go' })
  })

  const exercises = workout?.exercises ?? []
  const allSets = exercises.flatMap((e) => e.sets)
  const totalSets = allSets.length
  const doneSets = allSets.filter((s) => s.completed).length
  const completed = workout?.status === 'completed'

  // Session clock (server start time when available)
  const startedAt = workout?.startedAt ? new Date(workout.startedAt).getTime() : localStart
  useEffect(() => {
    if (!startedAt || completed) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [startedAt, completed])
  const elapsed = completed ? (workout.durationMinutes ?? 0) * 60 : startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0

  const finish = useCallback(
    (workoutId) =>
      enqueue(async () => {
        setFinishing(true)
        try {
          const res = await api('/workouts', { method: 'POST', body: { action: 'finish', workoutId } })
          setData(res)
          timer.skip()
          fireConfetti()
          setShowDone(true)
          refreshUser()
        } catch (err) {
          toast(err.message, { type: 'error', title: 'Couldn’t finish workout' })
          reload()
        } finally {
          setFinishing(false)
        }
      }),
    [enqueue, setData, timer, refreshUser, toast, reload],
  )

  const handleSet = (ex, set) => {
    if (completed || finishing) return
    const next = !set.completed
    const updated = mapSet(workout, set.id, next)
    setData({ workout: updated }) // optimistic
    if (next && !startedAt) {
      setLocalStart(Date.now())
      setNow(Date.now())
    }

    enqueue(() => api('/sets', { method: 'PATCH', body: { setId: set.id, completed: next } })).catch((err) => {
      setData((d) => (d?.workout ? { workout: mapSet(d.workout, set.id, !next) } : d))
      toast(err.message, { type: 'error', title: 'Set not saved' })
    })

    const nowAllDone = updated.exercises.every((e) => e.sets.every((s) => s.completed))
    if (nowAllDone) finish(workout.id)
    else if (next) timer.start(ex.rest)
  }

  const removeExercise = async (ex) => {
    try {
      const res = await enqueue(() => api('/workouts', { method: 'POST', body: { action: 'remove', workoutExerciseId: ex.workoutExerciseId } }))
      setData(res)
      toast(`${ex.name} removed`, { type: 'info', title: 'Removed' })
    } catch (err) {
      toast(err.message, { type: 'error', title: 'Couldn’t remove exercise' })
    }
  }

  const resetSets = () => {
    const ticked = allSets.filter((s) => s.completed)
    if (!ticked.length) return
    let w = workout
    for (const s of ticked) w = mapSet(w, s.id, false)
    setData({ workout: w })
    timer.skip()
    Promise.all(ticked.map((s) => enqueue(() => api('/sets', { method: 'PATCH', body: { setId: s.id, completed: false } }))))
      .then(() => toast('All sets unticked', { type: 'info', title: 'Reset' }))
      .catch((err) => {
        toast(err.message, { type: 'error', title: 'Reset failed' })
        reload()
      })
  }

  const trainAgain = async () => {
    setRestarting(true)
    try {
      const res = await api('/workouts', { method: 'POST', body: { action: 'repeat', workoutId: workout.id } })
      setData(res)
      setShowDone(false)
      setLocalStart(null)
      timer.skip()
      toast('A fresh copy of this workout is ready', { title: 'Let’s go again' })
    } catch (err) {
      toast(err.message, { type: 'error', title: 'Couldn’t start a new workout' })
    } finally {
      setRestarting(false)
    }
  }

  if (loading && !data) return <WorkoutSkeleton />
  if (error && !data) return <ErrorState error={error} onRetry={reload} />

  if (!workout || exercises.length === 0) {
    return (
      <div className="pt-4">
        <EmptyState
          icon={Dumbbell}
          title="No workout yet today"
          message="Pick one from the Library! Add a few exercises and they’ll appear here, ready to train."
          action={
            <Button size="sm" onClick={() => navigate('library')}>
              <Library size={16} /> Browse library
            </Button>
          }
        />
      </div>
    )
  }

  const resting = !completed && (timer.running || (timer.remaining > 0 && timer.remaining < timer.total))
  const restLeft = completed ? 0 : timer.remaining
  const ringValue = timer.total ? restLeft / timer.total : 0
  const pct = totalSets ? doneSets / totalSets : 0
  const minutes = workout.durationMinutes ?? Math.max(1, Math.round(elapsed / 60))

  return (
    <div>
      {/* Header */}
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
            <span className="relative flex size-2">
              <span className={`absolute inline-flex size-full rounded-full bg-accent ${startedAt && !completed ? 'animate-ping' : ''}`} />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            {completed ? 'Finished' : finishing ? 'Saving…' : startedAt ? 'Live' : 'Ready'}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-ink sm:text-4xl">{workout.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="glass inline-flex h-10 items-center gap-2 rounded-xl px-3 font-display text-sm font-semibold text-ink tabular-nums">
            <Clock size={16} className="text-ink-3" /> {completed ? `${workout.durationMinutes} min` : fmt(elapsed)}
          </span>
          {completed ? (
            <Button variant="ghost" size="sm" onClick={trainAgain} disabled={restarting}>
              {restarting ? <LoaderCircle size={16} className="animate-spin" /> : <RotateCcw size={16} />} Train again
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={resetSets} disabled={!doneSets || finishing} aria-label="Untick all sets" title="Untick all sets">
              <RotateCcw size={16} />
            </Button>
          )}
        </div>
      </motion.header>

      {/* Overall progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-ink-2">Session progress</span>
          <span className="font-semibold text-ink tabular-nums">{doneSets}/{totalSets} sets</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className="bg-gradient-brand h-full rounded-full"
            animate={{ width: `${pct * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            style={{ boxShadow: '0 0 16px var(--glow)' }}
          />
        </div>
      </div>

      {completed && (
        <GlassCard hover={false} className="mb-4 flex flex-wrap items-center gap-4">
          <span className="bg-gradient-brand glow grid size-12 place-items-center rounded-2xl text-accent-ink"><Trophy size={22} /></span>
          <div className="flex-1">
            <p className="font-semibold text-ink">Workout completed and saved</p>
            <p className="text-sm text-ink-3">{workout.durationMinutes} min · {totalSets} sets · ≈{workout.durationMinutes * KCAL_PER_MIN} kcal</p>
          </div>
          <Button size="sm" onClick={() => navigate('dashboard')}><House size={16} /> Dashboard</Button>
        </GlassCard>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
        {/* Rest timer */}
        <GlassCard hover={false} className="flex flex-col items-center lg:sticky lg:top-8 lg:self-start">
          <p className="flex items-center gap-2 text-sm font-medium text-ink-2">
            <Timer size={16} /> Rest timer
          </p>
          <div className="mt-4">
            <ProgressRing value={ringValue} size={240} stroke={14} animateOnView={false} duration={0.3} delay={0} label={`Rest ${fmt(Math.ceil(restLeft))} remaining`}>
              <div>
                <motion.p
                  key={resting ? 'r' : 'i'}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-display text-6xl font-bold text-ink tabular-nums"
                >
                  {fmt(Math.ceil(restLeft))}
                </motion.p>
                <p className="mt-1 text-xs font-medium uppercase tracking-widest text-ink-3">
                  {timer.running ? 'Resting' : resting ? 'Paused' : completed ? 'All done' : 'Tick a set to start'}
                </p>
              </div>
            </ProgressRing>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button variant="subtle" size="md" onClick={() => timer.add(-15)} disabled={!resting} aria-label="Remove 15 seconds">−15s</Button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={timer.running ? timer.pause : timer.resume}
              className="bg-gradient-brand glow grid size-16 place-items-center rounded-full text-accent-ink"
              aria-label={timer.running ? 'Pause rest timer' : 'Start rest timer'}
            >
              {timer.running ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" className="ml-1" />}
            </motion.button>
            <Button variant="subtle" size="md" onClick={() => timer.add(15)} aria-label="Add 15 seconds">+15s</Button>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[30, 60, 90, 120].map((s) => (
              <button
                key={s}
                onClick={() => timer.start(s)}
                className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink-2 transition hover:bg-line hover:text-ink"
              >
                {s}s
              </button>
            ))}
            <button
              onClick={timer.skip}
              disabled={!resting}
              className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink-2 transition hover:bg-line hover:text-ink disabled:opacity-40"
            >
              <SkipForward size={13} /> Skip
            </button>
          </div>
        </GlassCard>

        {/* Exercises */}
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {exercises.map((ex, i) => {
              const done = ex.sets.filter((s) => s.completed).length
              const exDone = done === ex.sets.length
              return (
                <motion.div
                  key={ex.workoutExerciseId}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                  exit={{ opacity: 0, x: -40, height: 0, marginBottom: -12 }}
                  className={`glass rounded-3xl p-4 transition-colors sm:p-5 ${exDone ? 'ring-1 ring-accent/50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-2xl font-display font-bold transition-colors ${
                        exDone ? 'bg-gradient-brand text-accent-ink' : 'bg-surface-2 text-ink-2'
                      }`}
                    >
                      {exDone ? <Check size={20} strokeWidth={3} /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-semibold text-ink ${exDone ? 'opacity-60' : ''}`}>{ex.name}</h3>
                      <p className="text-sm text-ink-3">
                        {ex.sets.length} × {ex.reps} · rest {ex.rest}s
                      </p>
                    </div>
                    {!completed && (
                      <button
                        onClick={() => removeExercise(ex)}
                        className="rounded-lg p-2 text-ink-3 transition hover:bg-danger/10 hover:text-danger"
                        aria-label={`Remove ${ex.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {ex.sets.map((s) => (
                      <motion.button
                        key={s.id}
                        whileTap={completed ? undefined : { scale: 0.88 }}
                        onClick={() => handleSet(ex, s)}
                        disabled={completed}
                        aria-pressed={s.completed}
                        aria-label={`${ex.name} set ${s.setNumber}${s.completed ? ', done' : ''}`}
                        className={`relative flex h-12 min-w-[4.5rem] flex-1 items-center justify-center gap-1.5 rounded-2xl text-sm font-semibold transition-colors disabled:cursor-default sm:flex-none ${
                          s.completed ? 'bg-gradient-brand text-accent-ink' : 'bg-surface-2 text-ink-2 hover:bg-line hover:text-ink'
                        }`}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {s.completed ? (
                            <motion.span key="c" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                              <Check size={18} strokeWidth={3} />
                            </motion.span>
                          ) : (
                            <motion.span key="n" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                              Set {s.setNumber}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          {!completed && (
            <Button variant="ghost" onClick={() => navigate('library')} className="w-full">
              <Plus size={16} /> Add exercise
            </Button>
          )}
        </div>
      </div>

      <CompleteModal
        open={showDone}
        stats={{ minutes, sets: totalSets, kcal: minutes * KCAL_PER_MIN, streak: user?.streak }}
        onClose={() => setShowDone(false)}
        onRestart={trainAgain}
        restarting={restarting}
        onHome={() => navigate('dashboard')}
      />
    </div>
  )
}
