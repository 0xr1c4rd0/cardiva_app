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
        label="Total Produtos"
        value={totalCount}
        icon={Package}
        description="Produtos registados no inventário"
        iconContainerClassName="bg-blue-100 text-blue-600"
      />

      <KPIStatsCard
        label="Última Atualização"
        value={lastUploadTime}
        icon={Calendar}
        description={lastUpload?.file_name || 'Nenhum upload registado'}
        iconContainerClassName="bg-green-100 text-green-600"
      />

      <KPIStatsCard
        label="Atualizado Por"
        value={uploaderName}
        icon={User}
        description={
          lastUpload?.processed_rows
            ? `${lastUpload.processed_rows} alterações processadas`
            : 'Nenhum upload registado'
        }
        iconContainerClassName="bg-purple-100 text-purple-600"
      />
    </div>
  )
}
