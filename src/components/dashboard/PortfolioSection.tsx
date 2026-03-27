'use client'

import { useEffect, useState } from 'react'
import type { PortfolioItem } from '@/types'
import { FIXED_EXCHANGE_RATE } from '@/lib/constants'
import GlassCard from '@/components/ui/GlassCard'
import BorderGlow from '@/components/ui/BorderGlow'

type StockVerdict = {
  name: string
  ticker: string
  verdict: 'hold' | 'add' | 'reduce' | 'sell'
  reasoning: string
  target_weight: string
}

type Diagnosis = {
  overall_grade: string
  overall_summary: string
  risk_analysis: {
    concentration_risk: string
    currency_risk: string
    volatility_risk: string
  }
  diversification_diagnosis: {
    current_state: string
    weakness: string
    ideal_allocation: string
  }
  individual_stocks: StockVerdict[]
  rebalancing_strategy: {
    priority_actions: string
    monthly_plan: string
    new_additions: string
  }
  goal_trajectory: {
    current_total_krw: number
    goal_analysis: string
    required_monthly_return: string
    realistic_timeline: string
  }
}

const VERDICT_STYLES = {
  hold: 'bg-gray-400/[0.08] border border-gray-400/[0.15] text-gray-300',
  add: 'bg-green-400/[0.08] border border-green-400/[0.15] text-green-400',
  reduce: 'bg-yellow-400/[0.08] border border-yellow-400/[0.15] text-yellow-400',
  sell: 'bg-red-400/[0.08] border border-red-400/[0.15] text-red-400',
} as const

const VERDICT_LABELS = {
  hold: '보유',
  add: '추가매수',
  reduce: '비중축소',
  sell: '매도',
} as const

const GRADE_COLORS: Record<string, string> = {
  A: 'text-green-400',
  B: 'text-green-400',
  C: 'text-yellow-400',
  D: 'text-red-400',
  F: 'text-red-400',
}

const GRADE_GLOW_COLORS: Record<string, 'health' | 'wealth' | 'ai'> = {
  A: 'health',
  B: 'health',
  C: 'ai',
  D: 'ai',
  F: 'ai',
}

export function PortfolioSection() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editItems, setEditItems] = useState<PortfolioItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isDiagnosing, setIsDiagnosing] = useState(false)
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)

  const fetchPortfolio = () => {
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => setPortfolio(Array.isArray(data) ? data : []))
  }

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const handleRefreshPrices = async () => {
    setIsRefreshing(true)
    try {
      await fetch('/api/stock', { method: 'POST' })
      fetchPortfolio()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDiagnosis = async () => {
    setIsDiagnosing(true)
    try {
      const res = await fetch('/api/portfolio-diagnosis', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setDiagnosis(data)
      } else {
        alert(data.error || '진단에 실패했습니다')
      }
    } catch {
      alert('진단에 실패했습니다')
    } finally {
      setIsDiagnosing(false)
    }
  }

  const handleStartEdit = () => {
    setEditItems(portfolio.map(item => ({ ...item })))
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditItems([])
  }

  const updateItem = (index: number, field: keyof PortfolioItem, value: string | number) => {
    setEditItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const removeItem = (index: number) => {
    setEditItems(prev => prev.filter((_, i) => i !== index))
  }

  const addItem = () => {
    setEditItems(prev => [...prev, { ticker: '', name: '', quantity: 0, avg_price: 0, currency: 'KRW' as const, current_price: 0 }])
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: editItems }),
      })
      fetchPortfolio()
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const getReturnRate = (item: PortfolioItem) => {
    if (item.avg_price === 0) return 0
    return ((item.current_price - item.avg_price) / item.avg_price) * 100
  }

  const totalValueKRW = portfolio.reduce((sum, item) => {
    const price = item.current_price * item.quantity
    return sum + (item.currency === 'USD' ? price * FIXED_EXCHANGE_RATE : price)
  }, 0)

  if (isEditing) {
    return (
      <GlassCard accentColor="wealth">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">포트폴리오 편집</h2>
            <button onClick={handleCancelEdit} className="text-xs text-gray-400 hover:text-white transition-colors">취소</button>
          </div>
          {editItems.map((item, i) => (
            <div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 rounded-lg bg-white/[0.04] border border-white/[0.06] px-2 py-1.5 text-white text-sm placeholder:text-gray-500 focus:border-white/[0.12] focus:outline-none transition-colors"
                  value={item.name}
                  onChange={e => updateItem(i, 'name', e.target.value)}
                  placeholder="종목명"
                />
                <input
                  className="w-28 rounded-lg bg-white/[0.04] border border-white/[0.06] px-2 py-1.5 text-white text-sm font-mono placeholder:text-gray-500 focus:border-white/[0.12] focus:outline-none transition-colors"
                  value={item.ticker}
                  onChange={e => updateItem(i, 'ticker', e.target.value)}
                  placeholder="티커"
                />
                <button onClick={() => removeItem(i)} className="text-red-400 text-sm hover:text-red-300 transition-colors">삭제</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-2 py-1.5 text-white text-sm placeholder:text-gray-500 focus:border-white/[0.12] focus:outline-none transition-colors"
                  value={item.quantity}
                  onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                  placeholder="수량"
                />
                <input
                  type="number"
                  className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-2 py-1.5 text-white text-sm placeholder:text-gray-500 focus:border-white/[0.12] focus:outline-none transition-colors"
                  value={item.avg_price}
                  onChange={e => updateItem(i, 'avg_price', Number(e.target.value))}
                  placeholder="평단가"
                />
                <select
                  className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-2 py-1.5 text-white text-sm focus:border-white/[0.12] focus:outline-none transition-colors"
                  value={item.currency}
                  onChange={e => updateItem(i, 'currency', e.target.value)}
                >
                  <option value="KRW">KRW</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
          ))}
          <button
            onClick={addItem}
            className="w-full rounded-xl border border-dashed border-white/[0.08] py-2 text-sm text-gray-400 hover:text-white hover:border-white/[0.15] transition-colors"
          >
            + 종목 추가
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full rounded-xl border border-blue-400/30 bg-gradient-to-r from-blue-500/20 to-violet-500/20 py-2.5 text-sm font-semibold text-blue-300 hover:from-blue-500/30 hover:to-violet-500/30 disabled:opacity-50 transition-all"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </GlassCard>
    )
  }

  return (
    <section className="space-y-3">
      {/* 포트폴리오 리스트 */}
      <GlassCard accentColor="wealth">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">포트폴리오</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              총 {totalValueKRW.toLocaleString()}원
            </span>
            <button
              onClick={handleRefreshPrices}
              disabled={isRefreshing}
              className="rounded-full bg-white/[0.04] border border-white/[0.06] px-3 py-1 text-xs text-gray-400 hover:text-white hover:border-white/[0.12] disabled:opacity-50 transition-colors"
            >
              {isRefreshing ? '갱신 중...' : '시세 갱신'}
            </button>
            <button
              onClick={handleStartEdit}
              className="rounded-full bg-white/[0.04] border border-white/[0.06] px-3 py-1 text-xs text-gray-400 hover:text-white hover:border-white/[0.12] transition-colors"
            >
              편집
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {portfolio.map(item => {
            const returnRate = getReturnRate(item)
            const isPositive = returnRate >= 0
            return (
              <div key={item.ticker} className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 hover:border-white/[0.08] transition-colors">
                <div>
                  <div className="text-sm font-semibold text-white">{item.name}</div>
                  <div className="text-xs text-gray-400">
                    {item.quantity}주 · 평단 {item.avg_price.toLocaleString()}{item.currency === 'KRW' ? '원' : '$'}
                    {item.current_price !== item.avg_price && (
                      <span className="ml-1">· 현재 {item.current_price.toLocaleString()}{item.currency === 'KRW' ? '원' : '$'}</span>
                    )}
                  </div>
                </div>
                <div className={`text-sm font-bold ${isPositive ? 'text-green-400 drop-shadow-[0_0_6px_rgba(74,222,128,0.4)]' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{returnRate.toFixed(1)}%
                </div>
              </div>
            )
          })}
        </div>

        {/* 전문 진단 버튼 */}
        <button
          onClick={handleDiagnosis}
          disabled={isDiagnosing || portfolio.length === 0}
          className="w-full mt-3 rounded-xl border border-violet-400/30 bg-gradient-to-r from-violet-500/20 to-blue-500/20 py-2.5 text-sm font-semibold text-violet-300 hover:from-violet-500/30 hover:to-blue-500/30 disabled:opacity-50 transition-all"
        >
          {isDiagnosing ? 'AI 전문가 진단 중... (30초~1분 소요)' : '✦ 포트폴리오 전문 진단'}
        </button>
      </GlassCard>

      {/* 진단 결과 */}
      {diagnosis && (
        <div className="space-y-3">
          {/* 전체 등급 */}
          <BorderGlow color={GRADE_GLOW_COLORS[diagnosis.overall_grade] || 'ai'}>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-3xl font-black ${GRADE_COLORS[diagnosis.overall_grade] || 'text-gray-400'}`}>
                {diagnosis.overall_grade}
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">포트폴리오 종합 진단</h3>
                <p className="text-sm text-gray-300">{diagnosis.overall_summary}</p>
              </div>
            </div>
          </BorderGlow>

          {/* 리스크 분석 */}
          <GlassCard>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-red-400">리스크 분석</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="rounded-xl bg-red-400/[0.04] border border-red-400/[0.08] p-2">
                  <span className="text-xs text-red-400 font-semibold">집중도 리스크</span>
                  <p className="text-xs mt-0.5">{diagnosis.risk_analysis.concentration_risk}</p>
                </div>
                <div className="rounded-xl bg-red-400/[0.04] border border-red-400/[0.08] p-2">
                  <span className="text-xs text-red-400 font-semibold">환율 리스크</span>
                  <p className="text-xs mt-0.5">{diagnosis.risk_analysis.currency_risk}</p>
                </div>
                <div className="rounded-xl bg-red-400/[0.04] border border-red-400/[0.08] p-2">
                  <span className="text-xs text-red-400 font-semibold">변동성 리스크</span>
                  <p className="text-xs mt-0.5">{diagnosis.risk_analysis.volatility_risk}</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* 종목별 판정 */}
          <GlassCard>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-blue-400">종목별 판정</h3>
              {diagnosis.individual_stocks.map((stock, i) => (
                <div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 hover:border-white/[0.08] transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-white">{stock.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">적정 {stock.target_weight}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${VERDICT_STYLES[stock.verdict]}`}>
                        {VERDICT_LABELS[stock.verdict]}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{stock.reasoning}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 리밸런싱 전략 */}
          <GlassCard accentColor="health">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-green-400">리밸런싱 전략</h3>
              <div className="rounded-xl bg-green-400/[0.04] border border-green-400/[0.1] p-3">
                <span className="text-xs font-semibold text-green-400">즉시 실행</span>
                <p className="text-sm text-gray-200 mt-1">{diagnosis.rebalancing_strategy.priority_actions}</p>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
                <span className="text-xs font-semibold text-gray-400">1개월 계획</span>
                <p className="text-xs text-gray-300 mt-1">{diagnosis.rebalancing_strategy.monthly_plan}</p>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
                <span className="text-xs font-semibold text-gray-400">추가 고려 종목</span>
                <p className="text-xs text-gray-300 mt-1">{diagnosis.rebalancing_strategy.new_additions}</p>
              </div>
            </div>
          </GlassCard>

          {/* 목표 궤적 */}
          <BorderGlow color="ai">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-violet-300">목표 달성 분석</h3>
              <p className="text-sm text-gray-300">{diagnosis.goal_trajectory.goal_analysis}</p>
              <div className="flex gap-3 text-xs">
                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-2 py-1">
                  <span className="text-gray-500">필요 월수익률</span>
                  <span className="ml-1 text-violet-300 font-semibold">{diagnosis.goal_trajectory.required_monthly_return}</span>
                </div>
                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-2 py-1">
                  <span className="text-gray-500">예상 기간</span>
                  <span className="ml-1 text-violet-300 font-semibold">{diagnosis.goal_trajectory.realistic_timeline}</span>
                </div>
              </div>
            </div>
          </BorderGlow>

          {/* 닫기 */}
          <button
            onClick={() => setDiagnosis(null)}
            className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] py-2 text-xs text-gray-400 hover:text-white hover:border-white/[0.12] transition-colors"
          >
            진단 결과 닫기
          </button>
        </div>
      )}
    </section>
  )
}
