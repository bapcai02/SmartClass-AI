import { cn } from '@/utils/cn'

export function MetricChip({
  label,
  value,
  color = 'slate',
  className,
}: {
  label: string
  value: string | number
  color?: 'slate' | 'blue' | 'green' | 'amber' | 'red'
  className?: string
}) {
  const dot: Record<string, string> = {
    slate: 'bg-slate-400',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  }
  return (
    <div className={cn('rounded-2xl border bg-white p-4 shadow-sm', className)}>
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <span className={cn('h-2 w-2 rounded-full', dot[color])} /> {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  )}

