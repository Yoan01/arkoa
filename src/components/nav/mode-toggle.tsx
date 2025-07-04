'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

const themes = [
  {
    key: 'system',
    icon: Monitor,
    label: 'System theme',
  },
  {
    key: 'light',
    icon: Sun,
    label: 'Light theme',
  },
  {
    key: 'dark',
    icon: Moon,
    label: 'Dark theme',
  },
]

export type ModeToggleProps = {
  className?: string
}

export const ModeToggle = ({ className }: ModeToggleProps) => {
  const { setTheme, theme } = useTheme()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div
      className={cn(
        'bg-background ring-border relative flex h-8 rounded-full p-1 ring-1',
        className
      )}
    >
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key

        return (
          <button
            type='button'
            key={key}
            className='relative h-6 w-6 rounded-full'
            onClick={() => setTheme(key as 'light' | 'dark' | 'system')}
            aria-label={label}
          >
            {isActive && (
              <div className='bg-secondary absolute inset-0 rounded-full' />
            )}
            <Icon
              className={cn(
                'relative m-auto h-4 w-4',
                isActive ? 'text-secondary-foreground' : 'text-muted-foreground'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
