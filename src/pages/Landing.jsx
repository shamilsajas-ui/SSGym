import { motion } from 'framer-motion'
import {
  ArrowRight, CalendarDays, ChartLine, Dumbbell, Flame, LogIn, LogOut, Play, Sparkles, Timer, Trophy, Users, Zap,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useApiData } from '../lib/api'
import { Bone } from '../components/Skeleton'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import Button from '../components/Button'
import AnimatedCounter from '../components/AnimatedCounter'
import ProgressRing from '../components/ProgressRing'
import QuoteCard from '../components/QuoteCard'
import Footer from '../components/Footer'

const statDefs = [
  { key: 'members', field: 'members', label: 'Active members', icon: Users },
  { key: 'workouts', field: 'workoutsCompleted', label: 'Workouts completed', icon: Dumbbell },
  { key: 'classes', field: 'classesThisWeek', label: 'Classes this week', icon: CalendarDays },
]

const features = [
  { icon: Dumbbell, title: 'Smart workout library', text: 'Exercises across every muscle group, with sets, reps and difficulty already worked out.', to: 'library' },
  { icon: Timer, title: 'Live workout mode', text: 'Tick off sets, auto rest timers, and confetti when you finish the session.', to: 'workout' },
  { icon: ChartLine, title: 'Progress that pops', text: 'See your strength trend week by week and earn trophy badges for new PRs.', to: 'progress' },
  { icon: CalendarDays, title: 'Book classes', text: 'Yoga, HIIT, Spin and Boxing. Grab a spot before it’s gone.', to: 'classes' },
  { icon: Flame, title: 'Streaks & goals', text: 'Daily streaks and weekly rings keep you showing up.', to: 'dashboard' },
  { icon: Trophy, title: 'Achievements', text: 'Unlock badges as you hit milestones. Bragging rights included.', to: 'profile' },
]

const container = { animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }
const item = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const chipBg = { background: 'color-mix(in srgb, var(--bg) 82%, transparent)' }

function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]">
      {/* Rotating halo */}
      <motion.div
        className="absolute inset-10 rounded-full opacity-35"
        style={{ background: 'conic-gradient(from 0deg, var(--grad-from), var(--grad-to), transparent 60%, var(--grad-from))', filter: 'blur(60px)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      />

      {/* Center card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="glass absolute inset-[12%] flex flex-col items-center justify-center rounded-[2.5rem]"
        style={{ background: 'color-mix(in srgb, var(--bg) 72%, transparent)' }}
      >
        <ProgressRing value={0.78} size={200} stroke={16} animateOnView={false} delay={0.8} duration={1.8} label="Weekly goal 78% complete">
          <div>
            <p className="font-display text-5xl font-bold text-ink">
              <AnimatedCounter value={78} suffix="%" />
            </p>
            <p className="text-xs font-medium uppercase tracking-widest text-ink-3">Weekly goal</p>
          </div>
        </ProgressRing>
        {/* Heartbeat line */}
        <svg viewBox="0 0 240 40" className="mt-5 w-48" aria-hidden="true">
          <motion.path
            d="M0 20h60l10-14 14 28 12-22 8 8h136"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 1], opacity: [1, 1, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.7, 1] }}
            style={{ filter: 'drop-shadow(0 0 6px var(--glow))' }}
          />
        </svg>
      </motion.div>

      {/* Floating chips */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
        transition={{ opacity: { delay: 0.9 }, x: { delay: 0.9 }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
        className="glass absolute top-[6%] left-0 flex items-center gap-3 rounded-2xl p-3 pr-4"
        style={chipBg}
      >
        <span className="grid size-10 place-items-center rounded-xl bg-orange-500/15 text-orange-400">
          <Flame size={20} />
        </span>
        <div>
          <p className="font-display text-lg leading-none font-bold text-ink">12 days</p>
          <p className="text-xs text-ink-3">Current streak</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0, y: [0, 12, 0] }}
        transition={{ opacity: { delay: 1.1 }, x: { delay: 1.1 }, y: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
        className="glass absolute right-0 bottom-[10%] flex items-center gap-3 rounded-2xl p-3 pr-4"
        style={chipBg}
      >
        <span className="grid size-10 place-items-center rounded-xl bg-amber-400/15 text-amber-400">
          <Trophy size={20} />
        </span>
        <div>
          <p className="font-display text-lg leading-none font-bold text-ink">180 kg</p>
          <p className="text-xs text-ink-3">New deadlift PR</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: [0, -8, 0] }}
        transition={{ opacity: { delay: 1.3 }, y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 } }}
        className="glass absolute right-[4%] top-[14%] flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-ink"
        style={chipBg}
      >
        <Zap size={14} className="text-accent-text" /> 420 kcal
      </motion.div>
    </div>
  )
}

export default function Landing() {
  const { navigate, user, logout } = useApp()
  const stats = useApiData('/stats')
  // Logged out -> create an account first; logged in -> straight to the dashboard
  const startWorkout = () => navigate(user ? 'dashboard' : 'signup')

  return (
    <div className="relative">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[720px] opacity-60" />

      {/* Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo onClick={() => navigate('home')} />
          <nav className="hidden items-center gap-8 text-sm font-medium text-ink-2 md:flex" aria-label="Site">
            <a href="#features" className="transition hover:text-ink">Features</a>
            <button onClick={() => navigate('classes')} className="transition hover:text-ink">Classes</button>
            <button onClick={() => navigate('progress')} className="transition hover:text-ink">Progress</button>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <span className="hidden text-sm text-ink-2 sm:inline">
                  Hi, <span className="font-semibold text-ink">{user.fullName.split(' ')[0]}</span>
                </span>
                <Button size="sm" variant="ghost" onClick={() => navigate('dashboard')}>
                  Open app
                </Button>
                <button
                  onClick={logout}
                  className="glass grid size-10 place-items-center rounded-xl text-ink-2 transition hover:text-ink"
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={() => navigate('login')}>
                  <LogIn size={15} /> Log in
                </Button>
                <Button size="sm" onClick={() => navigate('signup')} className="hidden sm:inline-flex">
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Hero */}
        <section className="grid items-center gap-12 pt-8 pb-16 lg:grid-cols-[1.1fr_1fr] lg:pt-16 lg:pb-24">
          <motion.div variants={container} initial="initial" animate="animate" className="text-center lg:text-left">
            <motion.span
              variants={item}
              className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-ink-2"
            >
              <Sparkles size={14} className="text-accent-text" />
              Welcome to PulseFit: your training, supercharged
            </motion.span>

            <motion.h1
              variants={item}
              className="mt-6 text-5xl leading-[0.95] font-bold text-ink sm:text-6xl lg:text-7xl xl:text-8xl"
            >
              Train smarter.
              <br />
              <span className="text-gradient">Get stronger.</span>
            </motion.h1>

            <motion.p variants={item} className="mx-auto mt-6 max-w-xl text-lg text-ink-2 lg:mx-0">
              PulseFit plans your workouts, tracks every rep, books your classes and keeps your streak alive.
              Everything you need to train, in one app.
            </motion.p>

            <motion.div variants={item} className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button size="lg" onClick={startWorkout} className="w-full sm:w-auto">
                <Play size={18} fill="currentColor" /> Start Your Workout
              </Button>
              <Button size="lg" variant="ghost" onClick={() => navigate('dashboard')} className="w-full sm:w-auto">
                View dashboard <ArrowRight size={18} />
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.dl variants={item} className="mt-12 grid grid-cols-3 gap-3 sm:gap-4">
              {statDefs.map((s) => {
                const Icon = s.icon
                const value = stats.data?.[s.field]
                return (
                  <div key={s.key} className="glass rounded-2xl p-3 text-left sm:p-4">
                    <Icon size={18} className="text-accent-text" />
                    <dd className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
                      {stats.loading ? (
                        <Bone className="h-8 w-16" />
                      ) : value == null ? (
                        <span className="text-ink-3">—</span>
                      ) : (
                        <AnimatedCounter value={value} compact={value > 9999} />
                      )}
                    </dd>
                    <dt className="mt-0.5 text-[11px] leading-tight text-ink-3 sm:text-xs">{s.label}</dt>
                  </div>
                )
              })}
            </motion.dl>
            {stats.error && (
              <p className="mt-3 text-xs text-ink-3" role="status">
                Live stats are unavailable right now. {stats.error.message}
              </p>
            )}
          </motion.div>

          <HeroVisual />
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-24 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">Everything in one place</p>
            <h2 className="mt-3 text-4xl font-bold text-ink sm:text-5xl">Built for people who show up.</h2>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.button
                key={f.title}
                onClick={() => navigate(f.to)}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className="glass group relative overflow-hidden rounded-3xl p-6 text-left"
              >
                <div className="bg-gradient-brand pointer-events-none absolute -right-10 -bottom-10 size-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30" />
                <span className="grid size-12 place-items-center rounded-2xl bg-surface-2 text-accent-text transition-colors group-hover:bg-accent group-hover:text-accent-ink">
                  <f.icon size={22} />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{f.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-text">
                  Explore <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Quote + CTA */}
        <section className="grid gap-4 py-12 lg:grid-cols-2">
          <QuoteCard />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-brand relative overflow-hidden rounded-3xl p-8 text-accent-ink"
          >
            <div className="absolute -top-10 -right-10 size-48 rounded-full bg-white/25 blur-2xl" />
            <h2 className="relative text-3xl font-bold">Your next PR starts today.</h2>
            <p className="relative mt-2 opacity-80">Build today’s session in seconds. Let’s go.</p>
            <button
              onClick={startWorkout}
              className="relative mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-[#0b0f14] px-6 font-semibold text-white transition hover:scale-[1.03]"
            >
              <Play size={16} fill="currentColor" /> Start Your Workout
            </button>
          </motion.div>
        </section>

        <Footer onLogo={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
      </div>
    </div>
  )
}
