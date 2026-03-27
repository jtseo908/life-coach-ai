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
  const [isConfirmed, setIsConfirmed] = useState(false)

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
      <div>
        <h2 className="text-lg font-bold text-white">포트폴리오를 알려주세요</h2>
        <p className="mt-1 text-xs text-gray-500">보유 종목을 자유롭게 입력하면 AI가 자동으로 파싱합니다.</p>
      </div>

      <textarea
        className="min-h-[100px] w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-600 backdrop-blur-sm transition-colors focus:border-blue-500/30 focus:outline-none"
        placeholder="예: 삼성전자 100주 평단 7만원, 테슬라 5주 평단 250달러"
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      <button
        onClick={handleParse}
        disabled={!input.trim() || isLoading}
        className="w-full rounded-xl border border-violet-400/30 bg-gradient-to-r from-violet-500/20 to-blue-500/20 py-2.5 text-sm font-semibold text-violet-300 transition-all hover:from-violet-500/30 hover:to-blue-500/30 disabled:opacity-50"
      >
        ✦ AI로 분석하기
      </button>

      {isLoading && <LoadingSpinner />}

      {parsedItems && !isConfirmed && (
        <ParsedResultCard
          items={parsedItems}
          onConfirm={(items) => {
            setIsConfirmed(true)
            onConfirm(items)
          }}
        />
      )}

      {isConfirmed && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/[0.06] p-3 text-center text-sm text-green-400">
          ✓ 포트폴리오 등록 완료
        </div>
      )}
    </div>
  )
}
