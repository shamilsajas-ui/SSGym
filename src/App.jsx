import { AnimatePresence, motion } from 'framer-motion'
import { PROTECTED, useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import MobileTopBar from './components/MobileTopBar'
import Toaster from './components/Toaster'
import Footer from './components/Footer'
import ErrorState from './components/ErrorState'
import { SkeletonCard } from './components/Skeleton'
import Landing from './pages/Landing'
import { Login, Signup } from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import LiveWorkout from './pages/LiveWorkout'
import Progress from './pages/Progress'
import Classes from './pages/Classes'
import Profile from './pages/Profile'

const screens = {
  dashboard: Dashboard,
  library: Library,
  workout: LiveWorkout,
  progress: Progress,
  classes: Classes,
  profile: Profile,
}

const fullScreen = { home: Landing, login: Login, signup: Signup }

const pageMotion = {
  initial: { opacity: 0, y: 14, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
}

function PageGate({ children }) {
  const { page, user, authReady, authError, refreshUser } = useApp()
  if (!PROTECTED.includes(page)) return children
  if (authError) return <ErrorState error={authError} onRetry={refreshUser} />
  if (!authReady || !user) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <SkeletonCard className="h-48 lg:col-span-2" />
        <SkeletonCard className="h-48" />
      </div>
    )
  }
  return children
}

export default function App() {
  const { page, navigate } = useApp()

  const Full = fullScreen[page]
  if (Full) {
    return (
      <div className="ambient relative min-h-dvh overflow-x-clip">
        <AnimatePresence mode="wait">
          <motion.div key={page} {...pageMotion} className="relative z-10">
            <Full />
          </motion.div>
        </AnimatePresence>
        <Toaster />
      </div>
    )
  }

  const Screen = screens[page] ?? Dashboard

  return (
    <div className="ambient relative flex min-h-dvh overflow-x-clip">
      <Sidebar />
      <main className="relative z-10 min-w-0 flex-1 px-4 pb-32 sm:px-6 lg:px-8 lg:pt-8 lg:pb-8">
        <MobileTopBar />
        <div className="mx-auto max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div key={page} {...pageMotion}>
              <PageGate>
                <Screen />
              </PageGate>
            </motion.div>
          </AnimatePresence>
          <Footer onLogo={() => navigate('home')} />
        </div>
      </main>
      <BottomNav />
      <Toaster />
    </div>
  )
}
