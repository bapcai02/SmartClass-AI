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
          'bg-brand-blue text-white hover:bg-blue-600 shadow-sm',
        outline:
          'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50',
        ghost:
          'bg-transparent hover:bg-slate-100 text-slate-900',
        success:
          'bg-brand-green text-white hover:bg-green-600',
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

