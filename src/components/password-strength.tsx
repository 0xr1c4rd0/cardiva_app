'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
  password: string
  className?: string
}

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const requirements: PasswordRequirement[] = [
  { label: "Pelo menos 8 caracteres", test: (p) => p.length >= 8 },
  { label: "Letra maiuscula", test: (p) => /[A-Z]/.test(p) },
  { label: "Letra minuscula", test: (p) => /[a-z]/.test(p) },
  { label: "Numero", test: (p) => /[0-9]/.test(p) },
]

function getStrength(password: string): number {
  return requirements.filter((req) => req.test(password)).length
}

function getStrengthLabel(strength: number): string {
  switch (strength) {
    case 0:
    case 1:
      return "Fraca"
    case 2:
      return "Razoavel"
    case 3:
      return "Boa"
    case 4:
      return "Forte"
    default:
      return ""
  }
}

function getStrengthColor(strength: number): string {
  switch (strength) {
    case 0:
    case 1:
      return "bg-red-500"
    case 2:
      return "bg-amber-500"
    case 3:
      return "bg-blue-500"
    case 4:
      return "bg-emerald-500"
    default:
      return "bg-gray-200"
  }
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const strength = getStrength(password)
  const label = getStrengthLabel(strength)
  const color = getStrengthColor(strength)

  if (!password) return null

  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Forca da palavra-passe</span>
          <span className={cn(
            "font-medium",
            strength <= 1 && "text-red-600",
            strength === 2 && "text-amber-600",
            strength === 3 && "text-blue-600",
            strength === 4 && "text-emerald-600"
          )}>
            {label}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                "h-1.5 flex-1 rounded-sm transition-colors",
                level <= strength ? color : "bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements checklist */}
      <ul className="space-y-1">
        {requirements.map((req) => {
          const met = req.test(password)
          return (
            <li
              key={req.label}
              className={cn(
                "flex items-center gap-2 text-xs transition-colors",
                met ? "text-emerald-600" : "text-muted-foreground"
              )}
            >
              {met ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{req.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export { getStrength, requirements }
