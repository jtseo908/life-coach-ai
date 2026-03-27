import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase.from('settings').select('*').single()
  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data ?? { exists: false })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { data: existing } = await supabase.from('settings').select('id').single()

  if (existing) {
    const { data, error } = await supabase
      .from('settings')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data, error } = await supabase.from('settings').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
