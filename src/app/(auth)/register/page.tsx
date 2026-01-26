'use client'

import { Suspense, useState } from 'react'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signup } from './actions'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/form-field'
import { PasswordStrength } from '@/components/password-strength'

function RegisterForm() {
  const [state, formAction, isPending] = useActionState(signup, null)
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const [password, setPassword] = useState('')

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Criar Conta</CardTitle>
        <CardDescription>
          Registe uma nova conta. A sua conta ficará pendente de aprovação do administrador antes de poder iniciar sessão.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <div className="mb-4 p-3 rounded-md bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 text-sm">
            {message}
          </div>
        )}

        {state?.error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 text-sm">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
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
            />
          </FormField>

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
            />
          </FormField>
          <PasswordStrength password={password} />

          <FormField label="Confirmar Palavra-passe" htmlFor="confirmPassword" required>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              disabled={isPending}
            />
          </FormField>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'A criar conta...' : 'Criar Conta'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Iniciar sessão
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function RegisterFormFallback() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Criar Conta</CardTitle>
        <CardDescription>
          Registe uma nova conta. A sua conta ficará pendente de aprovação do administrador antes de poder iniciar sessão.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input type="text" placeholder="João" disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Apelido</label>
              <Input type="text" placeholder="Silva" disabled />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" placeholder="exemplo@email.com" disabled />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Palavra-passe</label>
            <Input type="password" placeholder="••••••••" disabled />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirmar Palavra-passe</label>
            <Input type="password" placeholder="••••••••" disabled />
          </div>
          <Button className="w-full" disabled>
            A carregar...
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFormFallback />}>
      <RegisterForm />
    </Suspense>
  )
}
