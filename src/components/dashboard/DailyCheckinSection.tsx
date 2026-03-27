'use client'

import { useState } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { ParsedCheckin, DailyLog } from '@/types'

type Props = {
  onCheckinComplete: () => void
  todayLog: DailyLog | null
}

const INTENSITY_LABELS = {
  high: '고강도',
  moderate: '중강도',
  low: '저강도',
  none: '없음',
} as const

const TYPE_LABELS = {
  aerobic: '유산소',
  anaerobic: '무산소',
  mixed: '복합',
  active_recovery: '능동적 회복',
  none: '없음',
} as const

export function DailyCheckinSection({ onCheckinComplete, todayLog }: Props) {
  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState<ParsedCheckin | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    for (const file of files) {
      const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif'

      if (isHeic) {
        alert('HEIC 형식은 지원하지 않습니다. 사진 앱에서 JPEG/PNG로 변환 후 업로드하거나, 모바일에서 직접 촬영해주세요.')
        continue
      }

      setImageFiles(prev => [...prev, file])

      const reader = new FileReader()
      reader.onload = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    }

    // input 초기화 (같은 파일 다시 선택 가능하게)
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  // 이미지를 리사이즈하여 base64로 변환 (API 10MB 제한 대응)
  const fileToBase64 = (file: File, maxWidth = 1024): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const scale = img.width > maxWidth ? maxWidth / img.width : 1
          canvas.width = img.width * scale
          canvas.height = img.height * scale
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          // JPEG 품질 0.7로 압축
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
          const base64 = dataUrl.split(',')[1]
          resolve(base64)
        }
        img.onerror = reject
        img.src = reader.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleParse = async () => {
    setIsLoading(true)
    try {
      // 첫 번째 이미지를 base64로 변환 (Claude Vision은 메시지당 여러 이미지 지원)
      let imageBase64: string | undefined
      let imageMediaType: string | undefined
      if (imageFiles.length > 0) {
        imageBase64 = await fileToBase64(imageFiles[0])
        imageMediaType = 'image/jpeg' // 리사이즈 후 항상 JPEG
      }

      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'checkin', input, imageBase64, imageMediaType }),
      })
      const data = await res.json()
      if (data.error || !data.health) {
        alert(data.error || '파싱 결과가 올바르지 않습니다. 다시 시도해주세요.')
        return
      }
      setParsed(data)
    } catch {
      alert('파싱에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!parsed) return
    setIsSaving(true)
    try {
      await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_input: input,
          health_data: parsed.health,
          finance_data: { trades: parsed.finance.trades, portfolio_snapshot: [], finance_score: 0 },
        }),
      })

      await fetch('/api/coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: new Date().toISOString().split('T')[0] }),
      })

      setParsed(null)
      setInput('')
      onCheckinComplete()
    } catch {
      alert('저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const breakdown = parsed?.health?.score_breakdown
  const exerciseDetail = parsed?.health?.exercise_detail
  const dietDetail = parsed?.health?.diet_detail

  return (
    <section className="rounded-xl bg-gray-900 p-4 space-y-3">
      <h2 className="text-lg font-bold text-white">오늘의 데일리 체크인</h2>
      <textarea
        className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white placeholder-gray-500 min-h-[80px]"
        placeholder="오늘 하루를 자유롭게 입력하세요... 예: 러닝 5km 40분, 닭가슴살 샐러드, 23시 취침 7시간 수면"
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      {/* 이미지 첨부 */}
      <div className="space-y-2">
        <label className="inline-flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          성분표/음식 사진 첨부
          <input type="file" accept="image/*,.heic,.heif" multiple onChange={handleImageChange} className="hidden" />
        </label>
        {imagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {imagePreviews.map((preview, i) => (
              <div key={i} className="relative group">
                <img src={preview} alt={`미리보기 ${i + 1}`} className="h-16 w-16 rounded-lg object-cover border border-gray-700" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {!parsed && (
        <button
          onClick={handleParse}
          disabled={!input.trim() || isLoading}
          className="w-full rounded-lg bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? 'AI 분석 중...' : 'AI로 분석하기'}
        </button>
      )}

      {isLoading && <LoadingSpinner />}

      {parsed && (
        <div className="space-y-3">
          {/* 건강 데이터 */}
          <div className="rounded-lg bg-gray-800 p-3 space-y-2">
            <div className="text-sm text-green-400 font-semibold">건강 분석</div>

            {/* 운동 */}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-300">운동: {parsed.health.exercise}</p>
                {exerciseDetail && exerciseDetail.type !== 'none' && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-green-900/50 text-green-400">
                    {TYPE_LABELS[exerciseDetail.type]} · {INTENSITY_LABELS[exerciseDetail.intensity]}
                  </span>
                )}
              </div>
              {exerciseDetail?.description && (
                <p className="text-xs text-gray-500 mt-0.5">{exerciseDetail.description}</p>
              )}
              {breakdown && (
                <p className="text-xs text-green-600 mt-0.5">{breakdown.exercise_score}/35점 — {breakdown.exercise_reasoning}</p>
              )}
            </div>

            {/* 식단 */}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-300">식단: {parsed.health.diet}</p>
                {dietDetail && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    dietDetail.protein_quality === 'high' ? 'bg-green-900/50 text-green-400' :
                    dietDetail.protein_quality === 'moderate' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    단백질 {dietDetail.protein_quality === 'high' ? '충분' : dietDetail.protein_quality === 'moderate' ? '보통' : '부족'}
                  </span>
                )}
              </div>
              {dietDetail?.description && (
                <p className="text-xs text-gray-500 mt-0.5">{dietDetail.description}</p>
              )}
              {breakdown && (
                <p className="text-xs text-green-600 mt-0.5">{breakdown.diet_score}/30점 — {breakdown.diet_reasoning}</p>
              )}
            </div>

            {/* 수면 */}
            <div>
              <p className="text-sm text-gray-300">수면: {parsed.health.sleep}</p>
              {parsed.health.sleep_detail && (
                <div className="mt-1 pl-2 border-l-2 border-gray-700 space-y-0.5">
                  {parsed.health.sleep_detail.bedtime && (
                    <p className="text-xs text-gray-400">취침 {parsed.health.sleep_detail.bedtime} → 기상 {parsed.health.sleep_detail.wakeup}</p>
                  )}
                  {parsed.health.sleep_detail.interruptions > 0 && (
                    <p className="text-xs text-yellow-400">중간 기상 {parsed.health.sleep_detail.interruptions}회</p>
                  )}
                  <p className="text-xs text-gray-400">{parsed.health.sleep_detail.impact}</p>
                </div>
              )}
              {breakdown && (
                <p className="text-xs text-green-600 mt-0.5">{breakdown.sleep_score}/25점 — {breakdown.sleep_reasoning}</p>
              )}
            </div>

            {/* 총점 */}
            <div className="pt-1 border-t border-gray-700">
              <p className="text-sm font-semibold text-green-400">건강 점수: {parsed.health.health_score}/90점</p>
              <p className="text-xs text-gray-500">일관성 보너스(±10)는 코칭 생성 시 반영됩니다</p>
            </div>

            {/* 영양 분석 (이미지 첨부 시) */}
            {parsed.health.nutrition_analysis && (
              <div className="pt-2 border-t border-gray-700">
                <div className="text-xs font-semibold text-orange-400 mb-1">영양 분석 (이미지 기반)</div>
                <div className="flex flex-wrap gap-2 mb-1">
                  {parsed.health.nutrition_analysis.estimated_calories && (
                    <span className="text-xs px-2 py-0.5 rounded bg-orange-900/30 text-orange-300">
                      {parsed.health.nutrition_analysis.estimated_calories} kcal
                    </span>
                  )}
                  {parsed.health.nutrition_analysis.protein_grams && (
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-900/30 text-blue-300">
                      단백질 {parsed.health.nutrition_analysis.protein_grams}g
                    </span>
                  )}
                  {parsed.health.nutrition_analysis.carbs_grams && (
                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-900/30 text-yellow-300">
                      탄수화물 {parsed.health.nutrition_analysis.carbs_grams}g
                    </span>
                  )}
                  {parsed.health.nutrition_analysis.fat_grams && (
                    <span className="text-xs px-2 py-0.5 rounded bg-red-900/30 text-red-300">
                      지방 {parsed.health.nutrition_analysis.fat_grams}g
                    </span>
                  )}
                </div>
                {parsed.health.nutrition_analysis.detected_foods?.length > 0 && (
                  <p className="text-xs text-gray-400">감지된 식품: {parsed.health.nutrition_analysis.detected_foods.join(', ')}</p>
                )}
                <p className="text-xs text-gray-500 mt-0.5">{parsed.health.nutrition_analysis.analysis}</p>
              </div>
            )}
          </div>

          {/* 투자 데이터 */}
          {parsed.finance.trades.length > 0 && (
            <div className="rounded-lg bg-gray-800 p-3">
              <div className="text-sm text-blue-400 font-semibold mb-1">투자</div>
              {parsed.finance.trades.map((t, i) => (
                <p key={i} className="text-sm text-gray-300">
                  {t.name} {t.quantity}주 {t.action === 'buy' ? '매수' : '매도'}
                </p>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setParsed(null)}
              className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
            >
              다시 분석
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isSaving ? 'AI 코칭 생성 중... (30초~1분 소요)' : '확인하고 저장하기'}
            </button>
          </div>
        </div>
      )}

      {/* 오늘 이미 입력된 데이터 표시 */}
      {!parsed && todayLog && (
        <div className="rounded-lg bg-gray-800/50 border border-gray-700/50 p-3 space-y-1">
          <div className="text-xs font-semibold text-gray-400">오늘 입력된 기록</div>
          {todayLog.health_data?.exercise && todayLog.health_data.exercise !== '없음' && (
            <p className="text-xs text-gray-500">운동: {todayLog.health_data.exercise}</p>
          )}
          {todayLog.health_data?.diet && todayLog.health_data.diet !== '없음' && (
            <p className="text-xs text-gray-500">식단: {todayLog.health_data.diet}</p>
          )}
          {todayLog.health_data?.sleep && todayLog.health_data.sleep !== '없음' && (
            <p className="text-xs text-gray-500">수면: {todayLog.health_data.sleep}</p>
          )}
          <p className="text-xs text-gray-600">추가 입력하면 기존 데이터와 자동으로 병합됩니다</p>
        </div>
      )}
    </section>
  )
}
