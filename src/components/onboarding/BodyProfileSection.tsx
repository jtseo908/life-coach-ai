'use client'

import { useState } from 'react'

type BodyProfile = {
  gender?: string
  age?: number
  height?: number
  weight?: number
  skeletal_muscle_mass?: number
  body_fat_mass?: number
  body_fat_pct?: number
  bmi?: number
  bmr?: number
  weight_control?: number
  fat_control?: number
  muscle_control?: number
  activity_level?: string
}

type Props = {
  onSave: (profile: BodyProfile) => void
  onSkip: () => void
}

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: '거의 움직이지 않음 (사무직)' },
  { value: 'light', label: '가벼운 활동 (주 1-2회 운동)' },
  { value: 'moderate', label: '보통 활동 (주 3-4회 운동)' },
  { value: 'active', label: '활발한 활동 (주 5-6회 운동)' },
  { value: 'very_active', label: '매우 활발 (매일 고강도 운동)' },
] as const

export function BodyProfileSection({ onSave, onSkip }: Props) {
  const [profile, setProfile] = useState<BodyProfile>({})
  const [showAdvanced, setShowAdvanced] = useState(false)

  const update = (field: keyof BodyProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value || undefined }))
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">신체 정보 (선택)</h2>
        <p className="text-sm text-gray-400 mt-1">더 정확한 영양/운동 코칭을 위해 입력해주세요. 나중에 수정할 수 있습니다.</p>
      </div>

      {/* 기본 정보 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">성별</label>
          <select
            className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white text-sm"
            value={profile.gender || ''}
            onChange={e => update('gender', e.target.value)}
          >
            <option value="">선택</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">나이</label>
          <input
            type="number"
            className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white text-sm"
            placeholder="30"
            value={profile.age || ''}
            onChange={e => update('age', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">키 (cm)</label>
          <input
            type="number"
            className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white text-sm"
            placeholder="170"
            value={profile.height || ''}
            onChange={e => update('height', Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">체중 (kg)</label>
          <input
            type="number"
            className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white text-sm"
            placeholder="70"
            value={profile.weight || ''}
            onChange={e => update('weight', Number(e.target.value))}
          />
        </div>
      </div>

      {/* 활동 수준 */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">활동 수준</label>
        <select
          className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white text-sm"
          value={profile.activity_level || ''}
          onChange={e => update('activity_level', e.target.value)}
        >
          <option value="">선택</option>
          {ACTIVITY_LEVELS.map(l => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* 인바디 상세 (토글) */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs text-purple-400 hover:text-purple-300"
      >
        {showAdvanced ? '▲ 인바디 상세 정보 접기' : '▼ 인바디 결과 있으면 입력하기 (선택)'}
      </button>

      {showAdvanced && (
        <div className="space-y-3 rounded-lg bg-gray-800/50 p-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">골격근량 (kg)</label>
              <input
                type="number"
                step="0.1"
                className="w-full rounded-lg bg-gray-700 px-3 py-2 text-white text-sm"
                placeholder="28.5"
                value={profile.skeletal_muscle_mass || ''}
                onChange={e => update('skeletal_muscle_mass', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">체지방량 (kg)</label>
              <input
                type="number"
                step="0.1"
                className="w-full rounded-lg bg-gray-700 px-3 py-2 text-white text-sm"
                placeholder="15.0"
                value={profile.body_fat_mass || ''}
                onChange={e => update('body_fat_mass', Number(e.target.value))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">체지방률 (%)</label>
              <input
                type="number"
                step="0.1"
                className="w-full rounded-lg bg-gray-700 px-3 py-2 text-white text-sm"
                placeholder="20.5"
                value={profile.body_fat_pct || ''}
                onChange={e => update('body_fat_pct', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">BMI</label>
              <input
                type="number"
                step="0.1"
                className="w-full rounded-lg bg-gray-700 px-3 py-2 text-white text-sm"
                placeholder="24.0"
                value={profile.bmi || ''}
                onChange={e => update('bmi', Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">기초대사량 (kcal)</label>
            <input
              type="number"
              className="w-full rounded-lg bg-gray-700 px-3 py-2 text-white text-sm"
              placeholder="1500"
              value={profile.bmr || ''}
              onChange={e => update('bmr', Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">체중조절 (kg)</label>
              <input
                type="number"
                step="0.1"
                className="w-full rounded-lg bg-gray-700 px-3 py-2 text-white text-sm"
                placeholder="-5.0"
                value={profile.weight_control || ''}
                onChange={e => update('weight_control', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">지방조절 (kg)</label>
              <input
                type="number"
                step="0.1"
                className="w-full rounded-lg bg-gray-700 px-3 py-2 text-white text-sm"
                placeholder="-7.0"
                value={profile.fat_control || ''}
                onChange={e => update('fat_control', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">근육조절 (kg)</label>
              <input
                type="number"
                step="0.1"
                className="w-full rounded-lg bg-gray-700 px-3 py-2 text-white text-sm"
                placeholder="+2.0"
                value={profile.muscle_control || ''}
                onChange={e => update('muscle_control', Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onSave(profile)}
          className="flex-1 rounded-lg bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-700"
        >
          저장
        </button>
        <button
          onClick={onSkip}
          className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-400 hover:text-white"
        >
          건너뛰기
        </button>
      </div>
    </div>
  )
}
