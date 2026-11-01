import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-gradient-brand text-accent-ink font-semibold glow hover:brightness-110',
  ghost: 'glass text-ink hover:bg-surface-2',
  subtle: 'bg-surface-2 text-ink hover:bg-line',
  danger: 'bg-danger/15 text-danger hover:bg-danger/25',
}

const sizes = {
  sm: 'h-9 px-3.5 text-sm rounded-xl gap-1.5',
  md: 'h-11 px-5 text-sm rounded-2xl gap-2',
  lg: 'h-14 px-7 text-base rounded-2xl gap-2.5',
}

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      className={`inline-flex items-center justify-center whitespace-nowrap transition-[filter,background-color,color] disabled:pointer-events-none disabled:opacity-45 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
