'use client'

import { useState } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { ParsedCheckin } from '@/types'

type Props = {
  onCheckinComplete: () => void
}

const INTENSITY_LABELS = {
  high: '고강도',
  moderate: '중강도',
  low: '저강도',
  none: '없음',
} as const

const TYPE_LABELS = {
  aerobic: '유산소',
  anaerobic: '무산소',
  mixed: '복합',
  active_recovery: '능동적 회복',
  none: '없음',
} as const

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
      await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_input: input,
          health_data: parsed.health,
          finance_data: { trades: parsed.finance.trades, portfolio_snapshot: [], finance_score: 0 },
        }),
      })

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

  const breakdown = parsed?.health?.score_breakdown
  const exerciseDetail = parsed?.health?.exercise_detail
  const dietDetail = parsed?.health?.diet_detail

  return (
    <section className="rounded-xl bg-gray-900 p-4 space-y-3">
      <h2 className="text-lg font-bold text-white">오늘의 데일리 체크인</h2>
      <textarea
        className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white placeholder-gray-500 min-h-[80px]"
        placeholder="오늘 하루를 자유롭게 입력하세요... 예: 러닝 5km 40분, 닭가슴살 샐러드, 23시 취침 7시간 수면"
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
          {/* 건강 데이터 */}
          <div className="rounded-lg bg-gray-800 p-3 space-y-2">
            <div className="text-sm text-green-400 font-semibold">건강 분석</div>

            {/* 운동 */}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-300">운동: {parsed.health.exercise}</p>
                {exerciseDetail && exerciseDetail.type !== 'none' && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-green-900/50 text-green-400">
                    {TYPE_LABELS[exerciseDetail.type]} · {INTENSITY_LABELS[exerciseDetail.intensity]}
                  </span>
                )}
              </div>
              {exerciseDetail?.description && (
                <p className="text-xs text-gray-500 mt-0.5">{exerciseDetail.description}</p>
              )}
              {breakdown && (
                <p className="text-xs text-green-600 mt-0.5">{breakdown.exercise_score}/35점 — {breakdown.exercise_reasoning}</p>
              )}
            </div>

            {/* 식단 */}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-300">식단: {parsed.health.diet}</p>
                {dietDetail && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    dietDetail.protein_quality === 'high' ? 'bg-green-900/50 text-green-400' :
                    dietDetail.protein_quality === 'moderate' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    단백질 {dietDetail.protein_quality === 'high' ? '충분' : dietDetail.protein_quality === 'moderate' ? '보통' : '부족'}
                  </span>
                )}
              </div>
              {dietDetail?.description && (
                <p className="text-xs text-gray-500 mt-0.5">{dietDetail.description}</p>
              )}
              {breakdown && (
                <p className="text-xs text-green-600 mt-0.5">{breakdown.diet_score}/30점 — {breakdown.diet_reasoning}</p>
              )}
            </div>

            {/* 수면 */}
            <div>
              <p className="text-sm text-gray-300">수면: {parsed.health.sleep}</p>
              {parsed.health.sleep_detail && (
                <div className="mt-1 pl-2 border-l-2 border-gray-700 space-y-0.5">
                  {parsed.health.sleep_detail.bedtime && (
                    <p className="text-xs text-gray-400">취침 {parsed.health.sleep_detail.bedtime} → 기상 {parsed.health.sleep_detail.wakeup}</p>
                  )}
                  {parsed.health.sleep_detail.interruptions > 0 && (
                    <p className="text-xs text-yellow-400">중간 기상 {parsed.health.sleep_detail.interruptions}회</p>
                  )}
                  <p className="text-xs text-gray-400">{parsed.health.sleep_detail.impact}</p>
                </div>
              )}
              {breakdown && (
                <p className="text-xs text-green-600 mt-0.5">{breakdown.sleep_score}/25점 — {breakdown.sleep_reasoning}</p>
              )}
            </div>

            {/* 총점 */}
            <div className="pt-1 border-t border-gray-700">
              <p className="text-sm font-semibold text-green-400">건강 점수: {parsed.health.health_score}/90점</p>
              <p className="text-xs text-gray-500">일관성 보너스(±10)는 코칭 생성 시 반영됩니다</p>
            </div>
          </div>

          {/* 투자 데이터 */}
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
            {isSaving ? 'AI 코칭 생성 중... (30초~1분 소요)' : '확인하고 저장하기'}
          </button>
        </div>
      )}
    </section>
  )
}
