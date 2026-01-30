'use client'

import { Suspense } from 'react'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/form-field'
import { Alert, AlertDescription } from '@/components/ui/alert'

function LoginForm() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <div className="w-full bg-white dark:bg-gray-950 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-600 mb-2">cardiva AI</h1>
        <h2 className="text-2xl font-semibold">Iniciar Sessão</h2>
      </div>

      {/* Alerts */}
      {message && (
        <Alert className="mb-6 border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      {state?.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form action={formAction} className="space-y-5">
        <FormField label="Email" htmlFor="email" required>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="exemplo@email.com"
            required
            autoComplete="email"
            disabled={isPending}
            className="h-11"
          />
        </FormField>

        <div className="space-y-2">
          <FormField label="Palavra-passe" htmlFor="password" required>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              disabled={isPending}
              className="h-11"
            />
          </FormField>
          <div className="flex justify-end">
            <Link
              href="/reset-password"
              className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Esqueceu a palavra-passe?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          disabled={isPending}
        >
          {isPending ? 'A entrar...' : 'Entrar'}
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Não tem conta?{' '}
          <Link
            href="/register"
            className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}

function LoginFormFallback() {
  return (
    <div className="w-full bg-white dark:bg-gray-950 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-600 mb-2">cardiva AI</h1>
        <h2 className="text-2xl font-semibold">Iniciar Sessão</h2>
      </div>
      <div className="space-y-5">
        <FormField label="Email" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            placeholder="exemplo@email.com"
            disabled
            className="h-11"
          />
        </FormField>
        <FormField label="Palavra-passe" htmlFor="password" required>
          <Input id="password" type="password" disabled className="h-11" />
        </FormField>
        <Button className="w-full h-11 bg-emerald-600" disabled>
          A carregar...
        </Button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  )
}
