// === 수면 상세 ===
export type SleepDetail = {
  duration: string
  bedtime: string | null
  wakeup: string | null
  interruptions: number
  quality: 'good' | 'fair' | 'poor'
  impact: string
}

// === 운동 상세 ===
export type ExerciseDetail = {
  type: 'aerobic' | 'anaerobic' | 'mixed' | 'active_recovery' | 'none'
  intensity: 'high' | 'moderate' | 'low' | 'none'
  duration_minutes: number
  description: string
}

// === 식단 상세 ===
export type DietDetail = {
  protein_quality: 'high' | 'moderate' | 'low' | 'unknown'
  meal_balance: 'excellent' | 'good' | 'fair' | 'poor'
  hydration_mentioned: boolean
  description: string
}

// === 건강 점수 breakdown ===
export type HealthScoreBreakdown = {
  exercise_score: number
  exercise_reasoning: string
  diet_score: number
  diet_reasoning: string
  sleep_score: number
  sleep_reasoning: string
  total: number
}

// === 재무 점수 breakdown ===
export type FinanceScoreBreakdown = {
  returns_score: number
  returns_reasoning: string
  diversification_score: number
  diversification_reasoning: string
  goal_progress_score: number
  goal_progress_reasoning: string
  behavioral_score: number
  behavioral_reasoning: string
  total: number
}

// === 구조화된 코칭 출력 ===
export type StructuredCoaching = {
  health_coaching: {
    summary: string
    analysis: string
    protocol: string
    mechanism: string
  }
  finance_coaching: {
    summary: string
    analysis: string
    action: string
    risk_note: string
  }
  cross_insight: {
    connection: string
    research_basis: string
    actionable_advice: string
  }
  finance_score: number
  finance_score_breakdown: FinanceScoreBreakdown
  consistency_bonus: number
  consistency_reasoning: string
  tone: 'encouraging' | 'neutral' | 'warning' | 'critical'
}

export type HealthData = {
  exercise: string
  exercise_detail?: ExerciseDetail
  diet: string
  diet_detail?: DietDetail
  sleep: string
  sleep_detail?: SleepDetail
  health_score: number
  score_breakdown?: HealthScoreBreakdown
}

export type Trade = {
  ticker: string
  name: string
  action: 'buy' | 'sell'
  quantity: number
  price?: number
}

export type FinanceData = {
  trades: Trade[]
  portfolio_snapshot: PortfolioItem[]
  finance_score: number
  finance_score_breakdown?: FinanceScoreBreakdown
}

export type PortfolioItem = {
  id?: string
  ticker: string
  name: string
  quantity: number
  avg_price: number
  currency: 'KRW' | 'USD'
  current_price: number
}

export type DailyLog = {
  id?: string
  date: string
  raw_input: string
  health_data: HealthData
  finance_data: FinanceData
  ai_coaching: string | null
  cross_insight: string | null
  created_at?: string
}

export type Settings = {
  id?: string
  health_goal: string
  finance_goal: string
}

export type ParseRequest = {
  type: 'checkin' | 'portfolio'
  input: string
}

export type ParsedCheckin = {
  health: HealthData
  finance: { trades: Trade[] }
}

export type ParsedPortfolio = {
  items: PortfolioItem[]
}
