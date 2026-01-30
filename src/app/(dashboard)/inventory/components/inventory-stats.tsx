'use client'

import { KPIStatsCard } from '@/components/dashboard/kpi-stats-card'
import { Package, Calendar, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface LastUpload {
  id: string
  file_name: string
  created_at: string
  completed_at: string | null
  processed_rows: number
  user_id: string
  profiles: {
    full_name: string | null
    email: string
  }
}

interface InventoryStatsProps {
  totalCount: number
  lastUpload: LastUpload | null
}

export function InventoryStats({ totalCount, lastUpload }: InventoryStatsProps) {
  // Format last upload time
  const lastUploadTime = lastUpload?.completed_at
    ? formatDistanceToNow(new Date(lastUpload.completed_at), {
        addSuffix: true,
        locale: ptBR,
      })
    : 'Nunca'

  // Get uploader name or email
  const uploaderName = lastUpload?.profiles.full_name || lastUpload?.profiles.email || 'Desconhecido'

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <KPIStatsCard
        label="Produtos no Inventário"
        value={totalCount}
        icon={Package}
        iconContainerClassName="bg-slate-100 text-slate-600"
      />

      <KPIStatsCard
        label="Último Carregamento"
        value={lastUploadTime}
        icon={Calendar}
        iconContainerClassName="bg-amber-100 text-amber-600"
      />

      <KPIStatsCard
        label="Carregado Por"
        value={uploaderName}
        icon={User}
        iconContainerClassName="bg-emerald-100 text-emerald-600"
      />
    </div>
  )
}
