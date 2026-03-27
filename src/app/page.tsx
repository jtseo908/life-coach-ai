'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { DailyLog } from '@/types'
import SoftAurora from '@/components/ui/SoftAurora'
import ShinyText from '@/components/ui/ShinyText'

import dynamic from 'next/dynamic'
const DailyCheckinSection = dynamic(() => import('@/components/dashboard/DailyCheckinSection').then(m => ({ default: m.DailyCheckinSection })), { ssr: false })
const ScoreSection = dynamic(() => import('@/components/dashboard/ScoreSection').then(m => ({ default: m.ScoreSection })), { ssr: false })
const CoachingSection = dynamic(() => import('@/components/dashboard/CoachingSection').then(m => ({ default: m.CoachingSection })), { ssr: false })
const PortfolioSection = dynamic(() => import('@/components/dashboard/PortfolioSection').then(m => ({ default: m.PortfolioSection })), { ssr: false })
const TrendSection = dynamic(() => import('@/components/dashboard/TrendSection').then(m => ({ default: m.TrendSection })), { ssr: false })

export default function DashboardPage() {
  const router = useRouter()
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null)
  const [yesterdayLog, setYesterdayLog] = useState<DailyLog | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const crossInsightRef = useRef<HTMLDivElement>(null)

  const fetchTodayLog = useCallback(async () => {
    const res = await fetch('/api/history?days=2')
    const data = await res.json()
    const todayStr = new Date().toISOString().split('T')[0]
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    if (Array.isArray(data)) {
      setTodayLog(data.find((d: DailyLog) => d.date === todayStr) || null)
      setYesterdayLog(data.find((d: DailyLog) => d.date === yesterdayStr) || null)
    } else {
      setTodayLog(null)
      setYesterdayLog(null)
    }
  }, [])

  const handleCheckinComplete = useCallback(async () => {
    await fetchTodayLog()
    // 크로스 인사이트로 스크롤
    setTimeout(() => {
      crossInsightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
    // 토스트 표시
    setToast('AI 코칭이 생성되었습니다! 크로스 인사이트를 확인하세요.')
    setTimeout(() => setToast(null), 4000)
  }, [fetchTodayLog])

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
      <SoftAurora>
        <main className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-green-500" />
        </main>
      </SoftAurora>
    )
  }

  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <SoftAurora>
      <main className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-5">
          {/* 헤더 */}
          <header className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-black tracking-wide">
                <span
                  style={{
                    background: 'linear-gradient(180deg, #22c55e, #3b82f6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 16px rgba(34,197,94,0.3))',
                  }}
                >
                  V
                </span>
                <ShinyText className="text-gray-100">PULSE</ShinyText>
              </h1>
              <span className="hidden text-xs text-gray-600 lg:inline">
                체력 × 자산, 매일 짚는 삶의 맥박
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-gray-600 sm:inline">{today}</span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-gray-500 backdrop-blur-sm transition-colors hover:text-white"
              >
                로그아웃
              </button>
            </div>
          </header>

          {/* 점수 히어로 (전체 너비) */}
          <ScoreSection todayLog={todayLog} yesterdayLog={yesterdayLog} crossInsightRef={crossInsightRef} />

          {/* 2컬럼 그리드 (데스크톱) / 세로 스택 (모바일) */}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <DailyCheckinSection onCheckinComplete={handleCheckinComplete} todayLog={todayLog} />
            <PortfolioSection />
          </div>

          {/* AI 코칭 — 전체 너비 */}
          <div className="mt-4">
            <CoachingSection todayLog={todayLog} />
          </div>

          {/* 성장 추이 — 전체 너비 */}
          <div className="mt-4">
            <TrendSection />
          </div>
        </div>
      </main>
      {/* 토스트 */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-violet-400/20 bg-[#0f0a1a]/90 px-5 py-3 text-sm text-violet-200 shadow-[0_0_30px_rgba(167,139,250,0.15)] backdrop-blur-xl"
          style={{ animation: 'fade-in-up 0.4s ease-out' }}
        >
          ✦ {toast}
        </div>
      )}
    </SoftAurora>
  )
}
