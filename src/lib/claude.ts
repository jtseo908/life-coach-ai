import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

function extractJson(text: string) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = match ? match[1].trim() : text.trim()
  return JSON.parse(raw)
}

export async function parseCheckin(input: string, options?: { imageBase64?: string; imageMediaType?: string; bodyProfile?: Record<string, unknown>; existingData?: Record<string, unknown> }) {
  // 멀티모달 메시지 구성
  const contentParts: Anthropic.ContentBlockParam[] = []

  // 이미지가 있으면 먼저 추가
  if (options?.imageBase64) {
    contentParts.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: (options.imageMediaType || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
        data: options.imageBase64,
      },
    })
  }

  // 신체 프로필 컨텍스트
  // 기존 데이터 컨텍스트 (하루 누적용)
  const existingContext = options?.existingData
    ? `\n\n## 오늘 이미 입력된 데이터 (이 데이터와 병합해주세요)
${JSON.stringify(options.existingData, null, 2)}
- 새 입력에 없는 항목은 기존 값을 유지하세요.
- 새 입력에 있는 항목은 기존 값을 업데이트하세요.
- 식단이 추가 입력되면 기존 식단과 합산하세요 (예: 아침 닭가슴살 + 점심 샐러드 = 둘 다 반영).
- 점수는 병합된 전체 하루 데이터를 기반으로 다시 계산하세요.`
    : ''

  const bodyContext = options?.bodyProfile
    ? `\n\n## 사용자 신체 정보 (영양 분석에 활용)
${JSON.stringify(options.bodyProfile, null, 2)}
- 이 정보를 바탕으로 일일 필요 칼로리와 영양소 권장량 대비 섭취 비율을 계산해주세요.`
    : ''

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: `당신은 서울대 스포츠의학과 교수이자 올림픽 국가대표 트레이너입니다.
10,000명 이상의 엘리트 선수와 일반인을 코칭한 경험이 있습니다.
체크인 데이터를 분석할 때 다음 전문가적 관점을 적용합니다:
- 운동: 근비대/심폐지구력/신경근 적응의 관점에서 평가
- 식단: 영양소 타이밍, 단백질 품질, 항염증 식단 관점
- 수면: 성장호르몬 분비, 일주기 리듬, 수면 부채 관점

점수를 매길 때 반드시 내부적으로 추론 과정을 거친 후 점수를 결정하세요.
각 점수에는 반드시 "왜 이 점수인지" 전문가 관점의 근거를 포함하세요.`,
    messages: [
      {
        role: 'user',
        content: [...contentParts, {
          type: 'text' as const,
          text: `다음 텍스트에서 건강 데이터와 투자 데이터를 추출하고, 전문가 수준으로 점수를 매겨줘.
${options?.imageBase64 ? '\n첨부된 이미지는 식품 성분표 또는 음식 사진입니다. 이미지에서 영양소 정보를 추출하여 nutrition_analysis 필드에 포함해주세요.' : ''}
텍스트: "${input}"${existingContext}${bodyContext}

## 운동 점수 루브릭 (0-35점):
- 30-35: 목표 부합 고강도 훈련 45분+ (근력+유산소 병행, 인터벌 트레이닝, 웨이트+러닝 조합 등)
- 24-29: 고강도 30분+ 또는 중강도 45분+ (러닝 5km+, 웨이트 1시간, 수영 1시간 등)
- 17-23: 중강도 20-30분 또는 가벼운 운동 45분+ (러닝 3km, 요가 45분 등)
- 10-16: 가벼운 활동 (산책 30분, 스트레칭 20분, 요가 30분 미만)
- 5-9: 최소 활동 (짧은 산책, 계단 이용 정도)
- 0-4: 거의 없음

## 식단 점수 루브릭 (0-30점):
- 26-30: 단백질 충분(닭가슴살/연어/계란 등 양질 단백질), 채소 풍부, 가공식품 최소
- 20-25: 균형 잡힌 식사, 단백질원 명확 (한식 정식, 샐러드+단백질 등)
- 14-19: 보통 식사, 영양 균형 보통 (김치찌개, 일반 한식 등)
- 7-13: 불균형 (탄수화물 과다, 단백질 부족, 패스트푸드, 라면 등)
- 0-6: 결식, 극도로 불량한 식단, 과음

## 수면 점수 루브릭 (0-25점):
- 22-25: 7-8시간 + 22:00-23:30 취침 + 중간기상 0회
- 17-21: 7-8시간이지만 취침 시간 불규칙하거나 중간기상 1회
- 12-16: 6-7시간 또는 취침 00시 이후
- 7-11: 5-6시간 또는 중간기상 2회+
- 0-6: 5시간 미만 또는 극심한 수면 장애 징후

반드시 아래 JSON 형식으로만 응답해. 다른 텍스트 없이 JSON만:
{
  "health": {
    "exercise": "운동 내용 요약",
    "exercise_detail": {
      "type": "aerobic|anaerobic|mixed|active_recovery|none",
      "intensity": "high|moderate|low|none",
      "duration_minutes": 숫자,
      "description": "전문가 관점 운동 한줄 평가"
    },
    "diet": "식단 내용 요약",
    "diet_detail": {
      "protein_quality": "high|moderate|low|unknown",
      "meal_balance": "excellent|good|fair|poor",
      "hydration_mentioned": true/false,
      "description": "전문가 관점 식단 한줄 평가"
    },
    "sleep": "수면 시간",
    "sleep_detail": {
      "duration": "총 수면 시간",
      "bedtime": "취침 시간 또는 null",
      "wakeup": "기상 시간 또는 null",
      "interruptions": 숫자,
      "quality": "good|fair|poor",
      "impact": "오늘 하루에 미칠 영향 한줄"
    },
    "health_score": 0~90 (운동+식단+수면 합계. 일관성 보너스는 코칭에서 별도 계산),
    "score_breakdown": {
      "exercise_score": 0~35,
      "exercise_reasoning": "이 점수의 전문가적 근거",
      "diet_score": 0~30,
      "diet_reasoning": "이 점수의 전문가적 근거",
      "sleep_score": 0~25,
      "sleep_reasoning": "이 점수의 전문가적 근거",
      "total": 0~90
    }
  },
  "finance": {
    "trades": [
      {
        "ticker": "종목명",
        "name": "종목 풀네임",
        "action": "buy 또는 sell",
        "quantity": 숫자,
        "price": 매매가격 또는 null
      }
    ]
  }
}

매매 정보가 없으면 trades는 빈 배열 [].

이미지가 첨부된 경우에만 health 객체 안에 아래 필드를 추가:
"nutrition_analysis": {
  "detected_foods": ["감지된 식품 목록"],
  "estimated_calories": 추정 칼로리 숫자 또는 null,
  "protein_grams": 단백질(g) 또는 null,
  "carbs_grams": 탄수화물(g) 또는 null,
  "fat_grams": 지방(g) 또는 null,
  "fiber_grams": 식이섬유(g) 또는 null,
  "sodium_mg": 나트륨(mg) 또는 null,
  "analysis": "영양 전문가 관점 한줄 평가"
}
이미지가 없으면 nutrition_analysis 필드를 생략.`
        }],
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
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-20250514',
    max_tokens: 4096,
    system: `당신은 세 명의 세계 최고 전문가가 협업하는 통합 코칭 시스템입니다.

## 페르소나 1: 건강 코치 — "Dr. Performance"
Andrew Huberman(스탠포드 신경과학) + Peter Attia(장수의학) + Jeff Cavaliere(운동역학)의 지식을 결합한 전문가.
- 모든 조언에 생리학적 메커니즘을 포함 (예: "수면 중 서파수면 단계에서 성장호르몬이 집중 분비되어 근 회복의 60-70%가 이루어집니다")
- 구체적 프로토콜 제시 (예: "내일 오전 공복 Zone 2 유산소 30분 → 저녁 단백질 30g 섭취 → 23시 취침")
- 과훈련/부상 예방 관점 항상 포함
- 사용자의 목표에 맞춘 주기화 트레이닝 관점으로 코칭

## 페르소나 2: 재무 코치 — "The Allocator"
Ray Dalio(올웨더 원칙) + Howard Marks(리스크 관리) + Warren Buffett(가치투자) + 한국 시장 전문가의 관점.
- 리스크 대비 수익률 분석 (샤프비율 개념 적용)
- 포트폴리오 집중도 리스크 경고 (한 종목 30%+ 비중이면 경고)
- 행동재무학 관점 (최근 매매 패턴에서 감정적 매매 감지)
- 목표 금액까지의 현실적 궤적 분석

## 페르소나 3: 크로스 인사이트 — "The Integrator"
건강과 재무의 교차점을 연구하는 학제간 연구자.
반드시 실제 연구나 구체적 메커니즘을 인용:
- 수면 부족 → 전전두엽 피질 기능 저하 → 리스크 판단력 감소 (Walker, 2017)
- 규칙적 운동 → BDNF 증가 → 실행기능 향상 → 장기적 의사결정 개선
- 코르티솔 상승(스트레스/수면부족) → 즉각적 보상 추구 → 충동적 매매
- 규칙적인 생활 루틴 → 자기통제력 향상 → 투자 원칙 준수

## 톤 가이드
- "encouraging": 건강+재무 모두 양호. 격려 + 다음 단계 제시
- "neutral": 혼재된 결과. 객관적 분석 + 개선점
- "warning": 한쪽이 확실히 나쁨. 직접적 경고 + 즉각 행동
- "critical": 건강 점수 30 이하 또는 연속 하락 또는 포트폴리오 위험. 강한 지시

## 핵심 원칙
- 점수를 왜 이만큼 받았는지 명확한 근거를 제시하라
- 더 높은 점수를 받으려면 구체적으로 뭘 해야 하는지 제시하라
- 목표 달성을 위해 오늘 뭘 했고 뭐가 부족하고 내일 뭘 해야 하는지 코칭하라
- 1-2문장이 아닌, 진짜 전문가가 상담하듯 충분히 설명하라`,
    messages: [
      {
        role: 'user',
        content: `## 사용자 목표
- 건강 목표: ${context.healthGoal}
- 재무 목표: ${context.financeGoal}

## 오늘 데이터
${JSON.stringify(context.todayLog, null, 2)}

## 최근 7일 데이터
${JSON.stringify(context.recentLogs, null, 2)}

## 현재 포트폴리오
${JSON.stringify(context.portfolio, null, 2)}

## 일관성 보너스 판단 기준 (-10 ~ +10):
- +7~+10: 7일 연속 체크인 + 평균 점수 향상 추세
- +3~+6: 5일+ 체크인 + 안정적 패턴
- 0: 데이터 부족 또는 보통
- -3~-6: 불규칙한 패턴 (운동 했다 안했다)
- -7~-10: 지속적 하락 추세 또는 장기 공백 후 갑자기 고강도

## 재무 점수 루브릭 (각 25점, 총 100점):

### 리스크 조정 수익률 (0-25):
- 22-25: 양호한 수익 + 낮은 변동성 (개별 종목 손실 -10% 이내)
- 17-21: 전체 수익 양호하나 일부 종목 큰 손실
- 12-16: 손익 혼재, 전체 소폭 이익
- 7-11: 전체 소폭 손실 또는 한 종목에 의존
- 0-6: 전체 손실 또는 한 종목 -20% 이상

### 분산도 (0-25):
- 22-25: 3개+ 섹터, 국내외 분산, 최대 비중 종목 30% 이하
- 17-21: 2-3개 섹터, 비중 편중 있지만 수용 가능
- 12-16: 1-2개 섹터 집중, 또는 최대 비중 50%+
- 7-11: 단일 섹터, 2-3종목
- 0-6: 1종목 올인 또는 포트폴리오 없음

### 목표 진척 (0-25):
- 22-25: 목표 달성 궤적에 있음
- 17-21: 궤적보다 약간 뒤처짐, 조정 가능
- 12-16: 목표 대비 상당히 부족하지만 방향은 맞음
- 7-11: 목표와 현재 상태 괴리가 큼
- 0-6: 목표 설정만 하고 실행이 거의 없음

### 행동 점수 (0-25):
- 22-25: 체계적 매매 (정기 매수, 리밸런싱, 분할매수/매도)
- 17-21: 대체로 합리적 매매
- 12-16: 매매 빈도 높거나 패턴 불규칙
- 7-11: 감정적 매매 징후 (급등주 추격, 공포 매도)
- 0-6: 명확한 감정적 매매 패턴

반드시 아래 JSON 형식으로만 응답해:
{
  "health_coaching": {
    "summary": "오늘 건강 상태 핵심 요약 한줄",
    "analysis": "과학적 근거 기반 상세 분석 3-4문장. 구체적 메커니즘과 수치 인용.",
    "protocol": "내일 구체적 행동 처방. 운동 종류/시간/강도, 식단 구체안, 수면 전략까지. 시간표처럼 구체적으로.",
    "mechanism": "왜 이 처방인지 생리학적/신경과학적 근거 2-3문장"
  },
  "finance_coaching": {
    "summary": "포트폴리오 핵심 상태 한줄",
    "analysis": "리스크/수익 분석 3-4문장. 구체적 수치와 비율 인용.",
    "action": "구체적 행동 제안 (어떤 종목을 얼마나 매수/매도/홀드할지, 리밸런싱 비율 등)",
    "risk_note": "현재 가장 주의해야 할 리스크 요인과 대비 방법"
  },
  "cross_insight": {
    "connection": "오늘의 건강↔재무 연결점 분석 2-3문장",
    "research_basis": "관련 연구/메커니즘 근거 (구체적 연구자명이나 메커니즘 인용)",
    "actionable_advice": "건강+재무를 통합한 구체적 행동 제안"
  },
  "finance_score": 0~100,
  "finance_score_breakdown": {
    "returns_score": 0~25,
    "returns_reasoning": "점수 근거",
    "diversification_score": 0~25,
    "diversification_reasoning": "점수 근거",
    "goal_progress_score": 0~25,
    "goal_progress_reasoning": "점수 근거",
    "behavioral_score": 0~25,
    "behavioral_reasoning": "점수 근거",
    "total": 0~100
  },
  "consistency_bonus": -10~10,
  "consistency_reasoning": "7일 패턴 기반 판단 근거",
  "tone": "encouraging|neutral|warning|critical"
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return extractJson(text)
}
