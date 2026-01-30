import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step {
  /** Step label */
  label: string
  /** Optional description */
  description?: string
}

interface StepIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of steps */
  steps: Step[]
  /** Current active step (0-indexed) */
  currentStep: number
  /** Orientation of the indicator */
  orientation?: "horizontal" | "vertical"
}

export function StepIndicator({
  steps,
  currentStep,
  orientation = "horizontal",
  className,
  ...props
}: StepIndicatorProps) {
  return (
    <div
      className={cn(
        "flex",
        orientation === "horizontal" ? "flex-row items-center" : "flex-col",
        className
      )}
      role="list"
      aria-label="Progresso"
      {...props}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isLast = index === steps.length - 1

        return (
          <React.Fragment key={step.label}>
            <div
              className={cn(
                "flex",
                orientation === "horizontal"
                  ? "flex-col items-center"
                  : "flex-row items-start gap-3"
              )}
              role="listitem"
              aria-current={isCurrent ? "step" : undefined}
            >
              {/* Step circle */}
              <div
                className={cn(
                  "flex items-center justify-center rounded-sm border-2 transition-colors",
                  orientation === "horizontal" ? "h-8 w-8" : "h-7 w-7 shrink-0",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-background text-primary",
                  !isCompleted && !isCurrent && "border-muted-foreground/30 bg-background text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Step label and description */}
              <div
                className={cn(
                  orientation === "horizontal" ? "mt-2 text-center" : "pt-0.5"
                )}
              >
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-primary",
                    isCompleted && "text-foreground",
                    !isCompleted && !isCurrent && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  "transition-colors",
                  orientation === "horizontal"
                    ? "mx-2 h-0.5 flex-1 min-w-[2rem]"
                    : "ml-3.5 my-1 w-0.5 h-6",
                  index < currentStep ? "bg-primary" : "bg-muted-foreground/30"
                )}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
