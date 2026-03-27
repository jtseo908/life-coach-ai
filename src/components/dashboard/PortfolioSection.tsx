'use client'

import { useEffect, useState } from 'react'
import type { PortfolioItem } from '@/types'
import { FIXED_EXCHANGE_RATE } from '@/lib/constants'

export function PortfolioSection() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editItems, setEditItems] = useState<PortfolioItem[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const fetchPortfolio = () => {
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => setPortfolio(Array.isArray(data) ? data : []))
  }

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const handleRefreshPrices = async () => {
    setIsRefreshing(true)
    try {
      await fetch('/api/stock', { method: 'POST' })
      fetchPortfolio()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleStartEdit = () => {
    setEditItems(portfolio.map(item => ({ ...item })))
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditItems([])
  }

  const updateItem = (index: number, field: keyof PortfolioItem, value: string | number) => {
    setEditItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const removeItem = (index: number) => {
    setEditItems(prev => prev.filter((_, i) => i !== index))
  }

  const addItem = () => {
    setEditItems(prev => [...prev, { ticker: '', name: '', quantity: 0, avg_price: 0, currency: 'KRW' as const, current_price: 0 }])
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: editItems }),
      })
      fetchPortfolio()
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const getReturnRate = (item: PortfolioItem) => {
    if (item.avg_price === 0) return 0
    return ((item.current_price - item.avg_price) / item.avg_price) * 100
  }

  const totalValueKRW = portfolio.reduce((sum, item) => {
    const price = item.current_price * item.quantity
    return sum + (item.currency === 'USD' ? price * FIXED_EXCHANGE_RATE : price)
  }, 0)

  if (isEditing) {
    return (
      <section className="rounded-xl bg-gray-900 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">포트폴리오 편집</h2>
          <button onClick={handleCancelEdit} className="text-xs text-gray-400 hover:text-white">취소</button>
        </div>
        {editItems.map((item, i) => (
          <div key={i} className="rounded-lg bg-gray-800 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                className="flex-1 bg-gray-700 rounded px-2 py-1 text-white text-sm"
                value={item.name}
                onChange={e => updateItem(i, 'name', e.target.value)}
                placeholder="종목명"
              />
              <input
                className="w-28 bg-gray-700 rounded px-2 py-1 text-white text-sm font-mono"
                value={item.ticker}
                onChange={e => updateItem(i, 'ticker', e.target.value)}
                placeholder="티커"
              />
              <button onClick={() => removeItem(i)} className="text-red-400 text-sm hover:text-red-300">삭제</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                className="bg-gray-700 rounded px-2 py-1 text-white text-sm"
                value={item.quantity}
                onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                placeholder="수량"
              />
              <input
                type="number"
                className="bg-gray-700 rounded px-2 py-1 text-white text-sm"
                value={item.avg_price}
                onChange={e => updateItem(i, 'avg_price', Number(e.target.value))}
                placeholder="평단가"
              />
              <select
                className="bg-gray-700 rounded px-2 py-1 text-white text-sm"
                value={item.currency}
                onChange={e => updateItem(i, 'currency', e.target.value)}
              >
                <option value="KRW">KRW</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        ))}
        <button
          onClick={addItem}
          className="w-full rounded-lg border border-dashed border-gray-600 py-2 text-sm text-gray-400 hover:text-white hover:border-gray-400"
        >
          + 종목 추가
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </section>
    )
  }

  return (
    <section className="rounded-xl bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-white">포트폴리오</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            총 {totalValueKRW.toLocaleString()}원
          </span>
          <button
            onClick={handleRefreshPrices}
            disabled={isRefreshing}
            className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {isRefreshing ? '갱신 중...' : '시세 갱신'}
          </button>
          <button
            onClick={handleStartEdit}
            className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700"
          >
            편집
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {portfolio.map(item => {
          const returnRate = getReturnRate(item)
          const isPositive = returnRate >= 0
          return (
            <div key={item.ticker} className="flex items-center justify-between rounded-lg bg-gray-800 p-3">
              <div>
                <div className="text-sm font-semibold text-white">{item.name}</div>
                <div className="text-xs text-gray-400">
                  {item.quantity}주 · 평단 {item.avg_price.toLocaleString()}{item.currency === 'KRW' ? '원' : '$'}
                  {item.current_price !== item.avg_price && (
                    <span className="ml-1">· 현재 {item.current_price.toLocaleString()}{item.currency === 'KRW' ? '원' : '$'}</span>
                  )}
                </div>
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
