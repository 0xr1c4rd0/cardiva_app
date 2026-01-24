'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedNumberProps {
  value: number
  duration?: number
  className?: string
  formatOptions?: Intl.NumberFormatOptions
}

/**
 * AnimatedNumber - Smoothly animates between number values
 *
 * Uses requestAnimationFrame for smooth interpolation with easeOutCubic easing.
 * Automatically detects value changes and animates from previous to new value.
 */
export function AnimatedNumber({
  value,
  duration = 400,
  className,
  formatOptions,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const previousValueRef = useRef(value)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const previousValue = previousValueRef.current

    // Skip animation if this is the initial render or value hasn't changed
    if (previousValue === value) {
      return
    }

    // Cancel any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    const startTime = performance.now()
    const startValue = displayValue

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(1, elapsed / duration)

      // Ease out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3)

      const newValue = startValue + (value - startValue) * eased
      setDisplayValue(newValue)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
        previousValueRef.current = value
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [value, duration])

  // Update ref when value changes (for next animation)
  useEffect(() => {
    previousValueRef.current = value
  }, [value])

  // Format the display value
  const formattedValue = new Intl.NumberFormat('pt-PT', formatOptions).format(
    Math.round(displayValue)
  )

  return (
    <span className={cn("tabular-nums", className)}>
      {formattedValue}
    </span>
  )
}
