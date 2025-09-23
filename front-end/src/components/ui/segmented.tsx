import { cn } from '@/utils/cn'

type Option = { label: string; value: string }

export function Segmented({
  options,
  value,
  onChange,
  className,
}: {
  options: Option[]
  value: string
  onChange: (val: string) => void
  className?: string
}) {
  return (
    <div className={cn('inline-flex rounded-2xl bg-slate-100 p-1 text-sm', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-xl px-3 py-1.5 transition-colors',
            value === o.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-white/60',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

