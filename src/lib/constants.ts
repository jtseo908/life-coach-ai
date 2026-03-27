export const FIXED_EXCHANGE_RATE = 1350 // 1 USD = 1,350 KRW

export const SCORE_CRITERIA = {
  health: {
    exercise: 35,
    diet: 30,
    sleep: 25,
    consistency: 10, // ±10 보너스/페널티 (코칭에서 계산)
  },
  finance: {
    risk_adjusted_returns: 25,
    diversification: 25,
    goal_progress: 25,
    behavioral: 25,
  },
} as const
