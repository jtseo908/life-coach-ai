import { ScoreGauge } from '@/components/ui/ScoreGauge'
import type { DailyLog } from '@/types'

type Props = {
  todayLog: DailyLog | null
}

export function ScoreSection({ todayLog }: Props) {
  const healthScore = todayLog?.health_data?.health_score ?? 0
  const financeScore = todayLog?.finance_data?.finance_score ?? 0

  return (
    <section className="grid grid-cols-2 gap-3">
      <div className="rounded-xl bg-gray-900 p-4 flex flex-col items-center">
        <div className="text-sm font-semibold text-green-400 mb-2">건강 점수</div>
        <ScoreGauge score={healthScore} label="운동 · 식단 · 수면" color="#4ade80" />
      </div>
      <div className="rounded-xl bg-gray-900 p-4 flex flex-col items-center">
        <div className="text-sm font-semibold text-blue-400 mb-2">재무 점수</div>
        <ScoreGauge score={financeScore} label="수익률 · 분산 · 목표" color="#60a5fa" />
      </div>
    </section>
  )
}
