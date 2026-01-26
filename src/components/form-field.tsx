import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Field label text */
  label: string
  /** HTML for attribute to link label to input */
  htmlFor?: string
  /** Error message to display */
  error?: string
  /** Helper text below the input */
  hint?: string
  /** Whether the field is required */
  required?: boolean
  /** The form control (input, select, etc.) */
  children: React.ReactNode
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
  ...props
}: FormFieldProps) {
  const id = htmlFor || React.useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <Label
        htmlFor={id}
        className={cn(error && "text-destructive")}
      >
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-hidden="true">*</span>
        )}
      </Label>

      {/* Clone children to add aria attributes */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
            id,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': cn(
              error && errorId,
              hint && !error && hintId
            ) || undefined,
          })
        }
        return child
      })}

      {/* Error message */}
      {error && (
        <p
          id={errorId}
          className="flex items-center gap-1.5 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {/* Hint text (only shown when no error) */}
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  )
}
