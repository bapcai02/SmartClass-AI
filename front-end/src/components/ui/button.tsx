import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue disabled:opacity-50 disabled:pointer-events-none gap-2 shadow-sm hover:shadow',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-brand-blue to-blue-600 text-white shadow-sm hover:brightness-105',
        outline:
          'border border-slate-300/70 bg-white/70 backdrop-blur text-slate-900 hover:bg-white',
        ghost:
          'bg-transparent hover:bg-slate-100/80 text-slate-900',
        success:
          'bg-gradient-to-r from-brand-green to-emerald-600 text-white hover:brightness-105',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { buttonVariants }

