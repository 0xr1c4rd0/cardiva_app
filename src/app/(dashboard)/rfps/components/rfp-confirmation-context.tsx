'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface RFPConfirmationContextValue {
  isConfirmed: boolean
  setIsConfirmed: (value: boolean) => void
  refreshItems: () => void
}

const RFPConfirmationContext = createContext<RFPConfirmationContextValue | null>(null)

interface RFPConfirmationProviderProps {
  children: ReactNode
  initialIsConfirmed: boolean
}

/**
 * Context provider for RFP confirmation state.
 * Allows components across the page to share and update confirmation status
 * without prop drilling, and provides a method to refresh items after changes.
 */
export function RFPConfirmationProvider({
  children,
  initialIsConfirmed,
}: RFPConfirmationProviderProps) {
  const router = useRouter()
  const [isConfirmed, setIsConfirmed] = useState(initialIsConfirmed)

  // Refresh server data after match actions to get updated items
  const refreshItems = useCallback(() => {
    router.refresh()
  }, [router])

  return (
    <RFPConfirmationContext.Provider
      value={{
        isConfirmed,
        setIsConfirmed,
        refreshItems,
      }}
    >
      {children}
    </RFPConfirmationContext.Provider>
  )
}

/**
 * Hook to access RFP confirmation context.
 * Must be used within an RFPConfirmationProvider.
 */
export function useRFPConfirmation() {
  const context = useContext(RFPConfirmationContext)
  if (!context) {
    throw new Error('useRFPConfirmation must be used within an RFPConfirmationProvider')
  }
  return context
}
