type Props = {
  label: string
  color: 'health' | 'wealth' | 'ai' | 'warning' | 'danger'
}

const colorStyles = {
  health: 'bg-green-500/[0.08] border-green-500/[0.15] text-green-400',
  wealth: 'bg-blue-500/[0.08] border-blue-500/[0.15] text-blue-400',
  ai: 'bg-violet-400/[0.08] border-violet-400/[0.15] text-violet-400',
  warning: 'bg-yellow-400/[0.08] border-yellow-400/[0.15] text-yellow-400',
  danger: 'bg-red-400/[0.08] border-red-400/[0.15] text-red-400',
}

export default function StatusPill({ label, color }: Props) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-1 text-[10px] font-medium backdrop-blur-sm ${colorStyles[color]}`}
    >
      {label}
    </span>
  )
}
