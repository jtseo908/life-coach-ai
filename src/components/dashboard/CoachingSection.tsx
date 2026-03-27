import type { DailyLog } from '@/types'

type Props = {
  todayLog: DailyLog | null
}

function parseCoachingSection(text: string, separator: string) {
  const lines = text.split('\n').filter(l => l.trim())
  const result: Record<string, string> = {}
  let currentKey = 'summary'

  for (const line of lines) {
    if (line.startsWith('📋 내일의 처방:') || line.startsWith('💡 액션:')) {
      currentKey = 'protocol'
      result[currentKey] = line.replace(/^📋 내일의 처방:\s*|^💡 액션:\s*/, '')
    } else if (line.startsWith('🔬 근거:') || line.startsWith('⚠️ 리스크:')) {
      currentKey = 'mechanism'
      result[currentKey] = line.replace(/^🔬 근거:\s*|^⚠️ 리스크:\s*/, '')
    } else if (line.startsWith('💪 ') || line.startsWith('💰 ')) {
      result.summary = line.replace(/^💪\s*|^💰\s*/, '')
    } else {
      if (result[currentKey]) {
        result[currentKey] += ' ' + line
      } else {
        result[currentKey] = line
      }
    }
  }
  return result
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

  // 구조화된 포맷인지 확인 (--- 구분자가 있으면 새 포맷)
  const isStructured = coaching?.includes('---')

  if (!isStructured) {
    // 이전 포맷 호환
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
            <p className="text-sm text-gray-300 whitespace-pre-line">{insight}</p>
          </div>
        )}
      </section>
    )
  }

  const [healthPart, financePart] = (coaching || '').split('---').map(s => s.trim())
  const health = parseCoachingSection(healthPart, '💪')
  const finance = parseCoachingSection(financePart, '💰')
  const cross = insight ? parseCrossInsight(insight) : null

  return (
    <section className="space-y-3">
      {/* 건강 코칭 */}
      <div className="rounded-xl bg-gray-900 p-4 space-y-3">
        <h2 className="text-lg font-bold text-green-400">건강 코칭</h2>
        {health.summary && (
          <p className="text-sm font-semibold text-green-300">{health.summary}</p>
        )}
        {health.analysis && (
          <p className="text-sm text-gray-300">{health.analysis}</p>
        )}
        {health.protocol && (
          <div className="rounded-lg bg-green-900/30 border border-green-800/50 p-3">
            <div className="text-xs font-semibold text-green-400 mb-1">📋 내일의 처방</div>
            <p className="text-sm text-gray-200">{health.protocol}</p>
          </div>
        )}
        {health.mechanism && (
          <p className="text-xs text-gray-500 italic">🔬 {health.mechanism}</p>
        )}
      </div>

      {/* 재무 코칭 */}
      <div className="rounded-xl bg-gray-900 p-4 space-y-3">
        <h2 className="text-lg font-bold text-blue-400">재무 코칭</h2>
        {finance.summary && (
          <p className="text-sm font-semibold text-blue-300">{finance.summary}</p>
        )}
        {finance.analysis && (
          <p className="text-sm text-gray-300">{finance.analysis}</p>
        )}
        {finance.protocol && (
          <div className="rounded-lg bg-blue-900/30 border border-blue-800/50 p-3">
            <div className="text-xs font-semibold text-blue-400 mb-1">💡 액션</div>
            <p className="text-sm text-gray-200">{finance.protocol}</p>
          </div>
        )}
        {finance.mechanism && (
          <div className="rounded-lg bg-amber-900/20 border border-amber-800/30 p-2">
            <p className="text-xs text-amber-300">⚠️ {finance.mechanism}</p>
          </div>
        )}
      </div>

      {/* 크로스 인사이트 */}
      {cross && (
        <div className="rounded-xl bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-700/50 p-4 space-y-2">
          <h2 className="text-lg font-bold text-purple-300">크로스 인사이트</h2>
          {cross.connection && (
            <p className="text-sm text-gray-300">{cross.connection}</p>
          )}
          {cross.research && (
            <p className="text-xs text-gray-400 italic">📚 {cross.research}</p>
          )}
          {cross.advice && (
            <div className="rounded-lg bg-purple-900/30 border border-purple-700/30 p-2">
              <p className="text-sm text-purple-200">✅ {cross.advice}</p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
