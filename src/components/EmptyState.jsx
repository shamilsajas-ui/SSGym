import { motion } from 'framer-motion'

export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass flex flex-col items-center rounded-3xl border-dashed px-6 py-14 text-center"
    >
      <motion.span
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="grid size-16 place-items-center rounded-2xl bg-surface-2 text-ink-3"
      >
        {Icon && <Icon size={28} />}
      </motion.span>
      <h3 className="mt-5 text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-2">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}
