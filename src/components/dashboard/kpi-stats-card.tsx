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
    valueDetail?: string
    className?: string
    iconClassName?: string
    iconContainerClassName?: string
}

export function KPIStatsCard({
    label,
    value,
    icon: Icon,
    description,
    valueDetail,
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
                    <div className={cn("rounded p-2.5", iconContainerClassName)}>
                        <Icon className={cn("h-7 w-7", iconClassName)} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{label}</p>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                            <h3 className="text-xl font-bold tracking-tight">
                                {isNumeric ? (
                                    <AnimatedNumber value={value} duration={400} />
                                ) : (
                                    value
                                )}
                            </h3>
                            {valueDetail && (
                                <span className="text-xs text-muted-foreground font-medium">{valueDetail}</span>
                            )}
                        </div>
                        {description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
