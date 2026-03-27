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

    const existingFinanceData = todayRes.data.finance_data || {}
    const { error } = await supabase
      .from('daily_logs')
      .update({
        ai_coaching: `${coaching.health_coaching}\n\n${coaching.finance_coaching}`,
        cross_insight: coaching.cross_insight,
        finance_data: { ...existingFinanceData, finance_score: coaching.finance_score },
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
