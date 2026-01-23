import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    <div className={cn("rounded-full p-3", iconContainerClassName)}>
                        <Icon className={cn("h-6 w-6", iconClassName)} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{label}</p>
                        <h3 className="text-2xl font-bold tracking-tight mt-1">{value}</h3>
                        {description && (
                            <p className="text-xs text-muted-foreground mt-1">{description}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
