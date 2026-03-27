'use client'

import { useEffect, useState } from 'react'
import type { PortfolioItem } from '@/types'
import { FIXED_EXCHANGE_RATE } from '@/lib/constants'

export function PortfolioSection() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])

  useEffect(() => {
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => setPortfolio(Array.isArray(data) ? data : []))
  }, [])

  const getReturnRate = (item: PortfolioItem) => {
    if (item.avg_price === 0) return 0
    return ((item.current_price - item.avg_price) / item.avg_price) * 100
  }

  const totalValueKRW = portfolio.reduce((sum, item) => {
    const price = item.current_price * item.quantity
    return sum + (item.currency === 'USD' ? price * FIXED_EXCHANGE_RATE : price)
  }, 0)

  return (
    <section className="rounded-xl bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-white">포트폴리오</h2>
        <span className="text-sm text-gray-400">
          총 {totalValueKRW.toLocaleString()}원
        </span>
      </div>
      <div className="space-y-2">
        {portfolio.map(item => {
          const returnRate = getReturnRate(item)
          const isPositive = returnRate >= 0
          return (
            <div key={item.ticker} className="flex items-center justify-between rounded-lg bg-gray-800 p-3">
              <div>
                <div className="text-sm font-semibold text-white">{item.name}</div>
                <div className="text-xs text-gray-400">{item.quantity}주 · 평단 {item.avg_price.toLocaleString()}{item.currency === 'KRW' ? '원' : '$'}</div>
              </div>
              <div className={`text-sm font-bold ${isPositive ? 'text-red-400' : 'text-blue-400'}`}>
                {isPositive ? '+' : ''}{returnRate.toFixed(1)}%
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
