import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DashboardKPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
  variant?: 'default' | 'highlight' | 'warning'
  href?: string
}

export function DashboardKPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: DashboardKPICardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden",
      variant === 'highlight' && "border-primary/50 bg-primary/5",
      variant === 'warning' && "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <p className={cn(
                "text-sm font-medium",
                trend.value >= 0 ? "text-emerald-600" : "text-red-600"
              )}>
                {trend.value >= 0 ? '+' : ''}{trend.value} {trend.label}
              </p>
            )}
          </div>
          <div className={cn(
            "rounded-lg p-3",
            variant === 'default' && "bg-muted",
            variant === 'highlight' && "bg-primary/10",
            variant === 'warning' && "bg-amber-100 dark:bg-amber-900/30"
          )}>
            <Icon className={cn(
              "h-6 w-6",
              variant === 'default' && "text-muted-foreground",
              variant === 'highlight' && "text-primary",
              variant === 'warning' && "text-amber-600"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
