import { NextResponse } from 'next/server'
import { parseCheckin, parsePortfolio } from '@/lib/claude'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { type, input, imageBase64, imageMediaType } = await request.json()

    if (!input || !type) {
      return NextResponse.json({ error: 'type과 input이 필요합니다' }, { status: 400 })
    }

    if (type === 'portfolio') {
      const result = await parsePortfolio(input)
      return NextResponse.json(result)
    }

    // 체크인 파싱: 신체 정보 + 기존 오늘 데이터 조회
    let bodyProfile: Record<string, unknown> | undefined
    let existingData: Record<string, unknown> | undefined

    try {
      const supabase = await createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // 신체 정보 조회
        const { data: settings } = await supabase.from('settings').select('*').eq('user_id', user.id).single()
        if (settings?.weight || settings?.bmr) {
          bodyProfile = {
            gender: settings.gender,
            age: settings.age,
            height: settings.height,
            weight: settings.weight,
            skeletal_muscle_mass: settings.skeletal_muscle_mass,
            body_fat_pct: settings.body_fat_pct,
            bmr: settings.bmr,
            activity_level: settings.activity_level,
            weight_control: settings.weight_control,
            fat_control: settings.fat_control,
            muscle_control: settings.muscle_control,
          }
        }

        // 오늘 기존 데이터 조회 (누적 병합용)
        const today = new Date().toISOString().split('T')[0]
        const { data: todayLog } = await supabase
          .from('daily_logs')
          .select('health_data, finance_data')
          .eq('user_id', user.id)
          .eq('date', today)
          .single()

        if (todayLog) {
          existingData = {
            health_data: todayLog.health_data,
            finance_data: todayLog.finance_data,
          }
        }
      }
    } catch {
      // 조회 실패해도 파싱은 진행
    }

    const result = await parseCheckin(input, {
      imageBase64,
      imageMediaType,
      bodyProfile,
      existingData,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Parse error:', error)
    return NextResponse.json({ error: '파싱에 실패했습니다' }, { status: 500 })
  }
}
