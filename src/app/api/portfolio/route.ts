import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase.from('portfolio').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { items } = await request.json()

  // 기존 포트폴리오 전체 삭제 후 새로 삽입
  await supabase.from('portfolio').delete().eq('user_id', user.id)

  const itemsWithUser = items.map((item: Record<string, unknown>) => ({ ...item, user_id: user.id }))
  const { data, error } = await supabase.from('portfolio').upsert(itemsWithUser, { onConflict: 'user_id,ticker' }).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ticker, ...updates } = await request.json()
  const { data, error } = await supabase
    .from('portfolio')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('ticker', ticker)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
