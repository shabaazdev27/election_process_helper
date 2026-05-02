/**
 * Image Optimization Component for ElectionGuide
 * Provides Next.js Image component wrapper with automatic optimization
 */

import Image from 'next/image'
import { CSSProperties } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  style?: CSSProperties
  sizes?: string
  quality?: number
}

/**
 * Optimized Image Component
 * Automatically optimizes images for Lighthouse performance:
 * - Lazy loading (except priority images)
 * - Responsive sizing
 * - WebP format support
 * - Automatic srcset generation
 *
 * @param props - Image properties
 * @returns Optimized Next.js Image component
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 800,
  height = 600,
  priority = false,
  className = '',
  style,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 80, // Slightly reduced for better LCP
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      style={style}
      sizes={sizes}
      quality={quality}
      loading={priority ? 'eager' : 'lazy'}
      placeholder="blur" // Blur placeholder for better perceived performance
      blurDataURL="data:image/svg+xml;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mN8//8/w38GIAXDIBKE0zhJAARVAAuqjIqsAAAAAElFTkSuQmCC"
    />
  )
}

export default OptimizedImage
