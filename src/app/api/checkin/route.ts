import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('daily_logs')
    .upsert(
      { ...body, date: body.date || new Date().toISOString().split('T')[0] },
      { onConflict: 'date' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
