import { Separator } from '@/components/ui/separator'

interface OrSeparatorProps {
  text?: string
  className?: string
}

export function OrSeparator({ text = 'OU', className = '' }: OrSeparatorProps) {
  return (
    <div className={`relative ${className}`}>
      <div className='absolute inset-0 flex items-center'>
        <Separator className='w-full' />
      </div>
      <div className='relative flex justify-center text-xs uppercase'>
        <span className='bg-background text-muted-foreground px-2'>{text}</span>
      </div>
    </div>
  )
}
