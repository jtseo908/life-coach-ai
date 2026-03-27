'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DailyCheckinSection } from '@/components/dashboard/DailyCheckinSection'
import { ScoreSection } from '@/components/dashboard/ScoreSection'
import { CoachingSection } from '@/components/dashboard/CoachingSection'
import { PortfolioSection } from '@/components/dashboard/PortfolioSection'
import { TrendSection } from '@/components/dashboard/TrendSection'
import type { DailyLog } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null)

  const fetchTodayLog = useCallback(async () => {
    const res = await fetch('/api/history?days=1')
    const data = await res.json()
    const today = new Date().toISOString().split('T')[0]
    const log = Array.isArray(data) ? data.find((d: DailyLog) => d.date === today) : null
    setTodayLog(log || null)
  }, [])

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (!data?.id) router.push('/onboarding')
      })
    fetchTodayLog()
  }, [router, fetchTodayLog])

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-lg px-4 py-6 space-y-4">
        <h1 className="text-xl font-bold text-center">건강-재무 코치</h1>

        <DailyCheckinSection onCheckinComplete={fetchTodayLog} />
        <ScoreSection todayLog={todayLog} />
        <CoachingSection todayLog={todayLog} />
        <PortfolioSection />
        <TrendSection />
      </div>
    </main>
  )
}
