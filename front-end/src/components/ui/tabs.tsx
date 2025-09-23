import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/utils/cn'

export const Tabs = TabsPrimitive.Root
export const TabsList = ({ className, ...props }: TabsPrimitive.TabsListProps) => (
  <TabsPrimitive.List
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-2xl bg-slate-100 p-1 text-slate-600',
      className,
    )}
    {...props}
  />
)
export const TabsTrigger = ({ className, ...props }: TabsPrimitive.TabsTriggerProps) => (
  <TabsPrimitive.Trigger
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow',
      className,
    )}
    {...props}
  />
)
export const TabsContent = ({ className, ...props }: TabsPrimitive.TabsContentProps) => (
  <TabsPrimitive.Content className={cn('mt-4', className)} {...props} />
)

