import { Heart } from 'lucide-react'
import Logo from './Logo'

export default function Footer({ onLogo }) {
  return (
    <footer className="mt-16 border-t border-line pt-8 pb-4">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Logo size="sm" onClick={onLogo} />
        <p className="flex items-center gap-1.5 text-sm text-ink-3">
          © {new Date().getFullYear()} PulseFit · Built with <Heart size={14} className="text-accent-text" /> for lifters everywhere
        </p>
      </div>
    </footer>
  )
}
