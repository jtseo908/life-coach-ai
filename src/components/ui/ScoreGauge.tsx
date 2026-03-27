type Props = {
  score: number
  label: string
  color: string
}

export function ScoreGauge({ score, label, color }: Props) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[100px] h-[100px]">
        <svg width="100" height="100" className="-rotate-90">
          <circle cx="50" cy="50" r={radius} stroke="#374151" strokeWidth="8" fill="none" />
          <circle
            cx="50" cy="50" r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-2xl font-bold" style={{ color }}>{score}</div>
        </div>
      </div>
      <div className="mt-1 text-xs text-gray-400">{label}</div>
    </div>
  )
}
