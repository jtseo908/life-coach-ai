import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const days = Number(searchParams.get('days') || '7')

  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - days)

  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .gte('date', fromDate.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
