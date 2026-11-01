import { useId } from 'react'
import { motion } from 'framer-motion'

/**
 * Animated circular progress. `value` is 0–1.
 * `from`/`to` are gradient stops; defaults to the brand gradient.
 */
export default function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  from = 'var(--grad-from)',
  to = 'var(--grad-to)',
  duration = 1.4,
  delay = 0.2,
  animateOnView = true,
  children,
  label,
}) {
  const id = useId()
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(1, value))
  const target = c * (1 - clamped)

  const animProps = animateOnView
    ? { initial: { strokeDashoffset: c }, whileInView: { strokeDashoffset: target }, viewport: { once: true } }
    : { initial: false, animate: { strokeDashoffset: target } }

  return (
    <div
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${Math.round(clamped * 100)}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: 'drop-shadow(0 0 6px var(--glow))' }}
          {...animProps}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}
