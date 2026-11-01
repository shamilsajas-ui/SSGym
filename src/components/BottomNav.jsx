import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { navItems } from './nav'

const mobileItems = navItems.filter((i) => i.key !== 'profile')

export default function BottomNav() {
  const { page, navigate } = useApp()
  return (
    <nav
      className="glass pb-safe fixed inset-x-3 bottom-3 z-40 rounded-3xl px-2 pt-2 lg:hidden"
      aria-label="Main"
    >
      <ul className="grid grid-cols-5 items-end">
        {mobileItems.map((item) => {
          const active = page === item.key
          const Icon = item.icon
          if (item.primary) {
            return (
              <li key={item.key} className="flex justify-center">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate(item.key)}
                  className="bg-gradient-brand glow -mt-7 grid size-14 place-items-center rounded-2xl text-accent-ink"
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon size={24} />
                </motion.button>
                <span className="sr-only">{item.short}</span>
              </li>
            )
          }
          return (
            <li key={item.key}>
              <button
                onClick={() => navigate(item.key)}
                className={`relative flex w-full flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-medium transition-colors ${
                  active ? 'text-accent-text' : 'text-ink-3'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="bottom-active"
                    className="absolute -top-2 h-1 w-8 rounded-full bg-accent"
                    style={{ boxShadow: '0 0 12px var(--glow)' }}
                  />
                )}
                <Icon size={21} />
                {item.short}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
