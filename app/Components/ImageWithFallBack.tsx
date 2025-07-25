// components/ImageWithFallback.tsx
'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useState } from 'react'

type ImageWithFallbackProps = {
  src: string | null
  alt: string
  fallback?: React.ReactNode
  className?: string
} & React.ComponentProps<typeof Image>

export default function ImageWithFallback({
  src,
  alt,
  fallback,
  className,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className={cn(
        'bg-gray-100 flex items-center justify-center',
        className
      )}>
        <span className="text-xs text-gray-500">No image</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  )
}