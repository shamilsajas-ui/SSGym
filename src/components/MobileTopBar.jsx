import { LogIn, LogOut } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { initials } from '../lib/api'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

export default function MobileTopBar() {
  const { navigate, user, logout } = useApp()
  return (
    <header className="sticky top-0 z-30 -mx-4 mb-4 flex items-center justify-between bg-bg/70 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:hidden">
      <Logo size="sm" onClick={() => navigate('home')} />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user ? (
          <>
            <button
              onClick={logout}
              className="glass grid size-10 place-items-center rounded-xl text-ink-2 transition hover:text-ink"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={17} />
            </button>
            <button
              onClick={() => navigate('profile')}
              className="bg-gradient-brand grid size-10 place-items-center rounded-xl font-display text-sm font-bold text-accent-ink"
              aria-label={`Open profile for ${user.fullName}`}
            >
              {initials(user.fullName)}
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('login')}
            className="bg-gradient-brand inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-accent-ink"
          >
            <LogIn size={16} /> Log in
          </button>
        )}
      </div>
    </header>
  )
}
