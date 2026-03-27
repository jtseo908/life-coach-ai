'use client'

import { useState } from 'react'
import CountUp from '@/components/ui/CountUp'
import GlassCard from '@/components/ui/GlassCard'
import BorderGlow from '@/components/ui/BorderGlow'
import ShinyText from '@/components/ui/ShinyText'
import StatusPill from '@/components/ui/StatusPill'
import type { DailyLog } from '@/types'

type Props = {
  todayLog: DailyLog | null
  yesterdayLog?: DailyLog | null
  crossInsightRef?: React.RefObject<HTMLDivElement | null>
}

// 등급 계산
function getGrade(score: number) {
  if (score >= 90) return { label: 'S', color: '#facc15', bg: 'bg-yellow-400/[0.1] border-yellow-400/[0.2] text-yellow-400' }
  if (score >= 80) return { label: 'A', color: '#22c55e', bg: 'bg-green-500/[0.1] border-green-500/[0.2] text-green-400' }
  if (score >= 70) return { label: 'B', color: '#3b82f6', bg: 'bg-blue-500/[0.1] border-blue-500/[0.2] text-blue-400' }
  if (score >= 60) return { label: 'C', color: '#f97316', bg: 'bg-orange-500/[0.1] border-orange-500/[0.2] text-orange-400' }
  return { label: 'D', color: '#ef4444', bg: 'bg-red-500/[0.1] border-red-500/[0.2] text-red-400' }
}

// 어제 대비 변화
function DeltaBadge({ today, yesterday }: { today: number; yesterday: number }) {
  const diff = today - yesterday
  if (diff === 0) return null

  const isUp = diff > 0
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold ${isUp ? 'text-green-400' : 'text-red-400'}`}
      style={{ textShadow: isUp ? '0 0 8px rgba(34,197,94,0.3)' : '0 0 8px rgba(239,68,68,0.3)' }}
    >
      {isUp ? '▲' : '▼'}{Math.abs(diff)}
    </span>
  )
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
      style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
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

function BreakdownItem({ label, score, max, color, reasoning }: {
  label: string; score: number; max: number; color: string; reasoning?: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-500">{score}/{max}</span>
      </div>
      <ProgressBar value={score} max={max} color={color} />
      {reasoning && <p className="text-[10px] text-gray-600 leading-tight">{reasoning}</p>}
    </div>
  )
}

function SubScoreCard({ title, score, yesterdayScore, color, dotColor, accentColor, children }: {
  title: string; score: number; yesterdayScore?: number; color: string; dotColor: string
  accentColor: 'health' | 'wealth'; children?: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const grade = getGrade(score)

  return (
    <GlassCard accentColor={accentColor} className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GlowDot color={dotColor} />
          <span className="text-sm font-medium text-gray-300">{title}</span>
        </div>
        {/* 등급 배지 */}
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-md border text-[11px] font-black ${grade.bg}`}
          style={{ textShadow: `0 0 8px ${grade.color}40` }}
        >
          {grade.label}
        </span>
      </div>

      <div className="flex items-end gap-3 mb-2">
        <span
          className="text-3xl font-bold tabular-nums"
          style={{ color, textShadow: `0 0 20px ${dotColor}40` }}
        >
          <CountUp end={score} />
        </span>
        <span className="text-sm text-gray-500 pb-1">/ 100</span>
        {/* 어제 대비 변화 */}
        {yesterdayScore !== undefined && (
          <div className="pb-1">
            <DeltaBadge today={score} yesterday={yesterdayScore} />
          </div>
        )}
      </div>
      <ProgressBar value={score} max={100} color={dotColor} />

      {children && (
        <div className="mt-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg
              className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
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

export function ScoreSection({ todayLog, yesterdayLog, crossInsightRef }: Props) {
  const healthScore = todayLog?.health_data?.health_score ?? 0
  const financeScore = todayLog?.finance_data?.finance_score ?? 0
  const healthBreakdown = todayLog?.health_data?.score_breakdown
  const financeBreakdown = todayLog?.finance_data?.finance_score_breakdown
  const crossInsight = todayLog?.cross_insight ?? null
  const vpulseScore = todayLog ? Math.round((healthScore + financeScore) / 2) : 0

  const yHealthScore = yesterdayLog?.health_data?.health_score
  const yFinanceScore = yesterdayLog?.finance_data?.finance_score
  const yVpulseScore = yesterdayLog ? Math.round(((yHealthScore ?? 0) + (yFinanceScore ?? 0)) / 2) : undefined

  const grade = getGrade(vpulseScore)
  const parsedCross = crossInsight ? parseCrossInsight(crossInsight) : null

  const [showResearch, setShowResearch] = useState(false)

  // 체크인 전 와우 빈 상태
  if (!todayLog) {
    return (
      <section className="space-y-4">
        <BorderGlow color="ai" className="text-center py-8">
          <p className="text-xs font-medium tracking-widest text-gray-500 uppercase mb-2">
            VPULSE Score
          </p>
          <ShinyText className="text-6xl font-extrabold text-violet-300 lg:text-7xl" speed={4}>
            ?
          </ShinyText>
          <p className="mt-3 text-sm text-gray-400">
            오늘의 첫 기록을 남기면 점수가 깨어납니다
          </p>
        </BorderGlow>

        <div className="flex flex-col gap-3 sm:flex-row">
          <GlassCard accentColor="health" className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <GlowDot color="#22c55e" />
              <span className="text-sm font-medium text-gray-300">건강 점수</span>
            </div>
            <span className="text-3xl font-bold text-gray-600">--</span>
            <div className="mt-2 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500/30"
                style={{ animation: 'breathing 3s ease-in-out infinite' }}
              />
            </div>
          </GlassCard>

          <GlassCard accentColor="wealth" className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <GlowDot color="#3b82f6" />
              <span className="text-sm font-medium text-gray-300">재무 점수</span>
            </div>
            <span className="text-3xl font-bold text-gray-600">--</span>
            <div className="mt-2 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500/30"
                style={{ animation: 'breathing 3s ease-in-out infinite 1s' }}
              />
            </div>
          </GlassCard>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      {/* 통합 VPULSE 히어로 */}
      <GlassCard className="text-center">
        <p className="text-xs font-medium tracking-widest text-gray-500 uppercase mb-1">
          VPULSE Score
        </p>
        <div className="flex items-center justify-center gap-3">
          <span
            className="text-6xl font-extrabold tabular-nums lg:text-7xl"
            style={{
              background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            <CountUp end={vpulseScore} duration={2000} />
          </span>
          {/* 등급 배지 */}
          <div className="flex flex-col items-center gap-1">
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-base font-black ${grade.bg}`}
              style={{ textShadow: `0 0 10px ${grade.color}50` }}
            >
              {grade.label}
            </span>
            {/* 어제 대비 */}
            {yVpulseScore !== undefined && (
              <DeltaBadge today={vpulseScore} yesterday={yVpulseScore} />
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-2">
          <p className="text-xs text-gray-600">건강 + 재무 통합 지수</p>
          {/* 어제도 체크인했으면 연속 뱃지 */}
          {yesterdayLog && <StatusPill label="연속 체크인 중!" color="health" />}
        </div>
      </GlassCard>

      {/* 크로스 인사이트 — 건강→뇌→투자 아이콘 흐름 + 접이식 연구 근거 */}
      {parsedCross && (
        <div ref={crossInsightRef}>
        <BorderGlow color="ai" className="space-y-3">
          {/* 아이콘 흐름 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold text-violet-400 tracking-[1px] uppercase">
              ✦ CROSS INSIGHT
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span>💪</span>
              <span className="text-gray-700">→</span>
              <span>🧠</span>
              <span className="text-gray-700">→</span>
              <span>💰</span>
            </div>
          </div>

          {/* 메인 인사이트 (큰 텍스트) */}
          {parsedCross.connection && (
            <p className="text-base leading-relaxed text-gray-200">{parsedCross.connection}</p>
          )}

          {/* 접이식 연구 근거 */}
          {parsedCross.research && (
            <div>
              <button
                onClick={() => setShowResearch(!showResearch)}
                className="flex items-center gap-1.5 text-xs text-violet-400/70 hover:text-violet-400 transition-colors"
              >
                <svg
                  className={`h-3 w-3 transition-transform duration-200 ${showResearch ? 'rotate-90' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                왜 이런 연결이 있을까?
              </button>
              {showResearch && (
                <div className="mt-2 rounded-xl bg-violet-500/[0.04] border border-violet-500/[0.08] p-3">
                  <p className="text-xs leading-relaxed text-gray-400 italic">
                    📚 {parsedCross.research}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 액션 어드바이스 */}
          {parsedCross.advice && (
            <div className="rounded-xl bg-violet-500/[0.06] border border-violet-500/[0.1] p-3">
              <p className="text-sm text-violet-200">✅ {parsedCross.advice}</p>
            </div>
          )}
        </BorderGlow>
        </div>
      )}

      {/* 건강/재무 서브 점수 */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <SubScoreCard
          title="건강 점수"
          score={healthScore}
          yesterdayScore={yHealthScore}
          color="#4ade80"
          dotColor="#22c55e"
          accentColor="health"
        >
          {healthBreakdown && (
            <>
              <BreakdownItem label="운동" score={healthBreakdown.exercise_score} max={35} color="#4ade80" reasoning={healthBreakdown.exercise_reasoning} />
              <BreakdownItem label="식단" score={healthBreakdown.diet_score} max={30} color="#86efac" reasoning={healthBreakdown.diet_reasoning} />
              <BreakdownItem label="수면" score={healthBreakdown.sleep_score} max={25} color="#bbf7d0" reasoning={healthBreakdown.sleep_reasoning} />
            </>
          )}
        </SubScoreCard>

        <SubScoreCard
          title="재무 점수"
          score={financeScore}
          yesterdayScore={yFinanceScore}
          color="#60a5fa"
          dotColor="#3b82f6"
          accentColor="wealth"
        >
          {financeBreakdown && (
            <>
              <BreakdownItem label="수익" score={financeBreakdown.returns_score} max={25} color="#60a5fa" reasoning={financeBreakdown.returns_reasoning} />
              <BreakdownItem label="분산" score={financeBreakdown.diversification_score} max={25} color="#93c5fd" reasoning={financeBreakdown.diversification_reasoning} />
              <BreakdownItem label="목표" score={financeBreakdown.goal_progress_score} max={25} color="#bfdbfe" reasoning={financeBreakdown.goal_progress_reasoning} />
              <BreakdownItem label="행동" score={financeBreakdown.behavioral_score} max={25} color="#dbeafe" reasoning={financeBreakdown.behavioral_reasoning} />
            </>
          )}
        </SubScoreCard>
      </div>
    </section>
  )
}
