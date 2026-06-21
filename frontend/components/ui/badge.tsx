import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
  {
    variants: {
      variant: {
        default: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
        secondary: 'bg-gray-100 text-gray-700 ring-gray-500/20',
        success: 'bg-green-50 text-green-700 ring-green-600/20',
        warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        destructive: 'bg-red-50 text-red-700 ring-red-600/20',
        teal: 'bg-teal-50 text-teal-700 ring-teal-600/20',
        outline: 'bg-white text-gray-700 ring-gray-300',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
