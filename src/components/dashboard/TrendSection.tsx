'use client'

import { useState, useEffect } from 'react'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { DailyLog } from '@/types'
import GlassCard from '@/components/ui/GlassCard'

export function TrendSection() {
  const [days, setDays] = useState(7)
  const [logs, setLogs] = useState<DailyLog[]>([])

  useEffect(() => {
    fetch(`/api/history?days=${days}`)
      .then(res => res.json())
      .then(data => setLogs(Array.isArray(data) ? data : []))
  }, [days])

  const chartData = logs.map(log => ({
    date: log.date.slice(5), // MM-DD
    건강: log.health_data?.health_score ?? 0,
    재무: log.finance_data?.finance_score ?? 0,
  }))

  const DAY_OPTIONS = [7, 30] as const

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">성장 추이</h2>
        <div className="flex gap-1 rounded-lg bg-white/[0.04] p-0.5">
          {DAY_OPTIONS.map(d => {
            const isActive = days === d
            return (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white/[0.08] border border-white/[0.1] text-white'
                    : 'bg-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {d}일
              </button>
            )
          })}
        </div>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="financeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              {/* 건강 dot 글로우 */}
              <filter id="healthGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feFlood floodColor="#22c55e" floodOpacity="0.6" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="shadow" />
                <feMerge>
                  <feMergeNode in="shadow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* 재무 dot 글로우 */}
              <filter id="financeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feFlood floodColor="#3b82f6" floodOpacity="0.6" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="shadow" />
                <feMerge>
                  <feMergeNode in="shadow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
            <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                backdropFilter: 'blur(12px)',
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="건강"
              fill="url(#healthGradient)"
              stroke="none"
            />
            <Area
              type="monotone"
              dataKey="재무"
              fill="url(#financeGradient)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="건강"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 3, filter: 'url(#healthGlow)' }}
              activeDot={{ r: 5, filter: 'url(#healthGlow)' }}
            />
            <Line
              type="monotone"
              dataKey="재무"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3, filter: 'url(#financeGlow)' }}
              activeDot={{ r: 5, filter: 'url(#financeGlow)' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <GlassCard className="py-8">
          <p className="text-sm text-gray-500 text-center">
            데이터가 쌓이면 성장 추이가 표시됩니다
          </p>
        </GlassCard>
      )}
    </GlassCard>
  )
}
