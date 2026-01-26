'use client'

import { Suspense } from 'react'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/form-field'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

function LoginForm() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Iniciar Sessão</CardTitle>
        <CardDescription>
          Introduza as suas credenciais para aceder à sua conta
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {message && (
            <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <FormField label="Email" htmlFor="email" required>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="exemplo@email.com"
              required
              autoComplete="email"
              disabled={isPending}
            />
          </FormField>
          <FormField label="Palavra-passe" htmlFor="password" required>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              disabled={isPending}
            />
          </FormField>
          <div className="flex justify-end">
            <Link
              href="/reset-password"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Esqueceu a palavra-passe?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'A entrar...' : 'Entrar'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{' '}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

function LoginFormFallback() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Iniciar Sessão</CardTitle>
        <CardDescription>
          Introduza as suas credenciais para aceder à sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField label="Email" htmlFor="email" required>
          <Input id="email" type="email" placeholder="exemplo@email.com" disabled />
        </FormField>
        <FormField label="Palavra-passe" htmlFor="password" required>
          <Input id="password" type="password" disabled />
        </FormField>
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled>
          A carregar...
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
