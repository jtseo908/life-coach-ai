import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VPULSE | 체력 × 자산, 매일 짚는 삶의 맥박',
  description: '몸이 바뀌면, 수익률도 바뀝니다. AI가 매일 당신의 체력과 자산을 진단합니다.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-[#050510] text-white antialiased">{children}</body>
    </html>
  )
}
