'use client'

import { RFPUploadStatusProvider } from '@/contexts/rfp-upload-status-context'
import { RFPUploadButton } from './rfp-upload-button'
import { RFPJobsList } from './rfp-jobs-list'
import { RFPProcessingCard } from './rfp-processing-card'
import { RFPStats } from './rfp-stats'

interface RFPJob {
  id: string
  file_name: string
  file_size: number | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
  confirmed_at?: string | null
  review_status?: 'por_rever' | 'revisto' | 'confirmado' | null
  user_id?: string
  last_edited_by?: string | null
  uploader?: { email: string } | null
  last_editor?: { email: string } | null
}

interface RFPListState {
  page: number
  pageSize: number
  search: string
  sortBy: 'file_name' | 'created_at'
  sortOrder: 'asc' | 'desc'
}

interface KPIData {
  totalCount: number
  porReverCount: number
  revistosCount: number
  confirmedCount: number
}

interface RFPPageContentProps {
  initialJobs: RFPJob[]
  totalCount: number
  initialKPIs: KPIData
  initialState: RFPListState
}

export function RFPPageContent({ initialJobs, totalCount, initialKPIs, initialState }: RFPPageContentProps) {
  return (
    <RFPUploadStatusProvider>
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Processamento de Concursos</h1>
            <p className="text-muted-foreground">
              Carregar e processar documentos de concursos para correspondência com o inventário
            </p>
          </div>

          <RFPUploadButton />
        </div>

        {/* KPI Stats - Uses server data initially, refreshes on job changes */}
        <RFPStats initialKPIs={initialKPIs} />

        {/* Processing status card - shows only when active job is processing */}
        <RFPProcessingCard />

        <RFPJobsList
          initialJobs={initialJobs}
          totalCount={totalCount}
          initialState={initialState}
        />
      </div>
    </RFPUploadStatusProvider>
  )
}
