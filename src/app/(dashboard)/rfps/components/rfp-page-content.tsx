'use client'

import { RFPUploadStatusProvider } from '@/contexts/rfp-upload-status-context'
import { RFPUploadButton } from './rfp-upload-button'
import { RFPJobsList } from './rfp-jobs-list'
import { RFPProcessingCard } from './rfp-processing-card'

interface RFPJob {
  id: string
  file_name: string
  file_size: number | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  completed_at: string | null
}

interface RFPListState {
  page: number
  pageSize: number
  search: string
  sortBy: 'file_name' | 'created_at'
  sortOrder: 'asc' | 'desc'
}

interface RFPPageContentProps {
  initialJobs: RFPJob[]
  totalCount: number
  initialState: RFPListState
}

export function RFPPageContent({ initialJobs, totalCount, initialState }: RFPPageContentProps) {
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
