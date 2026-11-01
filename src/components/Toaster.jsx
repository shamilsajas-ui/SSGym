import { AnimatePresence, motion } from 'framer-motion'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

const styles = {
  success: { icon: CircleCheck, color: 'text-accent-text', ring: 'bg-accent/15' },
  error: { icon: CircleAlert, color: 'text-danger', ring: 'bg-danger/15' },
  info: { icon: Info, color: 'text-cyan', ring: 'bg-cyan/15' },
}

export default function Toaster() {
  const { toasts, dismissToast } = useApp()
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-3 sm:top-auto sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const s = styles[t.type] ?? styles.success
          const Icon = s.icon
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="glass pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl p-3.5 pr-2"
              role={t.type === 'error' ? 'alert' : 'status'}
            >
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${s.ring} ${s.color}`}>
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                {t.title && <p className="text-sm font-semibold text-ink">{t.title}</p>}
                <p className="text-sm text-ink-2">{t.message}</p>
              </div>
              <button
                onClick={() => dismissToast(t.id)}
                className="rounded-lg p-1.5 text-ink-3 transition hover:bg-surface-2 hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
