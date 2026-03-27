'use client'

import { useState } from 'react'
import type { PortfolioItem } from '@/types'

type Props = {
  items: PortfolioItem[]
  onConfirm: (items: PortfolioItem[]) => void
}

export function ParsedResultCard({ items: initialItems, onConfirm }: Props) {
  const [items, setItems] = useState(initialItems)

  const updateItem = (index: number, field: keyof PortfolioItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-400">AI 파싱 결과 (수정 가능)</h3>
      {items.map((item, i) => (
        <div key={i} className="rounded-lg bg-gray-800 p-3 space-y-2">
          <input
            className="w-full bg-gray-700 rounded px-2 py-1 text-white text-sm"
            value={item.name}
            onChange={e => updateItem(i, 'name', e.target.value)}
          />
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
        onClick={() => onConfirm(items)}
        className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        확인
      </button>
    </div>
  )
}
