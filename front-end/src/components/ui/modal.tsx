import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

export function Modal({ children, ...props }: Dialog.DialogProps) {
  return <Dialog.Root {...props}>{children}</Dialog.Root>
}

export function ModalTrigger(props: Dialog.DialogTriggerProps) {
  return <Dialog.Trigger {...props} />
}

export function ModalContent({ className, ...props }: Dialog.DialogContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      <Dialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg',
          className,
        )}
        {...props}
      />
    </Dialog.Portal>
  )
}

export function ModalHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-2">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description ? <p className="text-sm text-slate-600">{description}</p> : null}
      </div>
      <Dialog.Close className="rounded-full p-1 hover:bg-slate-100">
        <X className="h-5 w-5" />
      </Dialog.Close>
    </div>
  )
}

