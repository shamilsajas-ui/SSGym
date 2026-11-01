import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bike, CalendarDays, CalendarX, Check, Clock, LoaderCircle, Mountain, Target, Users, X, Zap } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { classTypes, classes, weekDays } from '../data/mock'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'

const typeStyle = {
  Yoga: { icon: Mountain, chip: 'bg-violet-500/15 text-violet-500 dark:text-violet-300' },
  HIIT: { icon: Zap, chip: 'bg-orange-500/15 text-orange-600 dark:text-orange-300' },
  Spin: { icon: Bike, chip: 'bg-cyan/15 text-cyan' },
  Boxing: { icon: Target, chip: 'bg-rose-500/15 text-rose-600 dark:text-rose-300' },
}

const todayIdx = (new Date().getDay() + 6) % 7

function dateFor(idx) {
  const d = new Date()
  d.setDate(d.getDate() + (idx - todayIdx))
  return d.getDate()
}

function ClassCard({ ref, cl, isBooked, onBook, onCancel, loading }) {
  const s = typeStyle[cl.type]
  const Icon = s.icon
  const spots = isBooked ? cl.spots - 1 : cl.spots
  const full = cl.spots === 0
  const fill = 1 - Math.max(0, spots) / cl.capacity
  const low = !full && spots <= 3

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      whileHover={{ y: -4 }}
      className={`glass flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center ${isBooked ? 'ring-1 ring-accent/50' : ''}`}
    >
      <div className="flex items-center gap-4 sm:w-28 sm:flex-col sm:items-start sm:gap-1">
        <p className="font-display text-2xl font-bold text-ink tabular-nums">{cl.time}</p>
        <p className="flex items-center gap-1 text-sm text-ink-3"><Clock size={14} /> {cl.duration} min</p>
      </div>

      <div className="min-w-0 flex-1">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.chip}`}>
          <Icon size={13} /> {cl.type}
        </span>
        <h3 className="mt-2 text-lg font-semibold text-ink">{cl.title}</h3>
        <p className="text-sm text-ink-3">with {cl.coach} · {'⚡'.repeat(cl.intensity)}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2 sm:max-w-48">
            <motion.div
              className={`h-full rounded-full ${full ? 'bg-ink-3' : low ? 'bg-orange-400' : 'bg-gradient-brand'}`}
              initial={{ width: 0 }}
              animate={{ width: `${fill * 100}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </div>
          <span className={`flex items-center gap-1 text-xs font-semibold ${full ? 'text-ink-3' : low ? 'text-orange-500 dark:text-orange-300' : 'text-ink-2'}`}>
            <Users size={13} />
            {full ? 'Full' : `${spots} spot${spots === 1 ? '' : 's'} left`}
          </span>
        </div>
      </div>

      <div className="sm:w-36">
        {isBooked ? (
          <div className="flex gap-2">
            <span className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-accent/15 text-sm font-semibold text-accent-text">
              <Check size={16} /> Booked
            </span>
            <button
              onClick={() => onCancel(cl)}
              className="grid size-11 place-items-center rounded-2xl bg-surface-2 text-ink-3 transition hover:bg-danger/15 hover:text-danger"
              aria-label={`Cancel ${cl.title}`}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <Button
            variant={full ? 'subtle' : 'primary'}
            className="w-full"
            onClick={() => onBook(cl)}
            disabled={loading}
            aria-label={full ? `${cl.title} is full` : `Book ${cl.title}`}
          >
            {loading ? <LoaderCircle size={18} className="animate-spin" /> : full ? 'Join waitlist' : 'Book'}
          </Button>
        )}
      </div>
    </motion.article>
  )
}

export default function Classes() {
  const { booked, bookClass, cancelClass, toast } = useApp()
  const [day, setDay] = useState(weekDays[todayIdx])
  const [type, setType] = useState('All')
  const [loadingId, setLoadingId] = useState(null)
  const activeDayRef = useRef(null)

  // Keep the selected day visible in the horizontally scrolling picker on mobile
  useEffect(() => {
    activeDayRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [day])

  const list = useMemo(
    () => classes.filter((c) => c.day === day && (type === 'All' || c.type === type)).sort((a, b) => a.time.localeCompare(b.time)),
    [day, type],
  )

  const handleBook = (cl) => {
    if (cl.spots === 0) {
      toast(`${cl.title} is fully booked. We’ll let you know if a spot opens up.`, { type: 'error', title: 'Class is full' })
      return
    }
    setLoadingId(cl.id)
    setTimeout(() => {
      bookClass(cl.id)
      setLoadingId(null)
      toast(`${cl.title} · ${cl.day} at ${cl.time} with ${cl.coach}`, { title: 'You’re booked! 🎉' })
    }, 700)
  }

  const handleCancel = (cl) => {
    cancelClass(cl.id)
    toast(`Your spot in ${cl.title} has been released.`, { type: 'info', title: 'Booking cancelled' })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Class booking"
        title="This week’s schedule"
        subtitle="Yoga, HIIT, Spin and Boxing with PulseFit coaches"
        action={
          <span className="glass inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-ink">
            <CalendarDays size={16} className="text-accent-text" /> {booked.size} booked
          </span>
        }
      />

      {/* Day picker */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {weekDays.map((d, i) => {
          const active = d === day
          const count = classes.filter((c) => c.day === d).length
          return (
            <button
              key={d}
              ref={active ? activeDayRef : undefined}
              onClick={() => setDay(d)}
              aria-pressed={active}
              className={`relative flex min-w-[4.25rem] flex-1 shrink-0 flex-col items-center rounded-2xl py-3 transition-colors ${
                active ? 'text-accent-ink' : 'glass text-ink-2 hover:text-ink'
              }`}
            >
              {active && (
                <motion.span layoutId="day-pill" className="bg-gradient-brand glow absolute inset-0 rounded-2xl" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />
              )}
              <span className="relative text-xs font-medium uppercase tracking-wider opacity-80">{i === todayIdx ? 'Today' : d}</span>
              <span className="relative font-display text-2xl font-bold">{dateFor(i)}</span>
              <span className="relative mt-1 flex gap-0.5">
                {Array.from({ length: count }).map((_, k) => (
                  <span key={k} className={`size-1 rounded-full ${active ? 'bg-accent-ink/60' : 'bg-ink-3'}`} />
                ))}
              </span>
            </button>
          )
        })}
      </div>

      {/* Type filter */}
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {['All', ...classTypes].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            aria-pressed={type === t}
            className={`h-9 shrink-0 rounded-full px-4 text-sm font-medium transition ${
              type === t ? 'bg-ink text-bg' : 'bg-surface-2 text-ink-2 hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {list.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="No classes here"
            message={`There’s no ${type === 'All' ? '' : type + ' '}class on ${day}. Try another day or show all class types.`}
            action={type !== 'All' && <Button variant="ghost" size="sm" onClick={() => setType('All')}>Show all types</Button>}
          />
        ) : (
          <AnimatePresence mode="popLayout">
            {list.map((cl) => (
              <ClassCard
                key={cl.id}
                cl={cl}
                isBooked={booked.has(cl.id)}
                loading={loadingId === cl.id}
                onBook={handleBook}
                onCancel={handleCancel}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
