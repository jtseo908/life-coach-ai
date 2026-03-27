import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '건강-재무 코치 | AI 통합 대시보드',
  description: '체력 증진과 자산 증식을 AI 코치와 함께',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-gray-950 text-white antialiased">{children}</body>
    </html>
  )
}
