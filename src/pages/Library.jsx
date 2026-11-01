import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Dumbbell, LoaderCircle, Plus, Search, SearchX, Timer, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { api, difficultyLevel, useApiData } from '../lib/api'
import { muscleGroups } from '../data/mock'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Button from '../components/Button'
import { Bone, LoadingLabel, SkeletonCard } from '../components/Skeleton'

const groupEmoji = { Chest: '🫁', Back: '🦾', Legs: '🦵', Arms: '💪', Core: '🎯', Cardio: '❤️‍🔥' }

function Difficulty({ label }) {
  const level = difficultyLevel[label] ?? 1
  const color = level === 3 ? 'bg-rose-400' : level === 2 ? 'bg-amber-400' : 'bg-accent'
  return (
    <div className="flex items-center gap-2" aria-label={`Difficulty: ${label}`}>
      <div className="flex items-end gap-0.5">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`w-1.5 rounded-full ${n <= level ? color : 'bg-surface-2'}`}
            style={{ height: 6 + n * 4 }}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-ink-2">{label}</span>
    </div>
  )
}

function ExerciseCard({ ref, ex, inWorkout, adding, onAdd }) {
  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className="glass group relative flex flex-col overflow-hidden rounded-3xl p-5"
      title={ex.description}
    >
      <div className="bg-gradient-brand pointer-events-none absolute -top-12 -right-12 size-28 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-25" />
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink-2">
          <span aria-hidden="true">{groupEmoji[ex.group]}</span> {ex.group}
        </span>
        <Difficulty label={ex.difficulty} />
      </div>
      <h3 className="mt-4 text-lg leading-snug font-semibold text-ink">{ex.name}</h3>
      <p className="mt-0.5 text-sm text-ink-3">{ex.equipment}</p>

      <dl className="mt-4 grid grid-cols-3 gap-2">
        {[
          ['Sets', ex.sets],
          ['Reps', ex.reps],
          ['Rest', `${ex.rest}s`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-surface-2 px-3 py-2">
            <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-3">{k}</dt>
            <dd className="font-display text-lg font-bold text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      <Button
        variant={inWorkout ? 'subtle' : 'primary'}
        size="sm"
        className="mt-4 w-full"
        onClick={() => onAdd(ex)}
        disabled={adding}
        aria-pressed={inWorkout}
      >
        {adding ? (
          <><LoaderCircle size={16} className="animate-spin" /> Adding…</>
        ) : inWorkout ? (
          <><Check size={16} /> In today’s workout</>
        ) : (
          <><Plus size={16} /> Add to today’s workout</>
        )}
      </Button>
    </motion.article>
  )
}

function LibrarySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <LoadingLabel text="Loading exercises…" />
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} className="p-5!">
          <div className="flex justify-between">
            <Bone className="h-6 w-20 rounded-full" />
            <Bone className="h-6 w-24" />
          </div>
          <Bone className="mt-5 h-6 w-3/4" />
          <Bone className="mt-2 h-4 w-1/3" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Bone className="h-14 rounded-2xl" />
            <Bone className="h-14 rounded-2xl" />
            <Bone className="h-14 rounded-2xl" />
          </div>
          <Bone className="mt-4 h-9 w-full" />
        </SkeletonCard>
      ))}
    </div>
  )
}

export default function Library() {
  const { navigate, toast } = useApp()
  const catalogue = useApiData('/exercises')
  const today = useApiData('/workouts')
  const [group, setGroup] = useState('All')
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(null)

  const exercises = catalogue.data?.exercises ?? []
  const todayWorkout = today.data?.workout
  // A completed workout is history; adding starts a fresh one, so only unfinished workouts count as "in"
  const inWorkout = new Set(todayWorkout && todayWorkout.status !== 'completed' ? todayWorkout.exercises.map((e) => e.exerciseId) : [])
  const activeCount = inWorkout.size

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return exercises.filter(
      (e) =>
        (group === 'All' || e.group === group) &&
        (!q || e.name.toLowerCase().includes(q) || e.equipment.toLowerCase().includes(q)),
    )
  }, [exercises, group, query])

  const counts = useMemo(() => {
    const c = { All: exercises.length }
    muscleGroups.forEach((g) => (c[g] = exercises.filter((e) => e.group === g).length))
    return c
  }, [exercises])

  const addToWorkout = async (ex) => {
    if (inWorkout.has(ex.id)) {
      toast(`${ex.name} is already in today’s workout`, { type: 'info', title: 'Already there' })
      return
    }
    setAdding(ex.id)
    try {
      const { workout } = await api('/workouts', { method: 'POST', body: { action: 'add', exerciseId: ex.id } })
      today.setData({ workout })
      toast(`${ex.name} added to today’s workout`, { title: 'Added' })
    } catch (err) {
      toast(err.message, { type: err.code === 'ALREADY_ADDED' ? 'info' : 'error', title: err.code === 'ALREADY_ADDED' ? 'Already there' : 'Couldn’t add exercise' })
      if (err.code === 'ALREADY_ADDED') today.reload()
    } finally {
      setAdding(null)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Workout library"
        title="Find your next move"
        subtitle={catalogue.data ? `${exercises.length} exercises, each with sets, reps and difficulty` : 'Exercises with sets, reps and difficulty'}
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('workout')}>
            <Timer size={16} /> Today’s workout · {activeCount}
          </Button>
        }
      />

      {/* Search */}
      <div className="glass flex h-12 items-center gap-3 rounded-2xl px-4">
        <Search size={18} className="text-ink-3" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises or equipment…"
          className="h-full flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
          aria-label="Search exercises"
        />
        {query && (
          <button onClick={() => setQuery('')} className="rounded-lg p-1 text-ink-3 hover:text-ink" aria-label="Clear search">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Muscle group">
        {['All', ...muscleGroups].map((g) => {
          const active = group === g
          return (
            <button
              key={g}
              role="tab"
              aria-selected={active}
              onClick={() => setGroup(g)}
              className={`relative h-10 shrink-0 rounded-full px-4 text-sm font-medium transition-colors ${
                active ? 'text-accent-ink' : 'glass text-ink-2 hover:text-ink'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="group-pill"
                  className="bg-gradient-brand glow absolute inset-0 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                />
              )}
              <span className="relative">
                {g} {catalogue.data && <span className={active ? 'opacity-70' : 'text-ink-3'}>{counts[g]}</span>}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        {catalogue.loading && !catalogue.data ? (
          <LibrarySkeleton />
        ) : catalogue.error && !catalogue.data ? (
          <ErrorState error={catalogue.error} onRetry={catalogue.reload} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No exercises found"
            message={
              exercises.length === 0
                ? 'The exercise library is empty. Run “npm run db:setup” to load the sample exercises.'
                : `Nothing matches “${query}”${group !== 'All' ? ` in ${group}` : ''}. Try another search or muscle group.`
            }
            action={
              exercises.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => { setQuery(''); setGroup('All') }}>
                  <Dumbbell size={16} /> Clear filters
                </Button>
              )
            }
          />
        ) : (
          <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((ex) => (
                <ExerciseCard key={ex.id} ex={ex} inWorkout={inWorkout.has(ex.id)} adding={adding === ex.id} onAdd={addToWorkout} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
