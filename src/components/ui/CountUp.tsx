'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  end: number
  duration?: number
  decimals?: number
  className?: string
}

export default function CountUp({ end, duration = 1500, decimals = 0, className = '' }: Props) {
  const [display, setDisplay] = useState('0')
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    startTimeRef.current = null

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * end

      setDisplay(current.toFixed(decimals))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [end, duration, decimals])

  return <span className={className}>{display}</span>
}
