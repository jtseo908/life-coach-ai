import type { DailyLog } from '@/types'

type Props = {
  todayLog: DailyLog | null
}

export function CoachingSection({ todayLog }: Props) {
  const coaching = todayLog?.ai_coaching
  const insight = todayLog?.cross_insight

  if (!coaching && !insight) {
    return (
      <section className="rounded-xl bg-gray-900 p-4">
        <h2 className="text-lg font-bold text-yellow-400 mb-2">AI 코칭</h2>
        <p className="text-sm text-gray-500">오늘의 체크인을 완료하면 AI 코칭이 표시됩니다</p>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      {coaching && (
        <div className="rounded-xl bg-gray-900 p-4">
          <h2 className="text-lg font-bold text-yellow-400 mb-2">AI 코칭</h2>
          <p className="text-sm text-gray-300 whitespace-pre-line">{coaching}</p>
        </div>
      )}
      {insight && (
        <div className="rounded-xl bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-700/50 p-4">
          <h2 className="text-lg font-bold text-purple-300 mb-2">크로스 인사이트</h2>
          <p className="text-sm text-gray-300">{insight}</p>
        </div>
      )}
    </section>
  )
}
