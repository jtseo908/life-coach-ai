import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

async function fetchPrice(ticker: string): Promise<number | null> {
  // DB에 이미 Yahoo Finance 티커 형식으로 저장됨 (005930.KS, TSLA 등)
  const yahooTicker = ticker

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTicker}?interval=1d&range=1d`,
      { next: { revalidate: 300 } } // 5분 캐시
    )
    const data = await res.json()
    const price = data.chart?.result?.[0]?.meta?.regularMarketPrice
    return price ?? null
  } catch {
    return null
  }
}

// GET: 단일 종목 조회
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get('ticker')

  if (!ticker) {
    return NextResponse.json({ error: 'ticker가 필요합니다' }, { status: 400 })
  }

  const price = await fetchPrice(ticker)
  return NextResponse.json({ ticker, price })
}

// POST: 전체 포트폴리오 시세 갱신
export async function POST() {
  const { data: portfolio } = await supabase.from('portfolio').select('*')
  if (!portfolio?.length) {
    return NextResponse.json({ updated: 0 })
  }

  const results = await Promise.all(
    portfolio.map(async (item) => {
      const price = await fetchPrice(item.ticker)
      if (price === null) return null

      await supabase
        .from('portfolio')
        .update({ current_price: price, updated_at: new Date().toISOString() })
        .eq('ticker', item.ticker)

      return { ticker: item.ticker, price }
    })
  )

  const updated = results.filter(Boolean)
  return NextResponse.json({ updated: updated.length, prices: updated })
}
