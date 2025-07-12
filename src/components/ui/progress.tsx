'use client'

import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as React from 'react'

import { cn } from '@/lib/utils'

type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root> & {
  variant?: 'default' | 'orange'
}

function Progress({
  className,
  value,
  variant = 'default',
  ...props
}: ProgressProps) {
  const indicatorColor = {
    default: 'bg-primary',
    orange: 'bg-orange-400',
  }[variant]

  const trackColor = {
    default: 'bg-primary/20',
    orange: 'bg-orange-200',
  }[variant]

  return (
    <ProgressPrimitive.Root
      data-slot='progress'
      className={cn(
        trackColor,
        'relative h-2 w-full overflow-hidden rounded-full',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot='progress-indicator'
        className={cn(indicatorColor, 'h-full w-full flex-1 transition-all')}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
