type Props = {
  children: React.ReactNode
  className?: string
  color?: 'ai' | 'health' | 'wealth'
}

const glowStyles = {
  ai: 'border-violet-400/[0.12] shadow-[0_0_20px_rgba(167,139,250,0.04)]',
  health: 'border-green-500/[0.12] shadow-[0_0_20px_rgba(34,197,94,0.04)]',
  wealth: 'border-blue-500/[0.12] shadow-[0_0_20px_rgba(59,130,246,0.04)]',
}

export default function BorderGlow({ children, className = '', color = 'ai' }: Props) {
  return (
    <div
      className={`
        rounded-2xl border bg-white/[0.03] p-4 backdrop-blur-xl
        lg:p-5
        ${glowStyles[color]}
        ${className}
      `}
      style={{ animation: 'glow-pulse 2s ease-in-out infinite' }}
    >
      {children}
    </div>
  )
}
