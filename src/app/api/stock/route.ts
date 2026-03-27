import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

async function fetchPrice(ticker: string): Promise<number | null> {
  const yahooTicker = ticker

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTicker}?interval=1d&range=1d`,
      { next: { revalidate: 300 } }
    )
    const data = await res.json()
    const price = data.chart?.result?.[0]?.meta?.regularMarketPrice
    return price ?? null
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get('ticker')

  if (!ticker) {
    return NextResponse.json({ error: 'ticker가 필요합니다' }, { status: 400 })
  }

  const price = await fetchPrice(ticker)
  return NextResponse.json({ ticker, price })
}

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: portfolio } = await supabase.from('portfolio').select('*').eq('user_id', user.id)
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
        .eq('user_id', user.id)
        .eq('ticker', item.ticker)

      return { ticker: item.ticker, price }
    })
  )

  const updated = results.filter(Boolean)
  return NextResponse.json({ updated: updated.length, prices: updated })
}
