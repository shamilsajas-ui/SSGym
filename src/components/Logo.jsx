import { useId } from 'react'

export function PulseMark({ size = 32 }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--grad-from)" />
          <stop offset="1" stopColor="var(--grad-to)" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="var(--surface-2)" stroke="var(--line)" />
      <path
        d="M8 34h12l5-12 8 22 6-16 4 6h13"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Logo({ size = 'md', onClick }) {
  const text = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-2xl'
  const mark = size === 'lg' ? 40 : size === 'sm' ? 26 : 32
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2.5 select-none"
      aria-label="PulseFit home"
    >
      <span className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
        <PulseMark size={mark} />
      </span>
      <span className={`font-display font-bold tracking-tight ${text}`}>
        <span className="text-gradient">Pulse</span>
        <span className="text-ink">Fit</span>
      </span>
    </button>
  )
}
