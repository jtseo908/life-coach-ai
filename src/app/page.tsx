'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { DailyLog } from '@/types'

// 로딩 완료 전까지 대시보드 컴포넌트를 렌더하지 않기 위해 dynamic import
import dynamic from 'next/dynamic'
const DailyCheckinSection = dynamic(() => import('@/components/dashboard/DailyCheckinSection').then(m => ({ default: m.DailyCheckinSection })), { ssr: false })
const ScoreSection = dynamic(() => import('@/components/dashboard/ScoreSection').then(m => ({ default: m.ScoreSection })), { ssr: false })
const CoachingSection = dynamic(() => import('@/components/dashboard/CoachingSection').then(m => ({ default: m.CoachingSection })), { ssr: false })
const PortfolioSection = dynamic(() => import('@/components/dashboard/PortfolioSection').then(m => ({ default: m.PortfolioSection })), { ssr: false })
const TrendSection = dynamic(() => import('@/components/dashboard/TrendSection').then(m => ({ default: m.TrendSection })), { ssr: false })

export default function DashboardPage() {
  const router = useRouter()
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null)
  const [isReady, setIsReady] = useState(false)

  const fetchTodayLog = useCallback(async () => {
    const res = await fetch('/api/history?days=1')
    const data = await res.json()
    const today = new Date().toISOString().split('T')[0]
    const log = Array.isArray(data) ? data.find((d: DailyLog) => d.date === today) : null
    setTodayLog(log || null)
  }, [])

  useEffect(() => {
    const init = async () => {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (!data?.id) {
        router.replace('/onboarding')
        return
      }
      await fetchTodayLog()
      setIsReady(true)
    }
    init()
  }, [router, fetchTodayLog])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!isReady) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-lg px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">건강-재무 코치</h1>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            로그아웃
          </button>
        </div>

        <DailyCheckinSection onCheckinComplete={fetchTodayLog} />
        <ScoreSection todayLog={todayLog} />
        <CoachingSection todayLog={todayLog} />
        <PortfolioSection />
        <TrendSection />
      </div>
    </main>
  )
}
