'use client'

import { useState } from 'react'
import type { DailyLog } from '@/types'
import GlassCard from '@/components/ui/GlassCard'

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

const TABS = [
  {
    key: 'health',
    label: '건강 코칭',
    color: '#22c55e',
    glowColor: 'rgba(34,197,94,0.4)',
    bgGlow: 'rgba(34,197,94,0.03)',
    textClass: 'text-green-300',
    protocolBg: 'bg-green-500/[0.06] border-green-500/[0.1]',
    protocolLabel: '📋 내일의 처방',
    protocolLabelClass: 'text-green-400',
    mechanismPrefix: '🔬',
  },
  {
    key: 'finance',
    label: '재무 코칭',
    color: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.4)',
    bgGlow: 'rgba(59,130,246,0.03)',
    textClass: 'text-blue-300',
    protocolBg: 'bg-blue-500/[0.06] border-blue-500/[0.1]',
    protocolLabel: '💡 액션',
    protocolLabelClass: 'text-blue-400',
    mechanismPrefix: '⚠️',
  },
] as const

export function CoachingSection({ todayLog }: Props) {
  const [activeTab, setActiveTab] = useState(0)
  const coaching = todayLog?.ai_coaching

  if (!coaching) {
    return (
      <GlassCard>
        <h2 className="text-lg font-bold text-white/90 mb-2">AI 코칭</h2>
        <p className="text-sm text-gray-500">
          오늘의 체크인을 완료하면 AI 코칭이 표시됩니다
        </p>
      </GlassCard>
    )
  }

  const isStructured = coaching.includes('---')

  if (!isStructured) {
    return (
      <GlassCard>
        <h2 className="text-lg font-bold text-white/90 mb-2">AI 코칭</h2>
        <p className="text-sm text-gray-300 whitespace-pre-line">{coaching}</p>
      </GlassCard>
    )
  }

  const [healthPart, financePart] = coaching.split('---').map(s => s.trim())
  const sections = [
    parseCoachingSection(healthPart, '💪'),
    parseCoachingSection(financePart, '💰'),
  ]

  const tab = TABS[activeTab]
  const data = sections[activeTab]

  return (
    <div className="space-y-0">
      {/* 글로우 탭 바 */}
      <div className="flex gap-1 rounded-t-2xl border border-b-0 border-white/[0.06] bg-white/[0.02] p-1.5 backdrop-blur-xl">
        {TABS.map((t, i) => {
          const isActive = i === activeTab
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(i)}
              className="relative flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-300"
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${t.bgGlow}, transparent)`,
                      color: t.color,
                      boxShadow: `0 0 20px ${t.glowColor}, inset 0 1px 0 rgba(255,255,255,0.06)`,
                    }
                  : { color: '#64748b' }
              }
            >
              {/* 활성 탭 상단 글로우 라인 */}
              {isActive && (
                <div
                  className="absolute inset-x-4 top-0 h-[2px] rounded-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${t.color}, transparent)`,
                    boxShadow: `0 0 8px ${t.glowColor}`,
                  }}
                />
              )}
              {t.label}
            </button>
          )
        })}
      </div>

      {/* 코칭 콘텐츠 */}
      <div
        className="rounded-b-2xl border border-t-0 border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-xl lg:p-6"
        style={{
          background: `linear-gradient(180deg, ${tab.bgGlow} 0%, rgba(255,255,255,0.03) 30%)`,
        }}
      >
        {/* 요약 */}
        {data.summary && (
          <div
            className="mb-4 opacity-0"
            style={{ animation: 'slide-in 0.3s ease-out 0s forwards' }}
          >
            <p className={`text-base font-semibold leading-relaxed ${tab.textClass}`}>
              {data.summary}
            </p>
          </div>
        )}

        {/* 분석 */}
        {data.analysis && (
          <div
            className="mb-4 opacity-0"
            style={{ animation: 'slide-in 0.3s ease-out 0.08s forwards' }}
          >
            <p className="text-sm leading-relaxed text-gray-300">{data.analysis}</p>
          </div>
        )}

        {/* 처방/액션 카드 */}
        {data.protocol && (
          <div
            className="mb-4 opacity-0"
            style={{ animation: 'slide-in 0.3s ease-out 0.16s forwards' }}
          >
            <div className={`rounded-xl border p-4 ${tab.protocolBg}`}>
              <div className={`mb-2 text-xs font-bold ${tab.protocolLabelClass}`}>
                {tab.protocolLabel}
              </div>
              <p className="text-sm leading-relaxed text-gray-200">{data.protocol}</p>
            </div>
          </div>
        )}

        {/* 근거/리스크 */}
        {data.mechanism && (
          <div
            className="opacity-0"
            style={{ animation: 'slide-in 0.3s ease-out 0.24s forwards' }}
          >
            <p className="text-xs leading-relaxed text-gray-500 italic">
              {tab.mechanismPrefix} {data.mechanism}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
