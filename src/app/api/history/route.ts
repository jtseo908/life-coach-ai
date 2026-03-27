import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const days = Number(searchParams.get('days') || '7')

  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - days)

  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', fromDate.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
