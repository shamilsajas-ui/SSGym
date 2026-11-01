import { motion } from 'framer-motion'
import { Flame, LogIn, LogOut } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { initials } from '../lib/api'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import Button from './Button'
import { navItems } from './nav'

export default function Sidebar() {
  const { page, navigate, user, logout } = useApp()
  return (
    <aside className="glass sticky top-4 z-30 m-4 hidden h-[calc(100dvh-2rem)] w-64 shrink-0 flex-col rounded-3xl p-5 lg:flex">
      <div className="px-1">
        <Logo onClick={() => navigate('home')} />
      </div>

      <nav className="mt-10 flex flex-col gap-1" aria-label="Main">
        {navItems.map((item) => {
          const active = page === item.key
          const Icon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.key)}
              className={`relative flex h-11 items-center gap-3 rounded-2xl px-3.5 text-sm font-medium transition-colors ${
                active ? 'text-accent-ink' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="bg-gradient-brand glow absolute inset-0 rounded-2xl"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <Icon size={18} className="relative" />
              <span className="relative">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto space-y-4">
        {user ? (
          <>
            <div className="rounded-2xl bg-surface-2 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
                  <Flame size={18} className="text-orange-400" />
                </motion.span>
                {user.streak}-day streak
              </div>
              <p className="mt-1 text-xs text-ink-3">
                {user.trainedToday ? 'Trained today. Nice work!' : user.streak ? 'Train today to keep it alive.' : 'Finish a workout to start one.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('profile')} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left">
                <span className="bg-gradient-brand grid size-10 shrink-0 place-items-center rounded-xl font-display text-sm font-bold text-accent-ink">
                  {initials(user.fullName)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{user.fullName}</span>
                  <span className="block truncate text-xs text-ink-3">{user.email}</span>
                </span>
              </button>
              <ThemeToggle />
            </div>
            <Button variant="subtle" size="sm" className="w-full" onClick={logout}>
              <LogOut size={15} /> Log out
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" className="flex-1" onClick={() => navigate('login')}>
              <LogIn size={15} /> Log in
            </Button>
            <ThemeToggle />
          </div>
        )}
      </div>
    </aside>
  )
}
