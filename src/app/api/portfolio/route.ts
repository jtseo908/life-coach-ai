import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase.from('portfolio').select('*').order('updated_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const { items } = await request.json()

  // 기존 포트폴리오 전체 삭제 후 새로 삽입 (온보딩 시)
  await supabase.from('portfolio').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const { data, error } = await supabase.from('portfolio').upsert(items, { onConflict: 'ticker' }).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const { ticker, ...updates } = await request.json()
  const { data, error } = await supabase
    .from('portfolio')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('ticker', ticker)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
