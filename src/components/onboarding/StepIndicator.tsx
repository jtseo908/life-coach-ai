type StepConfig = {
  label: string
  color: string
  glowColor: string
}

type Props = {
  currentStep: number
  steps: StepConfig[]
}

export default function StepIndicator({ currentStep, steps }: Props) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, i) => {
        const isDone = i < currentStep
        const isActive = i === currentStep
        const isPending = i > currentStep

        return (
          <div key={step.label} className="flex items-center">
            {/* 스텝 원 + 라벨 */}
            <div className="flex items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ${
                  isDone
                    ? 'bg-green-500 text-white shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                    : isActive
                      ? `border-2 text-white`
                      : 'border border-white/10 bg-white/[0.05] text-gray-600'
                }`}
                style={
                  isActive
                    ? {
                        borderColor: step.color,
                        backgroundColor: `${step.color}20`,
                        boxShadow: `0 0 12px ${step.glowColor}`,
                      }
                    : undefined
                }
              >
                {isDone ? '✓' : i + 1}
              </div>
              <span
                className={`ml-1.5 text-[11px] font-medium transition-colors duration-300 ${
                  isDone
                    ? 'text-green-400'
                    : isActive
                      ? 'font-semibold text-white'
                      : 'text-gray-600'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* 연결선 */}
            {i < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-10 rounded-full transition-colors duration-500 ${
                  isDone ? 'bg-green-500' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
