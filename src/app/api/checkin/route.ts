import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const targetDate = body.date || new Date().toISOString().split('T')[0]

  // 기존 오늘 데이터 조회
  const { data: existing } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', targetDate)
    .single()

  if (existing) {
    // 기존 데이터와 병합
    const mergedRawInput = existing.raw_input
      ? `${existing.raw_input}\n---\n${body.raw_input}`
      : body.raw_input

    const existingHealth = existing.health_data || {}
    const newHealth = body.health_data || {}
    const existingFinance = existing.finance_data || {}
    const newFinance = body.finance_data || {}

    // 건강 데이터 병합: 새 값이 '없음'이 아니면 업데이트, '없음'이면 기존 유지
    const mergedHealth = {
      ...existingHealth,
      ...newHealth,
      exercise: (newHealth.exercise && newHealth.exercise !== '없음') ? newHealth.exercise : existingHealth.exercise || '없음',
      diet: (newHealth.diet && newHealth.diet !== '없음') ? newHealth.diet : existingHealth.diet || '없음',
      sleep: (newHealth.sleep && newHealth.sleep !== '없음') ? newHealth.sleep : existingHealth.sleep || '없음',
      // 상세 정보도 새 값이 있으면 업데이트
      exercise_detail: newHealth.exercise_detail?.type !== 'none' ? newHealth.exercise_detail : existingHealth.exercise_detail,
      diet_detail: newHealth.diet_detail?.meal_balance !== 'poor' || !existingHealth.diet_detail ? newHealth.diet_detail : existingHealth.diet_detail,
      sleep_detail: newHealth.sleep_detail?.duration ? newHealth.sleep_detail : existingHealth.sleep_detail,
      // 점수는 항상 새로 계산된 값 사용 (AI가 병합된 전체 데이터 기반으로 계산)
      health_score: newHealth.health_score || existingHealth.health_score || 0,
      score_breakdown: newHealth.score_breakdown || existingHealth.score_breakdown,
      nutrition_analysis: newHealth.nutrition_analysis || existingHealth.nutrition_analysis,
    }

    // 재무 데이터 병합: trades는 누적
    const existingTrades = existingFinance.trades || []
    const newTrades = newFinance.trades || []
    const mergedFinance = {
      ...existingFinance,
      trades: [...existingTrades, ...newTrades],
      finance_score: existingFinance.finance_score || 0,
    }

    const { data, error } = await supabase
      .from('daily_logs')
      .update({
        raw_input: mergedRawInput,
        health_data: mergedHealth,
        finance_data: mergedFinance,
      })
      .eq('user_id', user.id)
      .eq('date', targetDate)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // 신규 생성
  const { data, error } = await supabase
    .from('daily_logs')
    .insert({ ...body, user_id: user.id, date: targetDate })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
