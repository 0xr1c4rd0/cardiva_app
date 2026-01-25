'use client'

import { KPIStatsCard } from '@/components/dashboard/kpi-stats-card'
import { Package, Database } from 'lucide-react'

interface InventoryStatsProps {
    totalCount: number
    columnCount: number
}

export function InventoryStats({ totalCount, columnCount }: InventoryStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPIStatsCard
                label="Total Produtos"
                value={totalCount}
                icon={Package}
                description="Produtos registados no inventário"
                iconContainerClassName="bg-blue-100 text-blue-600"
            />

            <KPIStatsCard
                label="Campos Mapeados"
                value={columnCount}
                icon={Database}
                description="Atributos disponíveis por produto"
                iconContainerClassName="bg-indigo-100 text-indigo-600"
            />
        </div>
    )
}
