'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { DailyLog } from '@/types'

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

  return (
    <section className="rounded-xl bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-purple-300">성장 추이</h2>
        <div className="flex gap-1">
          {[7, 30].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-full px-3 py-1 text-xs ${
                days === d ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {d}일
            </button>
          ))}
        </div>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
            <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line type="monotone" dataKey="건강" stroke="#4ade80" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="재무" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-gray-500 text-center py-8">데이터가 쌓이면 성장 추이가 표시됩니다</p>
      )}
    </section>
  )
}
