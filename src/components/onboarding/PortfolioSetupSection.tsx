'use client'

import { useState } from 'react'
import type { PortfolioItem } from '@/types'
import { ParsedResultCard } from '@/components/ui/ParsedResultCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

type Props = {
  onConfirm: (items: PortfolioItem[]) => void
}

export function PortfolioSetupSection({ onConfirm }: Props) {
  const [input, setInput] = useState('')
  const [parsedItems, setParsedItems] = useState<PortfolioItem[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleParse = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'portfolio', input }),
      })
      const data = await res.json()
      setParsedItems(data.items)
    } catch {
      alert('파싱에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">포트폴리오 등록</h2>
      <textarea
        className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white placeholder-gray-500 min-h-[100px]"
        placeholder="예: 삼성전자 100주 평단 7만원, 테슬라 5주 평단 250달러"
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <button
        onClick={handleParse}
        disabled={!input.trim() || isLoading}
        className="w-full rounded-lg bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
      >
        AI로 분석하기
      </button>
      {isLoading && <LoadingSpinner />}
      {parsedItems && <ParsedResultCard items={parsedItems} onConfirm={onConfirm} />}
    </div>
  )
}
