import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../lib/api'

const AppContext = createContext(null)

export const PAGES = ['home', 'login', 'signup', 'dashboard', 'library', 'workout', 'progress', 'classes', 'profile']
export const PROTECTED = ['dashboard', 'library', 'workout', 'profile']
const NEXT_KEY = 'pulsefit-next'

function readHash() {
  const key = window.location.hash.replace('#/', '').replace('#', '')
  return PAGES.includes(key) ? key : 'home'
}

export function AppProvider({ children }) {
  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('pulsefit-theme') || 'dark')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#07090d' : '#f4f6f1')
    localStorage.setItem('pulsefit-theme', theme)
  }, [theme])
  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  // Hash routing so the browser back button works
  const [page, setPage] = useState(readHash)
  useEffect(() => {
    const onHash = () => setPage(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const navigate = useCallback((key, { replace = false } = {}) => {
    if (replace) {
      window.location.replace(`#/${key}`)
    } else {
      window.location.hash = `/${key}`
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  // Toasts
  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const toast = useCallback(
    (message, { type = 'success', title } = {}) => {
      const id = ++toastId.current
      setToasts((t) => [...t.slice(-2), { id, message, type, title }])
      setTimeout(() => dismissToast(id), 3600)
    },
    [dismissToast],
  )

  // Auth (session lives in an httpOnly cookie; we only ever see the user object)
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [authError, setAuthError] = useState(null)

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await api('/auth/me')
      setUser(user)
      setAuthError(null)
    } catch (err) {
      setUser(null)
      setAuthError(err.status === 401 ? null : err)
    } finally {
      setAuthReady(true)
    }
  }, [])
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const afterAuth = useCallback(
    (u) => {
      setUser(u)
      setAuthError(null)
      const next = sessionStorage.getItem(NEXT_KEY)
      sessionStorage.removeItem(NEXT_KEY)
      navigate(PROTECTED.includes(next) ? next : 'dashboard', { replace: true })
    },
    [navigate],
  )

  const login = useCallback(
    async (email, password) => {
      const { user } = await api('/auth/login', { method: 'POST', body: { email, password } })
      afterAuth(user)
      toast(`Welcome back, ${user.fullName.split(' ')[0]}!`, { title: 'Logged in' })
    },
    [afterAuth, toast],
  )

  const signup = useCallback(
    async (fields) => {
      const { user } = await api('/auth/signup', { method: 'POST', body: fields })
      afterAuth(user)
      toast('Your account is ready. Let’s build your first workout!', { title: `Welcome, ${user.fullName.split(' ')[0]} 🎉` })
    },
    [afterAuth, toast],
  )

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch {
      /* cookie is cleared server-side when reachable; drop local state regardless */
    }
    setUser(null)
    navigate('home')
    toast('See you at your next session 👋', { type: 'info', title: 'Logged out' })
  }, [navigate, toast])

  // Guard: protected pages need a session; auth pages bounce logged-in users to the dashboard
  useEffect(() => {
    if (!authReady || authError) return
    if (!user && PROTECTED.includes(page)) {
      sessionStorage.setItem(NEXT_KEY, page)
      navigate('login', { replace: true })
    } else if (user && (page === 'login' || page === 'signup')) {
      navigate('dashboard', { replace: true })
    }
  }, [authReady, authError, user, page, navigate])

  // Class bookings (Class Booking screen still uses mock data — no bookings table yet)
  const [booked, setBooked] = useState(() => new Set(['c5']))
  const bookClass = useCallback((id) => setBooked((b) => new Set(b).add(id)), [])
  const cancelClass = useCallback(
    (id) =>
      setBooked((b) => {
        const n = new Set(b)
        n.delete(id)
        return n
      }),
    [],
  )

  const value = useMemo(
    () => ({
      theme, toggleTheme,
      page, navigate,
      toasts, toast, dismissToast,
      user, authReady, authError, refreshUser, login, signup, logout,
      booked, bookClass, cancelClass,
    }),
    [theme, toggleTheme, page, navigate, toasts, toast, dismissToast, user, authReady, authError, refreshUser, login, signup, logout, booked, bookClass, cancelClass],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
