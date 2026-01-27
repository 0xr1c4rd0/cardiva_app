'use client'

import { useState } from 'react'
import { Package, Upload, Loader2, AlertTriangle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { CSVUploadDialog } from './csv-upload-dialog'
import { triggerInventoryUpload } from '../actions'
import { toast } from 'sonner'
import { useUploadStatus } from '@/hooks/use-upload-status'
import { cn } from '@/lib/utils'

interface InventoryHeroCardProps {
  totalCount: number
  lastUpdated: Date | null
  userRole: 'admin' | 'user' | null
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 1) return 'agora mesmo'
  if (diffMinutes < 60) return `há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`
  if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`
  if (diffDays === 1) return 'há 1 dia'
  if (diffDays < 7) return `há ${diffDays} dias`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `há ${weeks} semana${weeks > 1 ? 's' : ''}`
  }
  const months = Math.floor(diffDays / 30)
  return `há ${months} ${months > 1 ? 'meses' : 'mês'}`
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isStale(date: Date | null, thresholdDays: number = 7): boolean {
  if (!date) return true
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays > thresholdDays
}

export function InventoryHeroCard({
  totalCount,
  lastUpdated,
  userRole
}: InventoryHeroCardProps) {
  const [open, setOpen] = useState(false)
  const { isProcessing, refetch } = useUploadStatus()
  const isAdmin = userRole === 'admin'
  const stale = isStale(lastUpdated)

  const handleUpload = async (file: File, rowCount: number) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('rowCount', String(rowCount))

    const result = await triggerInventoryUpload(formData)

    if (result.success) {
      toast.success('Carregamento iniciado', {
        description: `A processar ${rowCount} linhas em segundo plano. Será notificado quando concluir.`,
      })
      refetch()
    } else {
      toast.error('Carregamento falhou', {
        description: result.error,
      })
    }

    return result
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon */}
            <div className="rounded-sm bg-primary/10 p-4">
              <Package className="h-10 w-10 text-primary" />
            </div>

            {/* Stats */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold tracking-tight">
                  <AnimatedNumber
                    value={totalCount}
                    duration={600}
                  />
                </span>
                <span className="text-lg text-muted-foreground">produtos</span>
              </div>

              {/* Last updated */}
              <div className={cn(
                "flex items-center justify-center gap-2 text-sm",
                stale ? "text-amber-600" : "text-muted-foreground"
              )}>
                {stale ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                {lastUpdated ? (
                  <span>
                    Atualizado {formatRelativeTime(lastUpdated)}
                    <span className="mx-1">•</span>
                    <span className="text-muted-foreground">
                      {formatFullDate(lastUpdated)}
                    </span>
                  </span>
                ) : (
                  <span>Sem informação de atualização</span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="w-full max-w-xs border-t" />

            {/* Upload Button - Admin only */}
            {isAdmin && (
              <div className="space-y-3">
                <Button
                  size="lg"
                  onClick={() => setOpen(true)}
                  disabled={isProcessing}
                  className="px-8"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      A processar...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Carregar Novo Inventário
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Arraste um ficheiro CSV ou clique para selecionar
                </p>
              </div>
            )}

            {/* Non-admin message */}
            {!isAdmin && (
              <p className="text-sm text-muted-foreground">
                Contacte um administrador para atualizar o inventário
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <CSVUploadDialog
        open={open}
        onOpenChange={setOpen}
        onUpload={handleUpload}
      />
    </>
  )
}
