'use client'

import { useState } from 'react'
import CountUp from '@/components/ui/CountUp'
import GlassCard from '@/components/ui/GlassCard'
import BorderGlow from '@/components/ui/BorderGlow'
import type { DailyLog } from '@/types'

type Props = {
  todayLog: DailyLog | null
}

function parseCrossInsight(text: string) {
  const lines = text.split('\n').filter(l => l.trim())
  const result = { connection: '', research: '', advice: '' }
  let current = 'connection'

  for (const line of lines) {
    if (line.startsWith('📚 ')) {
      current = 'research'
      result.research = line.replace('📚 ', '')
    } else if (line.startsWith('✅ ')) {
      current = 'advice'
      result.advice = line.replace('✅ ', '')
    } else {
      if (current === 'connection') {
        result.connection += (result.connection ? ' ' : '') + line
      }
    }
  }
  return result
}

function GlowDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
      style={{
        backgroundColor: color,
        boxShadow: `0 0 6px ${color}80`,
      }}
    />
  )
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0

  return (
    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

function BreakdownItem({
  label,
  score,
  max,
  color,
  reasoning,
}: {
  label: string
  score: number
  max: number
  color: string
  reasoning?: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-500">
          {score}/{max}
        </span>
      </div>
      <ProgressBar value={score} max={max} color={color} />
      {reasoning && <p className="text-[10px] text-gray-600 leading-tight">{reasoning}</p>}
    </div>
  )
}

function SubScoreCard({
  title,
  score,
  color,
  dotColor,
  accentColor,
  children,
}: {
  title: string
  score: number
  color: string
  dotColor: string
  accentColor: 'health' | 'wealth'
  children?: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <GlassCard accentColor={accentColor} className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <GlowDot color={dotColor} />
        <span className="text-sm font-medium text-gray-300">{title}</span>
      </div>

      {/* 점수 + 프로그레스 바 */}
      <div className="flex items-end gap-3 mb-2">
        <span
          className="text-3xl font-bold tabular-nums"
          style={{
            color,
            textShadow: `0 0 20px ${dotColor}40`,
          }}
        >
          <CountUp end={score} />
        </span>
        <span className="text-sm text-gray-500 pb-1">/ 100</span>
      </div>
      <ProgressBar value={score} max={100} color={dotColor} />

      {/* Breakdown 토글 */}
      {children && (
        <div className="mt-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg
              className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            상세 분석
          </button>
          {isOpen && <div className="mt-2 space-y-2">{children}</div>}
        </div>
      )}
    </GlassCard>
  )
}

export function ScoreSection({ todayLog }: Props) {
  const healthScore = todayLog?.health_data?.health_score ?? 0
  const financeScore = todayLog?.finance_data?.finance_score ?? 0
  const healthBreakdown = todayLog?.health_data?.score_breakdown
  const financeBreakdown = todayLog?.finance_data?.finance_score_breakdown
  const crossInsight = todayLog?.cross_insight ?? null
  const vpulseScore = todayLog ? Math.round((healthScore + financeScore) / 2) : 0

  const parsedCross = crossInsight ? parseCrossInsight(crossInsight) : null

  return (
    <section className="space-y-4">
      {/* 통합 VPULSE 히어로 */}
      <GlassCard className="text-center">
        <p className="text-xs font-medium tracking-widest text-gray-500 uppercase mb-1">
          VPULSE Score
        </p>
        <div className="flex items-center justify-center gap-1">
          <span
            className="text-6xl font-extrabold tabular-nums lg:text-7xl"
            style={{
              background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(59,130,246,0.15)',
            }}
          >
            <CountUp end={vpulseScore} duration={2000} />
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">건강 + 재무 통합 지수</p>
      </GlassCard>

      {/* 크로스 인사이트 — VPULSE 점수 바로 아래, 가장 눈에 띄는 위치 */}
      {parsedCross && (
        <BorderGlow color="ai" className="space-y-3">
          <div className="mb-1">
            <span className="text-[10px] font-semibold text-violet-400 tracking-[1px] uppercase">
              ✦ CROSS INSIGHT
            </span>
          </div>

          {parsedCross.connection && (
            <p className="text-sm leading-relaxed text-gray-300">{parsedCross.connection}</p>
          )}

          {parsedCross.research && (
            <p className="text-xs leading-relaxed text-gray-500 italic">
              📚 {parsedCross.research}
            </p>
          )}

          {parsedCross.advice && (
            <div className="rounded-xl bg-violet-500/[0.06] border border-violet-500/[0.1] p-3">
              <p className="text-sm text-violet-200">✅ {parsedCross.advice}</p>
            </div>
          )}
        </BorderGlow>
      )}

      {/* 건강/재무 서브 점수 */}
      <div className="flex flex-col gap-3 sm:flex-row">
          {/* 건강 점수 */}
          <SubScoreCard
            title="건강 점수"
            score={healthScore}
            color="#4ade80"
            dotColor="#22c55e"
            accentColor="health"
          >
            {healthBreakdown && (
              <>
                <BreakdownItem
                  label="운동"
                  score={healthBreakdown.exercise_score}
                  max={35}
                  color="#4ade80"
                  reasoning={healthBreakdown.exercise_reasoning}
                />
                <BreakdownItem
                  label="식단"
                  score={healthBreakdown.diet_score}
                  max={30}
                  color="#86efac"
                  reasoning={healthBreakdown.diet_reasoning}
                />
                <BreakdownItem
                  label="수면"
                  score={healthBreakdown.sleep_score}
                  max={25}
                  color="#bbf7d0"
                  reasoning={healthBreakdown.sleep_reasoning}
                />
              </>
            )}
          </SubScoreCard>

          {/* 재무 점수 */}
          <SubScoreCard
            title="재무 점수"
            score={financeScore}
            color="#60a5fa"
            dotColor="#3b82f6"
            accentColor="wealth"
          >
            {financeBreakdown && (
              <>
                <BreakdownItem
                  label="수익"
                  score={financeBreakdown.returns_score}
                  max={25}
                  color="#60a5fa"
                  reasoning={financeBreakdown.returns_reasoning}
                />
                <BreakdownItem
                  label="분산"
                  score={financeBreakdown.diversification_score}
                  max={25}
                  color="#93c5fd"
                  reasoning={financeBreakdown.diversification_reasoning}
                />
                <BreakdownItem
                  label="목표"
                  score={financeBreakdown.goal_progress_score}
                  max={25}
                  color="#bfdbfe"
                  reasoning={financeBreakdown.goal_progress_reasoning}
                />
                <BreakdownItem
                  label="행동"
                  score={financeBreakdown.behavioral_score}
                  max={25}
                  color="#dbeafe"
                  reasoning={financeBreakdown.behavioral_reasoning}
                />
              </>
            )}
          </SubScoreCard>
      </div>
    </section>
  )
}
