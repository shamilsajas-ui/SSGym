import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'framer-motion'

function format(n, { compact, decimals }) {
  if (compact) {
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
  }
  return n.toLocaleString('en', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export default function AnimatedCounter({ value, duration = 1.8, compact = false, decimals = 0, prefix = '', suffix = '', className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(decimals ? v : Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, value, duration, decimals])

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {format(display, { compact, decimals })}
      {suffix}
    </span>
  )
}
