import { NextResponse } from 'next/server'
import { parseCheckin, parsePortfolio } from '@/lib/claude'

export async function POST(request: Request) {
  try {
    const { type, input } = await request.json()

    if (!input || !type) {
      return NextResponse.json({ error: 'type과 input이 필요합니다' }, { status: 400 })
    }

    const result = type === 'portfolio'
      ? await parsePortfolio(input)
      : await parseCheckin(input)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Parse error:', error)
    return NextResponse.json({ error: '파싱에 실패했습니다' }, { status: 500 })
  }
}
