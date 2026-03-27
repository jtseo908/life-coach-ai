import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateCoaching } from '@/lib/claude'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { date } = await request.json()
  const targetDate = date || new Date().toISOString().split('T')[0]

  const [settingsRes, todayRes, recentRes, portfolioRes] = await Promise.all([
    supabase.from('settings').select('*').eq('user_id', user.id).single(),
    supabase.from('daily_logs').select('*').eq('user_id', user.id).eq('date', targetDate).single(),
    supabase.from('daily_logs').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(7),
    supabase.from('portfolio').select('*').eq('user_id', user.id),
  ])

  if (!todayRes.data) {
    return NextResponse.json({ error: '오늘 체크인 데이터가 없습니다' }, { status: 404 })
  }

  try {
    const coaching = await generateCoaching({
      healthGoal: settingsRes.data?.health_goal || '',
      financeGoal: settingsRes.data?.finance_goal || '',
      todayLog: todayRes.data,
      recentLogs: recentRes.data || [],
      portfolio: portfolioRes.data || [],
    })

    // 구조화된 코칭을 리치 텍스트로 포맷
    const healthText = [
      `💪 ${coaching.health_coaching.summary}`,
      '',
      coaching.health_coaching.analysis,
      '',
      `📋 내일의 처방: ${coaching.health_coaching.protocol}`,
      '',
      `🔬 근거: ${coaching.health_coaching.mechanism}`,
    ].join('\n')

    const financeText = [
      `💰 ${coaching.finance_coaching.summary}`,
      '',
      coaching.finance_coaching.analysis,
      '',
      `💡 액션: ${coaching.finance_coaching.action}`,
      '',
      `⚠️ 리스크: ${coaching.finance_coaching.risk_note}`,
    ].join('\n')

    const crossText = [
      coaching.cross_insight.connection,
      '',
      `📚 ${coaching.cross_insight.research_basis}`,
      '',
      `✅ ${coaching.cross_insight.actionable_advice}`,
    ].join('\n')

    // 일관성 보너스 반영한 건강 점수 조정
    const existingHealthData = todayRes.data.health_data || {}
    const baseHealthScore = existingHealthData.health_score || 0
    const adjustedHealthScore = Math.max(0, Math.min(100, baseHealthScore + (coaching.consistency_bonus || 0)))

    const existingFinanceData = todayRes.data.finance_data || {}

    const { error } = await supabase
      .from('daily_logs')
      .update({
        ai_coaching: `${healthText}\n\n---\n\n${financeText}`,
        cross_insight: crossText,
        health_data: {
          ...existingHealthData,
          health_score: adjustedHealthScore,
        },
        finance_data: {
          ...existingFinanceData,
          finance_score: coaching.finance_score,
          finance_score_breakdown: coaching.finance_score_breakdown,
        },
      })
      .eq('user_id', user.id)
      .eq('date', targetDate)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(coaching)
  } catch (error) {
    console.error('Coaching error:', error)
    return NextResponse.json({ error: '코칭 생성에 실패했습니다' }, { status: 500 })
  }
}
