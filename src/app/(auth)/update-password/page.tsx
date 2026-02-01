'use client'

import { useActionState, useState } from 'react'
import { updatePassword } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/form-field'
import { PasswordStrength } from '@/components/password-strength'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function UpdatePasswordPage() {
  const [state, formAction, isPending] = useActionState(updatePassword, null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [clientError, setClientError] = useState('')

  const handleSubmit = (formData: FormData) => {
    // Client-side validation
    const pwd = formData.get('password') as string
    const confirm = formData.get('confirmPassword') as string

    if (pwd !== confirm) {
      setClientError('As palavras-passe não coincidem')
      return
    }

    setClientError('')
    formAction(formData)
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md py-6">
        <CardHeader className="gap-0">
          <h1 className="text-3xl font-bold text-emerald-600 mb-2">cardiva AI</h1>
          <h2 className="text-2xl font-semibold">Atualizar Palavra-passe</h2>
          <CardDescription className="mt-2">
            Introduza a sua nova palavra-passe abaixo
          </CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            {(state?.error || clientError) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {clientError || state?.error}
                </AlertDescription>
              </Alert>
            )}
            <FormField label="Nova Palavra-passe" htmlFor="password" required>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                disabled={isPending}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
              />
            </FormField>
            <PasswordStrength password={password} />
            <FormField label="Confirmar Nova Palavra-passe" htmlFor="confirmPassword" required>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                disabled={isPending}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FormField>
          </CardContent>
          <div className="px-6 pb-6">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'A atualizar...' : 'Atualizar Palavra-passe'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
