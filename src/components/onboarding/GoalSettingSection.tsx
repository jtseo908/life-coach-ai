'use client'

type Props = {
  healthGoal: string
  financeGoal: string
  onHealthGoalChange: (value: string) => void
  onFinanceGoalChange: (value: string) => void
}

export function GoalSettingSection({ healthGoal, financeGoal, onHealthGoalChange, onFinanceGoalChange }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">목표 설정</h2>
      <div>
        <label className="block text-sm text-gray-400 mb-1">건강 목표</label>
        <input
          className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white placeholder-gray-500"
          placeholder="예: 대한민국 상위 10% 체력 만들기"
          value={healthGoal}
          onChange={e => onHealthGoalChange(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">재무 목표</label>
        <input
          className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white placeholder-gray-500"
          placeholder="예: 100억 부자 되기"
          value={financeGoal}
          onChange={e => onFinanceGoalChange(e.target.value)}
        />
      </div>
    </div>
  )
}
