type Props = {
  children: React.ReactNode
  className?: string
  accentColor?: 'health' | 'wealth' | 'ai' | 'none'
}

const accentStyles = {
  health: 'border-green-500/15 shadow-[0_0_20px_rgba(34,197,94,0.04)]',
  wealth: 'border-blue-500/15 shadow-[0_0_20px_rgba(59,130,246,0.04)]',
  ai: 'border-violet-400/15 shadow-[0_0_20px_rgba(167,139,250,0.04)]',
  none: 'border-white/[0.06]',
}

export default function GlassCard({ children, className = '', accentColor = 'none' }: Props) {
  return (
    <div
      className={`
        rounded-2xl border bg-white/[0.03] p-4 backdrop-blur-xl
        lg:p-5
        ${accentStyles[accentColor]}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
