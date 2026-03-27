'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoalSettingSection } from '@/components/onboarding/GoalSettingSection'
import { PortfolioSetupSection } from '@/components/onboarding/PortfolioSetupSection'
import type { PortfolioItem } from '@/types'

export default function OnboardingPage() {
  const router = useRouter()
  const [healthGoal, setHealthGoal] = useState('')
  const [financeGoal, setFinanceGoal] = useState('')
  const [portfolioReady, setPortfolioReady] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePortfolioConfirm = async (items: PortfolioItem[]) => {
    await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    setPortfolioReady(true)
  }

  const handleComplete = async () => {
    if (!healthGoal.trim() || !financeGoal.trim()) {
      alert('건강 목표와 재무 목표를 모두 입력해주세요.')
      return
    }
    setIsSubmitting(true)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ health_goal: healthGoal, finance_goal: financeGoal }),
    })
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-lg px-4 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">건강-재무 코치</h1>
          <p className="mt-2 text-gray-400">시작하기 전에 목표와 포트폴리오를 설정해주세요</p>
        </div>

        <GoalSettingSection
          healthGoal={healthGoal}
          financeGoal={financeGoal}
          onHealthGoalChange={setHealthGoal}
          onFinanceGoalChange={setFinanceGoal}
        />

        <PortfolioSetupSection onConfirm={handlePortfolioConfirm} />

        <button
          onClick={handleComplete}
          disabled={!healthGoal.trim() || !financeGoal.trim() || !portfolioReady || isSubmitting}
          className="w-full rounded-lg bg-green-600 py-3 text-lg font-bold text-white hover:bg-green-700 disabled:opacity-50"
        >
          시작하기
        </button>
      </div>
    </main>
  )
}
