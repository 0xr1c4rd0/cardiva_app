'use client'

import { useActionState, useState } from 'react'
import { updatePassword } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Atualizar Palavra-passe</CardTitle>
          <CardDescription>
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
            <div className="space-y-2">
              <Label htmlFor="password">Nova Palavra-passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isPending}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres com maiúscula, minúscula e número
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Palavra-passe</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                disabled={isPending}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
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
