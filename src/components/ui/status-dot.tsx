import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusDotVariants = cva(
  "inline-block rounded-full shrink-0",
  {
    variants: {
      variant: {
        default: "bg-muted-foreground",
        success: "bg-emerald-500",
        warning: "bg-amber-500",
        error: "bg-red-500",
        info: "bg-blue-500",
        pending: "bg-gray-400",
        processing: "bg-amber-500 animate-pulse",
      },
      size: {
        sm: "h-1.5 w-1.5",
        md: "h-2 w-2",
        lg: "h-2.5 w-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface StatusDotProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusDotVariants> {
  /** Accessible label for screen readers */
  label?: string
}

function StatusDot({
  className,
  variant,
  size,
  label,
  ...props
}: StatusDotProps) {
  return (
    <span
      className={cn(statusDotVariants({ variant, size }), className)}
      role={label ? "status" : undefined}
      aria-label={label}
      {...props}
    />
  )
}

export { StatusDot, statusDotVariants }
