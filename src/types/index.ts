export type SleepDetail = {
  duration: string
  bedtime: string | null
  wakeup: string | null
  interruptions: number
  quality: 'good' | 'fair' | 'poor'
  impact: string
}

export type HealthData = {
  exercise: string
  diet: string
  sleep: string
  sleep_detail?: SleepDetail
  health_score: number
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
