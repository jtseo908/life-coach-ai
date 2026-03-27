'use client'

type Props = {
  healthGoal: string
  financeGoal: string
  onHealthGoalChange: (value: string) => void
  onFinanceGoalChange: (value: string) => void
}

export function GoalSettingSection({ healthGoal, financeGoal, onHealthGoalChange, onFinanceGoalChange }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white">당신의 목표를 알려주세요</h2>
          <p className="mt-1 text-xs text-gray-500">건강과 재무, 두 가지 목표를 설정하면 AI가 맞춤 코칭을 제공합니다.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-green-400">건강 목표</label>
            <input
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-600 backdrop-blur-sm transition-colors focus:border-green-500/30 focus:outline-none"
              placeholder="예: 대한민국 상위 10% 체력 만들기"
              value={healthGoal}
              onChange={e => onHealthGoalChange(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-blue-400">재무 목표</label>
            <input
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-600 backdrop-blur-sm transition-colors focus:border-blue-500/30 focus:outline-none"
              placeholder="예: 100억 부자 되기"
              value={financeGoal}
              onChange={e => onFinanceGoalChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
