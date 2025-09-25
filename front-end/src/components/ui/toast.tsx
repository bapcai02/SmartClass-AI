import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type Toast = {
  id: number
  title: string
  description?: string
  variant?: 'default' | 'success' | 'error'
}

type ToastContextType = {
  addToast: (t: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, ...t }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
    }, 4000)
  }, [])
  const value = useMemo(() => ({ addToast }), [addToast])
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastViewport({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed right-4 top-16 z-50 grid gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`min-w-[260px] rounded-xl border px-4 py-3 shadow-sm ${
            t.variant === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : t.variant === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-slate-200 bg-white text-slate-900'
          }`}
        >
          <div className="text-sm font-medium">{t.title}</div>
          {t.description ? (
            <div className="text-xs opacity-80">{t.description}</div>
          ) : null}
        </div>
      ))}
    </div>
  )
}


