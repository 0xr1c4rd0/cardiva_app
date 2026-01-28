'use client'

import { Suspense, useState } from 'react'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signup } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/form-field'
import { PasswordStrength } from '@/components/password-strength'
import { Alert, AlertDescription } from '@/components/ui/alert'

function RegisterForm() {
  const [state, formAction, isPending] = useActionState(signup, null)
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const [password, setPassword] = useState('')

  return (
    <div className="w-full bg-white dark:bg-gray-950 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-600 mb-2">cardiva AI</h1>
        <h2 className="text-2xl font-semibold">Criar Conta</h2>
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
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nome" htmlFor="firstName" required>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="João"
              required
              autoComplete="given-name"
              disabled={isPending}
              className="h-11"
            />
          </FormField>
          <FormField label="Apelido" htmlFor="lastName" required>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Silva"
              required
              autoComplete="family-name"
              disabled={isPending}
              className="h-11"
            />
          </FormField>
        </div>

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
              placeholder="••••••••"
              required
              autoComplete="new-password"
              disabled={isPending}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
            />
          </FormField>
          <PasswordStrength password={password} />
        </div>

        <FormField
          label="Confirmar Palavra-passe"
          htmlFor="confirmPassword"
          required
        >
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            disabled={isPending}
            className="h-11"
          />
        </FormField>

        <Button
          type="submit"
          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          disabled={isPending}
        >
          {isPending ? 'A criar conta...' : 'Criar Conta'}
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link
            href="/login"
            className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Iniciar sessão
          </Link>
        </p>
      </div>
    </div>
  )
}

function RegisterFormFallback() {
  return (
    <div className="w-full bg-white dark:bg-gray-950 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-600 mb-2">cardiva AI</h1>
        <h2 className="text-2xl font-semibold">Criar Conta</h2>
      </div>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nome" htmlFor="firstName" required>
            <Input
              type="text"
              placeholder="João"
              disabled
              className="h-11"
            />
          </FormField>
          <FormField label="Apelido" htmlFor="lastName" required>
            <Input
              type="text"
              placeholder="Silva"
              disabled
              className="h-11"
            />
          </FormField>
        </div>
        <FormField label="Email" htmlFor="email" required>
          <Input
            type="email"
            placeholder="exemplo@email.com"
            disabled
            className="h-11"
          />
        </FormField>
        <FormField label="Palavra-passe" htmlFor="password" required>
          <Input type="password" placeholder="••••••••" disabled className="h-11" />
        </FormField>
        <FormField label="Confirmar Palavra-passe" htmlFor="confirmPassword" required>
          <Input type="password" placeholder="••••••••" disabled className="h-11" />
        </FormField>
        <Button className="w-full h-11 bg-emerald-600" disabled>
          A carregar...
        </Button>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFormFallback />}>
      <RegisterForm />
    </Suspense>
  )
}
