'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordReset,
    null
  )

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Recuperar Palavra-passe</CardTitle>
          <CardDescription>
            Introduza o seu endereço de email e enviaremos um link para
            recuperar a sua palavra-passe
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            {state?.success && (
              <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
                <AlertDescription>{state.success}</AlertDescription>
              </Alert>
            )}
            {state?.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="exemplo@email.com"
                required
                disabled={isPending}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'A enviar...' : 'Enviar Link de Recuperação'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Lembra-se da palavra-passe?{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Iniciar sessão
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
