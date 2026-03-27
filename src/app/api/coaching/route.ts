import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateCoaching } from '@/lib/claude'

export async function POST(request: Request) {
  const { date } = await request.json()
  const targetDate = date || new Date().toISOString().split('T')[0]

  const [settingsRes, todayRes, recentRes, portfolioRes] = await Promise.all([
    supabase.from('settings').select('*').single(),
    supabase.from('daily_logs').select('*').eq('date', targetDate).single(),
    supabase.from('daily_logs').select('*').order('date', { ascending: false }).limit(7),
    supabase.from('portfolio').select('*'),
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

    // daily_logs에 코칭 결과 + finance_score 저장
    const existingFinanceData = todayRes.data.finance_data || {}
    const { error } = await supabase
      .from('daily_logs')
      .update({
        ai_coaching: `${coaching.health_coaching}\n\n${coaching.finance_coaching}`,
        cross_insight: coaching.cross_insight,
        finance_data: { ...existingFinanceData, finance_score: coaching.finance_score },
      })
      .eq('date', targetDate)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(coaching)
  } catch (error) {
    console.error('Coaching error:', error)
    return NextResponse.json({ error: '코칭 생성에 실패했습니다' }, { status: 500 })
  }
}
