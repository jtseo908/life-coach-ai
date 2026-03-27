'use client'

type Props = {
  children: React.ReactNode
  className?: string
  /** 빛 흐름 속도 (초) */
  speed?: number
}

export default function ShinyText({ children, className = '', speed = 3 }: Props) {
  return (
    <span
      className={`inline-block bg-clip-text ${className}`}
      style={{
        backgroundImage: `linear-gradient(
          90deg,
          currentColor 0%,
          currentColor 40%,
          rgba(255,255,255,0.9) 50%,
          currentColor 60%,
          currentColor 100%
        )`,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: `shiny ${speed}s linear infinite`,
      }}
    >
      {children}
    </span>
  )
}
