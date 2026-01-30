import { useState, useCallback, useEffect, useRef } from 'react'

export interface UseColumnResizeOptions {
  storageKey: string
  defaultWidths: Record<string, number>
  minWidth?: number
  maxWidth?: number
}

export interface UseColumnResizeReturn {
  columnWidths: Record<string, number>
  getResizeHandler: (columnId: string) => (e: React.MouseEvent | React.TouchEvent) => void
  isResizingColumn: string | null
}

/**
 * Custom hook for column resizing with mouse/touch support and localStorage persistence
 */
export function useColumnResize({
  storageKey,
  defaultWidths,
  minWidth = 80,
  maxWidth = 600,
}: UseColumnResizeOptions): UseColumnResizeReturn {
  // Load initial widths from localStorage or use defaults
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // Merge with defaults to handle new columns
          return { ...defaultWidths, ...parsed }
        } catch {
          return defaultWidths
        }
      }
    }
    return defaultWidths
  })

  const [isResizingColumn, setIsResizingColumn] = useState<string | null>(null)
  const resizeStartX = useRef<number>(0)
  const resizeStartWidth = useRef<number>(0)
  const currentColumnId = useRef<string>('')

  // Persist to localStorage whenever widths change
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(columnWidths).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(columnWidths))
    }
  }, [columnWidths, storageKey])

  // Handle mouse/touch move during resize
  const handleMove = useCallback(
    (clientX: number) => {
      if (!currentColumnId.current) return

      const delta = clientX - resizeStartX.current
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, resizeStartWidth.current + delta)
      )

      setColumnWidths((prev) => ({
        ...prev,
        [currentColumnId.current]: newWidth,
      }))
    },
    [minWidth, maxWidth]
  )

  // Handle mouse/touch end to stop resizing
  const handleEnd = useCallback(() => {
    setIsResizingColumn(null)
    currentColumnId.current = ''
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  // Cleanup event listeners on unmount
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingColumn) {
        e.preventDefault()
        handleMove(e.clientX)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isResizingColumn && e.touches.length > 0) {
        e.preventDefault()
        handleMove(e.touches[0].clientX)
      }
    }

    const handleMouseUp = () => {
      if (isResizingColumn) {
        handleEnd()
      }
    }

    const handleTouchEnd = () => {
      if (isResizingColumn) {
        handleEnd()
      }
    }

    if (isResizingColumn) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isResizingColumn, handleMove, handleEnd])

  // Get resize handler for a specific column
  const getResizeHandler = useCallback(
    (columnId: string) => (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX

      currentColumnId.current = columnId
      resizeStartX.current = clientX
      resizeStartWidth.current = columnWidths[columnId] || defaultWidths[columnId] || 150
      setIsResizingColumn(columnId)

      // Prevent text selection during drag
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [columnWidths, defaultWidths]
  )

  return {
    columnWidths,
    getResizeHandler,
    isResizingColumn,
  }
}
