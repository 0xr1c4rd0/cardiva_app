'use client'

import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { cn } from '@/lib/utils'

interface KPIStatsCardProps {
    label: string
    value: string | number
    icon: LucideIcon
    description?: string
    className?: string
    iconClassName?: string
    iconContainerClassName?: string
}

export function KPIStatsCard({
    label,
    value,
    icon: Icon,
    description,
    className,
    iconClassName,
    iconContainerClassName = "bg-primary/10 text-primary",
}: KPIStatsCardProps) {
    // Determine if we can animate (numeric value)
    const isNumeric = typeof value === 'number'

    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className={cn("rounded-sm p-2", iconContainerClassName)}>
                        <Icon className={cn("h-5 w-5", iconClassName)} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                            <p className="text-sm font-medium text-muted-foreground">{label}</p>
                            <h3 className="text-xl font-bold tracking-tight">
                                {isNumeric ? (
                                    <AnimatedNumber value={value} duration={400} />
                                ) : (
                                    value
                                )}
                            </h3>
                        </div>
                        {description && (
                            <p className="text-xs text-muted-foreground mt-1">{description}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
