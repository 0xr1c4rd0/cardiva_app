'use client'

import { InventoryUploadStatusProvider } from '@/contexts/inventory-upload-status-context'
import { InventoryProcessingCard } from './inventory-processing-card'
import { InventoryTable } from './inventory-table'
import { InventoryStats } from './inventory-stats'
import { PermissionGate } from './permission-gate'
import { CSVUploadButton } from './csv-upload-button'
import type { InventoryColumnConfig } from '@/lib/supabase/types'

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

interface InventoryTableState {
  page: number
  pageSize: number
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface InventoryPageContentProps {
  data: Record<string, unknown>[]
  totalCount: number
  columnConfig: InventoryColumnConfig[]
  lastUpload: LastUpload | null
  userRole: 'admin' | 'user' | null
  initialState: InventoryTableState
}

/**
 * Client wrapper for inventory page that provides:
 * - Upload status context with Realtime subscription
 * - Processing card with progress animation
 * - Auto-refresh when upload completes
 */
export function InventoryPageContent({
  data,
  totalCount,
  columnConfig,
  lastUpload,
  userRole,
  initialState,
}: InventoryPageContentProps) {
  return (
    <InventoryUploadStatusProvider>
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Inventário</h1>
            <p className="text-muted-foreground">
              Consultar e gerir o catálogo de produtos
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Upload only for admin users */}
            <PermissionGate requiredRole="admin" userRole={userRole}>
              <CSVUploadButton />
            </PermissionGate>
          </div>
        </div>

        <InventoryStats
          totalCount={totalCount}
          lastUpload={lastUpload}
        />

        {/* Processing status card - shows only when active job is processing */}
        <InventoryProcessingCard />

        <InventoryTable
          data={data}
          totalCount={totalCount}
          columnConfig={columnConfig}
          initialState={initialState}
        />
      </div>
    </InventoryUploadStatusProvider>
  )
}
