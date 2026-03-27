import { ScoreGauge } from '@/components/ui/ScoreGauge'
import type { DailyLog } from '@/types'

type Props = {
  todayLog: DailyLog | null
}

function BreakdownBar({ label, score, max, color }: { label: string; score: number; max: number; color: string }) {
  const pct = max > 0 ? (score / max) * 100 : 0

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-10 text-gray-500 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-10 text-right text-gray-500">{score}/{max}</span>
    </div>
  )
}

export function ScoreSection({ todayLog }: Props) {
  const healthScore = todayLog?.health_data?.health_score ?? 0
  const financeScore = todayLog?.finance_data?.finance_score ?? 0
  const healthBreakdown = todayLog?.health_data?.score_breakdown
  const financeBreakdown = todayLog?.finance_data?.finance_score_breakdown

  return (
    <section className="grid grid-cols-2 gap-3">
      <div className="rounded-xl bg-gray-900 p-4 flex flex-col items-center space-y-3">
        <div className="text-sm font-semibold text-green-400">건강 점수</div>
        <ScoreGauge score={healthScore} label="운동 · 식단 · 수면" color="#4ade80" />
        {healthBreakdown && (
          <div className="w-full space-y-1">
            <BreakdownBar label="운동" score={healthBreakdown.exercise_score} max={35} color="#4ade80" />
            <BreakdownBar label="식단" score={healthBreakdown.diet_score} max={30} color="#86efac" />
            <BreakdownBar label="수면" score={healthBreakdown.sleep_score} max={25} color="#bbf7d0" />
          </div>
        )}
      </div>
      <div className="rounded-xl bg-gray-900 p-4 flex flex-col items-center space-y-3">
        <div className="text-sm font-semibold text-blue-400">재무 점수</div>
        <ScoreGauge score={financeScore} label="수익 · 분산 · 목표 · 행동" color="#60a5fa" />
        {financeBreakdown && (
          <div className="w-full space-y-1">
            <BreakdownBar label="수익" score={financeBreakdown.returns_score} max={25} color="#60a5fa" />
            <BreakdownBar label="분산" score={financeBreakdown.diversification_score} max={25} color="#93c5fd" />
            <BreakdownBar label="목표" score={financeBreakdown.goal_progress_score} max={25} color="#bfdbfe" />
            <BreakdownBar label="행동" score={financeBreakdown.behavioral_score} max={25} color="#dbeafe" />
          </div>
        )}
      </div>
    </section>
  )
}
