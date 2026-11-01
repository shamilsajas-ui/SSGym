import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, CircleAlert, Eye, EyeOff, LoaderCircle, Lock, LogIn, Mail, User, UserPlus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import Button from '../components/Button'

function Field({ icon: Icon, label, id, children }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-2">{label}</span>
      <span className="glass flex h-12 items-center gap-3 rounded-2xl px-4 transition focus-within:ring-2 focus-within:ring-accent/60">
        <Icon size={18} className="shrink-0 text-ink-3" />
        {children}
      </span>
    </label>
  )
}

const inputCls = 'h-full min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3'

function PasswordInput({ id, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
        minLength={autoComplete === 'new-password' ? 8 : undefined}
        placeholder="••••••••"
        className={inputCls}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="rounded-lg p-1 text-ink-3 hover:text-ink"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </>
  )
}

function ChoiceRow({ label, options, value, onChange, format = (v) => v, name }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-ink-2">{label}</legend>
      <div className="grid grid-cols-5 gap-2" role="radiogroup">
        {options.map((o) => {
          const active = o === value
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${name} ${o}`}
              onClick={() => onChange(o)}
              className={`relative h-11 rounded-xl text-sm font-semibold transition-colors ${active ? 'text-accent-ink' : 'bg-surface-2 text-ink-2 hover:text-ink'}`}
            >
              {active && <motion.span layoutId={`choice-${name}`} className="bg-gradient-brand glow absolute inset-0 rounded-xl" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
              <span className="relative">{format(o)}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function AuthShell({ title, subtitle, children, footer }) {
  const { navigate } = useApp()
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" />
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo onClick={() => navigate('home')} />
        <ThemeToggle />
      </header>
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pt-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md"
        >
          <div className="bg-gradient-brand pointer-events-none absolute -inset-1 rounded-[2.2rem] opacity-20 blur-2xl" />
          <div className="glass relative rounded-[2rem] p-6 sm:p-8" style={{ background: 'color-mix(in srgb, var(--bg) 80%, transparent)' }}>
            <button onClick={() => navigate('home')} className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-3 transition hover:text-ink">
              <ArrowLeft size={15} /> Back to home
            </button>
            <h1 className="text-3xl font-bold text-ink">{title}</h1>
            <p className="mt-1.5 text-ink-2">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>
          <p className="relative mt-6 text-center text-sm text-ink-2">{footer}</p>
        </motion.div>
      </main>
    </div>
  )
}

function FormError({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          role="alert"
          className="flex items-start gap-2 overflow-hidden rounded-2xl bg-danger/10 px-3.5 py-3 text-sm text-danger"
        >
          <CircleAlert size={16} className="mt-0.5 shrink-0" /> {message}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

export function Login() {
  const { login, navigate } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to pick up where you left off."
      footer={<>New to PulseFit? <button onClick={() => navigate('signup')} className="font-semibold text-accent-text hover:underline">Create an account</button></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field icon={Mail} label="Email" id="login-email">
          <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required placeholder="you@example.com" className={inputCls} />
        </Field>
        <Field icon={Lock} label="Password" id="login-password">
          <PasswordInput id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </Field>
        <FormError message={error} />
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? <LoaderCircle size={18} className="animate-spin" /> : <LogIn size={18} />} Log in
        </Button>
      </form>
    </AuthShell>
  )
}

export function Signup() {
  const { signup, navigate } = useApp()
  const [f, setF] = useState({ fullName: '', email: '', password: '', weeklyGoalWorkouts: 4, weeklyGoalMinutes: 150 })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e?.target ? e.target.value : e }))

  const submit = async (e) => {
    e.preventDefault()
    if (f.password.length < 8) return setError('Your password needs at least 8 characters.')
    setBusy(true)
    setError('')
    try {
      await signup(f)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Join PulseFit"
      subtitle="Set your weekly goals and start training smarter."
      footer={<>Already a member? <button onClick={() => navigate('login')} className="font-semibold text-accent-text hover:underline">Log in</button></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field icon={User} label="Full name" id="su-name">
          <input id="su-name" value={f.fullName} onChange={set('fullName')} autoComplete="name" required maxLength={80} placeholder="Alex Rivera" className={inputCls} />
        </Field>
        <Field icon={Mail} label="Email" id="su-email">
          <input id="su-email" type="email" value={f.email} onChange={set('email')} autoComplete="email" required placeholder="you@example.com" className={inputCls} />
        </Field>
        <Field icon={Lock} label="Password (8+ characters)" id="su-password">
          <PasswordInput id="su-password" value={f.password} onChange={set('password')} autoComplete="new-password" />
        </Field>
        <ChoiceRow name="workouts" label="Workouts per week" options={[2, 3, 4, 5, 6]} value={f.weeklyGoalWorkouts} onChange={set('weeklyGoalWorkouts')} />
        <ChoiceRow name="minutes" label="Active minutes per week" options={[60, 120, 150, 200, 300]} value={f.weeklyGoalMinutes} onChange={set('weeklyGoalMinutes')} />
        <FormError message={error} />
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? <LoaderCircle size={18} className="animate-spin" /> : <UserPlus size={18} />} Create account
        </Button>
      </form>
    </AuthShell>
  )
}
