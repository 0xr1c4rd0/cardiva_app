import { createClient } from '@/lib/supabase/server'
import { KPIStatsCard } from '@/components/dashboard/kpi-stats-card'
import { Package, Database } from 'lucide-react'

export async function InventoryStats() {
    const supabase = await createClient()

    // Fetch metrics in parallel
    const [
        { count: totalCount },
        { count: columnCount }
    ] = await Promise.all([
        supabase.from('artigos').select('*', { count: 'exact', head: true }),
        supabase.from('inventory_column_config').select('*', { count: 'exact', head: true })
    ])

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPIStatsCard
                label="Total Produtos"
                value={totalCount?.toLocaleString('pt-PT') ?? 0}
                icon={Package}
                description="Produtos registados no inventário"
                iconContainerClassName="bg-blue-100 text-blue-600"
            />

            <KPIStatsCard
                label="Campos Mapeados"
                value={columnCount ?? 0}
                icon={Database}
                description="Atributos disponíveis por produto"
                iconContainerClassName="bg-indigo-100 text-indigo-600"
            />
        </div>
    )
}
