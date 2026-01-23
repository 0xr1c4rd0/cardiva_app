'use client'

import { useActionState } from 'react'
import { approveUser, rejectUser } from './actions'
import { Button } from '@/components/ui/button'

export function ApproveButton({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(
    async (_prevState: any, formData: FormData) => {
      return await approveUser(userId)
    },
    null
  )

  return (
    <form action={formAction} className="inline">
      <Button
        type="submit"
        size="sm"
        variant="default"
        className="mr-2"
        disabled={isPending}
      >
        {isPending ? 'A aprovar...' : 'Aprovar'}
      </Button>
    </form>
  )
}

export function RejectButton({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(
    async (_prevState: any, formData: FormData) => {
      return await rejectUser(userId)
    },
    null
  )

  return (
    <form action={formAction} className="inline">
      <Button
        type="submit"
        size="sm"
        variant="destructive"
        disabled={isPending}
      >
        {isPending ? 'A rejeitar...' : 'Rejeitar'}
      </Button>
    </form>
  )
}
