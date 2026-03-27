'use client'

type Props = {
  children: React.ReactNode
  className?: string
}

export default function SoftAurora({ children, className = '' }: Props) {
  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      {/* 오로라 레이어 */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 25% 15%, rgba(34,197,94,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 75% 85%, rgba(59,130,246,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(167,139,250,0.04) 0%, transparent 60%)
          `,
          backgroundSize: '200% 200%',
          animation: 'aurora 20s ease-in-out infinite',
        }}
      />
      {/* 콘텐츠 */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
