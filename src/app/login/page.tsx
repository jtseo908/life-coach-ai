'use client'

import { createClient } from '@/lib/supabase'
import SoftAurora from '@/components/ui/SoftAurora'
import ShinyText from '@/components/ui/ShinyText'

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error('Google login error:', error)
      alert(`로그인 실패: ${error.message}`)
    }
  }

  return (
    <SoftAurora>
      <main className="flex min-h-screen items-center justify-center">
        {/* 모바일: 중앙 정렬 / 데스크톱: 2분할 */}
        <div className="flex w-full max-w-5xl items-center justify-center px-4 lg:justify-between lg:gap-16 lg:px-12">

          {/* 좌측: 대시보드 프리뷰 (데스크톱만) */}
          <div className="hidden flex-1 flex-col items-center lg:flex">
            {/* 3D 틸트 대시보드 미리보기 카드 */}
            <div
              className="w-full max-w-[280px] rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl"
              style={{ transform: 'perspective(800px) rotateY(-5deg) rotateX(3deg)' }}
            >
              <div className="mb-1 text-center text-[10px] tracking-[2px] text-gray-500">
                TODAY&apos;S VPULSE
              </div>
              <div
                className="text-center text-5xl font-black"
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                78.5
              </div>
              <div className="mt-3 flex items-center justify-center gap-5">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                  <span className="text-xs text-gray-400">체력 <span className="font-semibold text-gray-200">82</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
                  <span className="text-xs text-gray-400">자산 <span className="font-semibold text-gray-200">75</span></span>
                </div>
              </div>
              {/* 미니 차트 */}
              <svg viewBox="0 0 200 36" className="mt-4 w-full">
                <defs>
                  <linearGradient id="loginGreenFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="loginBlueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,28 30,23 60,18 90,26 120,13 150,10 180,6 200,4 200,36 0,36Z" fill="url(#loginGreenFill)" />
                <polyline points="0,28 30,23 60,18 90,26 120,13 150,10 180,6 200,4" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.6" />
                <path d="M0,33 30,28 60,30 90,20 120,18 150,16 180,13 200,10 200,36 0,36Z" fill="url(#loginBlueFill)" />
                <polyline points="0,33 30,28 60,30 90,20 120,18 150,16 180,13 200,10" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.6" />
              </svg>
            </div>
            <p className="mt-6 text-center text-sm text-gray-500">
              몸이 바뀌면, 수익률도 바뀝니다.
            </p>
          </div>

          {/* 우측 (모바일: 전체) — 로그인 폼 */}
          <div className="flex w-full max-w-sm flex-col items-center text-center lg:flex-1">
            {/* 로고 */}
            <h1 className="text-5xl font-black tracking-wide">
              <span
                className="inline-block"
                style={{
                  background: 'linear-gradient(180deg, #22c55e, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 24px rgba(34,197,94,0.3))',
                }}
              >
                V
              </span>
              <ShinyText className="text-gray-100">PULSE</ShinyText>
            </h1>

            {/* 태그라인 */}
            <p className="mt-3 text-[15px] leading-relaxed text-gray-400">
              체력 × 자산, 매일 짚는 삶의 맥박
            </p>

            {/* 훅 카피 (모바일만 표시) */}
            <p className="mt-8 max-w-[280px] text-sm leading-relaxed text-gray-500 lg:hidden">
              몸이 바뀌면, 수익률도 바뀝니다.<br />
              <span className="text-gray-600">AI가 매일 당신의 체력과 자산을 진단합니다.</span>
            </p>

            {/* Google 로그인 버튼 */}
            <button
              onClick={handleGoogleLogin}
              className="mt-10 flex w-full max-w-[300px] items-center justify-center gap-2.5 rounded-xl bg-white/95 px-6 py-3.5 text-[15px] font-semibold text-gray-900 shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all hover:bg-white hover:shadow-[0_4px_32px_rgba(0,0,0,0.4)]"
            >
              <svg className="h-[18px] w-[18px]" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" />
              </svg>
              Google로 시작하기
            </button>

            {/* 신뢰 문구 */}
            <p className="mt-6 text-[11px] text-gray-700">
              🔒 데이터는 안전하게 암호화됩니다
            </p>
          </div>
        </div>
      </main>
    </SoftAurora>
  )
}
