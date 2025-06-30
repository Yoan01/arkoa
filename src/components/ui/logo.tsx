import Image from 'next/image'

import { cn } from '@/lib/utils'

import Brand from './brand'

interface Props {
  className?: string
  logoUrl?: string
}

export const Logo = ({ className = 'size-14', logoUrl }: Props) => {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt='Organization Logo'
        className={cn(className, 'rounded-sm object-contain')}
      />
    )
  }

  return <Brand className='size-3' />
}
