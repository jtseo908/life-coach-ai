'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SoftAurora from '@/components/ui/SoftAurora'
import GlassCard from '@/components/ui/GlassCard'
import ShinyText from '@/components/ui/ShinyText'
import StepIndicator from '@/components/onboarding/StepIndicator'
import { GoalSettingSection } from '@/components/onboarding/GoalSettingSection'
import { BodyProfileSection } from '@/components/onboarding/BodyProfileSection'
import { PortfolioSetupSection } from '@/components/onboarding/PortfolioSetupSection'
import type { PortfolioItem } from '@/types'

const STEPS = [
  { label: '목표', color: '#22c55e', glowColor: 'rgba(34,197,94,0.2)' },
  { label: '신체정보', color: '#a78bfa', glowColor: 'rgba(167,139,250,0.2)' },
  { label: '포트폴리오', color: '#3b82f6', glowColor: 'rgba(59,130,246,0.2)' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [healthGoal, setHealthGoal] = useState('')
  const [financeGoal, setFinanceGoal] = useState('')
  const [bodyProfile, setBodyProfile] = useState<Record<string, unknown> | null>(null)
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

  const handleBodyProfileSave = (profile: Record<string, unknown>) => {
    setBodyProfile(profile)
    setCurrentStep(2)
  }

  const handleBodyProfileSkip = () => {
    setBodyProfile({})
    setCurrentStep(2)
  }

  const handleComplete = async () => {
    if (!healthGoal.trim() || !financeGoal.trim()) return
    setIsSubmitting(true)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        health_goal: healthGoal,
        finance_goal: financeGoal,
        ...bodyProfile,
      }),
    })
    router.push('/')
  }

  const canGoNext = () => {
    if (currentStep === 0) return healthGoal.trim() !== '' && financeGoal.trim() !== ''
    if (currentStep === 1) return true // 신체정보는 건너뛰기 가능
    if (currentStep === 2) return portfolioReady
    return false
  }

  return (
    <SoftAurora>
      <main className="min-h-screen">
        <div className="mx-auto max-w-xl px-4 py-8">
          {/* 헤더 */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black tracking-wide">
              <span
                style={{
                  background: 'linear-gradient(180deg, #22c55e, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 16px rgba(34,197,94,0.2))',
                }}
              >
                V
              </span>
              <ShinyText className="text-gray-100">PULSE</ShinyText>
            </h1>
          </div>

          {/* 스텝 인디케이터 */}
          <div className="mb-8">
            <StepIndicator currentStep={currentStep} steps={STEPS} />
          </div>

          {/* 스텝 콘텐츠 */}
          <GlassCard
            accentColor={
              currentStep === 0 ? 'health' : currentStep === 1 ? 'ai' : 'wealth'
            }
            className="transition-all duration-500"
          >
            {currentStep === 0 && (
              <GoalSettingSection
                healthGoal={healthGoal}
                financeGoal={financeGoal}
                onHealthGoalChange={setHealthGoal}
                onFinanceGoalChange={setFinanceGoal}
              />
            )}

            {currentStep === 1 && (
              <BodyProfileSection
                onSave={handleBodyProfileSave}
                onSkip={handleBodyProfileSkip}
              />
            )}

            {currentStep === 2 && (
              <PortfolioSetupSection onConfirm={handlePortfolioConfirm} />
            )}
          </GlassCard>

          {/* 네비게이션 버튼 */}
          <div className="mt-6 flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm text-gray-400 transition-colors hover:text-white"
              >
                ← 이전
              </button>
            )}

            {currentStep < 2 && (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canGoNext()}
                className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-green-500 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(34,197,94,0.25)] transition-all hover:shadow-[0_4px_28px_rgba(34,197,94,0.35)] disabled:opacity-40 disabled:shadow-none"
              >
                다음 단계로 →
              </button>
            )}

            {currentStep === 2 && portfolioReady && (
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-green-500 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(34,197,94,0.25)] transition-all hover:shadow-[0_4px_28px_rgba(34,197,94,0.35)] disabled:opacity-50"
              >
                {isSubmitting ? '설정 중...' : 'VPULSE 시작하기 →'}
              </button>
            )}
          </div>
        </div>
      </main>
    </SoftAurora>
  )
}
