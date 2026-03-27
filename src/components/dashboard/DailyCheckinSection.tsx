'use client'

import { useState } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { ParsedCheckin } from '@/types'

type Props = {
  onCheckinComplete: () => void
}

export function DailyCheckinSection({ onCheckinComplete }: Props) {
  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState<ParsedCheckin | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleParse = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'checkin', input }),
      })
      const data = await res.json()
      setParsed(data)
    } catch {
      alert('파싱에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!parsed) return
    setIsSaving(true)
    try {
      // 1. 체크인 저장
      await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_input: input,
          health_data: parsed.health,
          finance_data: { trades: parsed.finance.trades, portfolio_snapshot: [], finance_score: 0 },
        }),
      })

      // 2. AI 코칭 생성
      await fetch('/api/coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: new Date().toISOString().split('T')[0] }),
      })

      setParsed(null)
      setInput('')
      onCheckinComplete()
    } catch {
      alert('저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="rounded-xl bg-gray-900 p-4 space-y-3">
      <h2 className="text-lg font-bold text-white">오늘의 데일리 체크인</h2>
      <textarea
        className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white placeholder-gray-500 min-h-[80px]"
        placeholder="오늘 하루를 자유롭게 입력하세요... 예: 러닝 5km, 샐러드, 7시간 수면. 삼성전자 10주 매수"
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      {!parsed && (
        <button
          onClick={handleParse}
          disabled={!input.trim() || isLoading}
          className="w-full rounded-lg bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? 'AI 분석 중...' : 'AI로 분석하기'}
        </button>
      )}

      {isLoading && <LoadingSpinner />}

      {parsed && (
        <div className="space-y-3">
          <div className="rounded-lg bg-gray-800 p-3">
            <div className="text-sm text-green-400 font-semibold mb-1">건강</div>
            <p className="text-sm text-gray-300">운동: {parsed.health.exercise}</p>
            <p className="text-sm text-gray-300">식단: {parsed.health.diet}</p>
            <p className="text-sm text-gray-300">수면: {parsed.health.sleep}</p>
            <p className="text-sm text-green-400 mt-1">점수: {parsed.health.health_score}점</p>
          </div>

          {parsed.finance.trades.length > 0 && (
            <div className="rounded-lg bg-gray-800 p-3">
              <div className="text-sm text-blue-400 font-semibold mb-1">투자</div>
              {parsed.finance.trades.map((t, i) => (
                <p key={i} className="text-sm text-gray-300">
                  {t.name} {t.quantity}주 {t.action === 'buy' ? '매수' : '매도'}
                </p>
              ))}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '확인하고 저장하기'}
          </button>
        </div>
      )}
    </section>
  )
}
