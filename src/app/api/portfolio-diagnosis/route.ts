import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

function extractJson(text: string) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = match ? match[1].trim() : text.trim()
  return JSON.parse(raw)
}

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [settingsRes, portfolioRes, recentRes] = await Promise.all([
    supabase.from('settings').select('*').eq('user_id', user.id).single(),
    supabase.from('portfolio').select('*').eq('user_id', user.id),
    supabase.from('daily_logs').select('finance_data').eq('user_id', user.id).order('date', { ascending: false }).limit(14),
  ])

  const portfolio = portfolioRes.data || []
  if (portfolio.length === 0) {
    return NextResponse.json({ error: '포트폴리오가 없습니다' }, { status: 404 })
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 4096,
      system: `당신은 세계 최고의 포트폴리오 매니저 3인이 협업하는 투자 자문 시스템입니다.

## Ray Dalio (올웨더 전략)
- 경제 사이클과 자산 배분의 관계 분석
- 인플레이션/디플레이션/성장/침체 4사분면 프레임워크
- "분산은 공짜 점심" 원칙에 따른 포트폴리오 진단

## Howard Marks (리스크 관리)
- "리스크는 손실이 아니라 손실의 가능성"
- 포트폴리오의 꼬리 리스크(tail risk) 분석
- 시장 사이클 내 현재 위치 판단

## Warren Buffett (가치투자)
- 개별 종목의 내재가치 대비 현재 가격 판단
- 장기 복리 성장 관점에서의 포트폴리오 평가
- "남들이 두려워할 때 탐욕적으로" 원칙

## 한국 시장 전문가
- KRW/USD 환율 리스크 분석
- 한국 특유의 시장 구조(개인투자자 비중, 대형주 편중) 고려
- 세금(양도세, 배당세) 관점에서의 전략

모든 분석에 구체적 수치와 비율을 포함하세요.
추상적 조언이 아닌, 실행 가능한 구체적 전략을 제시하세요.`,
      messages: [
        {
          role: 'user',
          content: `## 투자 목표
${settingsRes.data?.finance_goal || '미설정'}

## 현재 포트폴리오
${JSON.stringify(portfolio, null, 2)}

## 최근 14일 매매 히스토리
${JSON.stringify(recentRes.data?.map(d => d.finance_data) || [], null, 2)}

위 포트폴리오를 전문가 관점에서 전면 진단하고 전략을 수립해줘.

반드시 아래 JSON 형식으로만 응답해:
{
  "overall_grade": "A|B|C|D|F",
  "overall_summary": "포트폴리오 전체 상태 2-3문장 핵심 진단",
  "risk_analysis": {
    "concentration_risk": "섹터/종목 집중도 분석. 어떤 종목이 몇 %를 차지하고 왜 위험한지 구체적으로.",
    "currency_risk": "원화/달러 비중 분석과 환율 리스크",
    "volatility_risk": "포트폴리오 전체 변동성 추정과 최대 예상 손실(MDD)"
  },
  "diversification_diagnosis": {
    "current_state": "현재 분산 상태 진단 (섹터별, 지역별, 자산유형별)",
    "weakness": "가장 취약한 부분과 이유",
    "ideal_allocation": "목표 달성을 위한 이상적 자산배분 제안 (구체적 비율)"
  },
  "individual_stocks": [
    {
      "name": "종목명",
      "ticker": "티커",
      "verdict": "hold|add|reduce|sell",
      "reasoning": "이 판단의 근거 2-3문장. 밸류에이션, 성장성, 리스크 포함.",
      "target_weight": "포트폴리오 내 적정 비중 (%)"
    }
  ],
  "rebalancing_strategy": {
    "priority_actions": "지금 즉시 실행해야 할 1-2가지 행동",
    "monthly_plan": "향후 1개월 분할 매수/매도 계획",
    "new_additions": "현재 포트폴리오에 추가를 고려할 종목/ETF와 이유"
  },
  "goal_trajectory": {
    "current_total_krw": 현재 총 자산(원화 환산) 숫자,
    "goal_analysis": "목표 대비 현재 위치와 현실적 달성 가능성 분석",
    "required_monthly_return": "목표 달성에 필요한 월간 수익률 (%)",
    "realistic_timeline": "현실적 목표 달성 예상 기간"
  }
}`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const diagnosis = extractJson(text)
    return NextResponse.json(diagnosis)
  } catch (error) {
    console.error('Portfolio diagnosis error:', error)
    return NextResponse.json({ error: '포트폴리오 진단에 실패했습니다' }, { status: 500 })
  }
}
