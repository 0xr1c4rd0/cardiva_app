'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react'
import { ValidationResult } from '@/lib/csv/validation'

interface CSVPreviewProps {
  validation: ValidationResult
  isValidating: boolean
}

export function CSVPreview({ validation, isValidating }: CSVPreviewProps) {
  if (isValidating) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-sm border-2 border-primary border-t-transparent" />
        <span>A validar CSV...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      {validation.valid ? (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Validação Aprovada</AlertTitle>
          <AlertDescription>
            {validation.validRowCount} de {validation.totalRowCount} linhas prontas para carregar
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validação Falhou</AlertTitle>
          <AlertDescription>
            {validation.errors.length} erro(s) encontrado(s). Por favor corrija e tente novamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Avisos ({validation.warnings.length})</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 text-sm space-y-1 max-h-24 overflow-y-auto">
              {validation.warnings.slice(0, 5).map((warning, i) => (
                <li key={i}>
                  {warning.row > 0 ? `Linha ${warning.row}: ` : ''}
                  {warning.message}
                </li>
              ))}
              {validation.warnings.length > 5 && (
                <li className="text-muted-foreground">
                  ...e mais {validation.warnings.length - 5} avisos
                </li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Errors */}
      {validation.errors.length > 0 && (
        <div className="max-h-48 overflow-y-auto rounded-md border border-destructive/50 p-3">
          <ul className="text-sm space-y-1">
            {validation.errors.slice(0, 10).map((error, i) => (
              <li key={i} className="text-destructive">
                {error.row > 0 ? `Linha ${error.row}: ` : ''}
                {error.field !== 'file' && error.field !== 'headers' && `${error.field} - `}
                {error.message}
              </li>
            ))}
            {validation.errors.length > 10 && (
              <li className="text-muted-foreground">
                ...e mais {validation.errors.length - 10} erros
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
