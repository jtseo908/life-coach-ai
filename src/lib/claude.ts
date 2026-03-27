import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

function extractJson(text: string) {
  // ```json ... ``` 코드블록에서 JSON 추출
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = match ? match[1].trim() : text.trim()
  return JSON.parse(raw)
}

export async function parseCheckin(input: string) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `다음 텍스트에서 건강 데이터와 투자 데이터를 추출해서 JSON으로 반환해줘.

텍스트: "${input}"

반드시 아래 JSON 형식으로만 응답해. 다른 텍스트 없이 JSON만:
{
  "health": {
    "exercise": "운동 내용 (없으면 '없음')",
    "diet": "식단 내용 (없으면 '없음')",
    "sleep": "수면 총 시간 (없으면 '없음')",
    "sleep_detail": {
      "duration": "총 수면 시간 (예: 7시간)",
      "bedtime": "취침 시간 (언급 있으면 예: 23:00, 없으면 null)",
      "wakeup": "기상 시간 (언급 있으면 예: 06:00, 없으면 null)",
      "interruptions": "중간 기상 횟수 (언급 있으면 숫자, 없으면 0)",
      "quality": "수면 품질 평가 (good/fair/poor — 취침시간, 총시간, 중간기상 등을 종합 판단)",
      "impact": "오늘 하루에 미칠 영향 한줄 (예: '충분한 수면으로 집중력 좋은 하루', '수면 부족으로 오후 졸음 주의')"
    },
    "health_score": 0~100 숫자 (운동 40점 + 식단 30점 + 수면 30점 기준)
  },
  "finance": {
    "trades": [
      {
        "ticker": "종목명",
        "name": "종목 풀네임",
        "action": "buy 또는 sell",
        "quantity": 숫자,
        "price": 매매가격 (언급 없으면 null)
      }
    ]
  }
}

점수 기준:
- 운동(40점): 고강도 운동 30분+ = 35~40, 중강도 = 25~34, 가벼운 운동 = 10~24, 없음 = 0
- 식단(30점): 균형잡힌 건강식 = 25~30, 보통 = 15~24, 패스트푸드/불량 = 0~14
- 수면(30점): 7~8시간 + 22~24시 취침 + 중간기상 없음 = 25~30, 7~8시간이지만 늦은 취침이나 중간기상 = 18~24, 6~7시간 = 12~17, 6시간 미만 or 9시간+ = 0~11. 수면의 질(취침시간, 중간기상)도 반영

매매 정보가 없으면 trades는 빈 배열 [].`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return extractJson(text)
}

export async function parsePortfolio(input: string) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `다음 텍스트에서 주식 포트폴리오 정보를 추출해서 JSON으로 반환해줘.

텍스트: "${input}"

반드시 아래 JSON 형식으로만 응답해. 다른 텍스트 없이 JSON만:
{
  "items": [
    {
      "ticker": "Yahoo Finance 티커 (한국 종목은 종목코드.KS 형식, 예: 삼성전자→005930.KS, SK하이닉스→000660.KS. 미국 종목은 그대로, 예: TSLA, AAPL)",
      "name": "종목 풀네임 (한국어 이름)",
      "quantity": 보유수량,
      "avg_price": 평균매수가 (숫자만),
      "currency": "KRW" 또는 "USD" (원화면 KRW, 달러면 USD),
      "current_price": 현재가 (언급 없으면 avg_price와 동일 값)
    }
  ]
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return extractJson(text)
}

export async function generateCoaching(context: {
  healthGoal: string
  financeGoal: string
  todayLog: unknown
  recentLogs: unknown[]
  portfolio: unknown[]
}) {
  // 코칭은 깊은 맥락 분석이 필요하므로 Opus 사용
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `너는 건강-재무 통합 AI 코치야. 사용자의 데이터를 분석해서 코칭해줘.

## 사용자 목표
- 건강 목표: ${context.healthGoal}
- 재무 목표: ${context.financeGoal}

## 오늘 데이터
${JSON.stringify(context.todayLog, null, 2)}

## 최근 7일 데이터
${JSON.stringify(context.recentLogs, null, 2)}

## 현재 포트폴리오
${JSON.stringify(context.portfolio, null, 2)}

## 톤 가이드
- 평소: 친근한 파트너처럼 ("~해볼까?", "좋은데요!")
- 위험 신호(건강 점수 30 이하, 수면 5시간 이하, 연속 하락 등): 엄격한 코치로 전환 ("⚠️ 오늘은 반드시 ~", "매매를 강력히 자제하세요")

반드시 아래 JSON 형식으로만 응답해:
{
  "health_coaching": "건강 코칭 1-2문장",
  "finance_coaching": "재무 코칭 1-2문장",
  "cross_insight": "건강↔재무 크로스 인사이트 1-2문장. 두 영역의 상관관계를 분석해서 행동 가이드를 줘.",
  "finance_score": 0~100 숫자 (포트폴리오 수익률 40점 + 분산도 30점 + 목표 대비 진척 30점 기준으로 현재 포트폴리오 평가)
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return extractJson(text)
}
