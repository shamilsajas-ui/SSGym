import { Quote } from 'lucide-react'
import { quotes } from '../data/mock'
import GlassCard from './GlassCard'

function quoteOfTheDay() {
  const now = new Date()
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
  return quotes[dayOfYear % quotes.length]
}

export default function QuoteCard({ delay = 0, className = '' }) {
  const q = quoteOfTheDay()
  return (
    <GlassCard delay={delay} className={`overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute -right-6 -top-6 size-32 rounded-full bg-gradient-brand opacity-10 blur-2xl" />
      <div className="flex items-start gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-brand text-accent-ink">
          <Quote size={18} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-3">Quote of the day</p>
          <p className="mt-1.5 font-display text-lg leading-snug font-medium text-ink">“{q.text}”</p>
          <p className="mt-2 text-sm text-ink-3">— {q.author}</p>
        </div>
      </div>
    </GlassCard>
  )
}
