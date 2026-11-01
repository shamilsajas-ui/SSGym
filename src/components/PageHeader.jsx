import { motion } from 'framer-motion'

export default function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8"
    >
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">{eyebrow}</p>}
        <h1 className="mt-1 text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-ink-2">{subtitle}</p>}
      </div>
      {action}
    </motion.header>
  )
}
