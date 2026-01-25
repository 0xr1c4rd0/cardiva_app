'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Mail, Loader2, Check, AlertCircle, X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { RFPItemWithMatches } from '@/types/rfp'
import type { AppSettings } from '@/types/app-settings'
import { getEmailRecipientMode } from '@/types/app-settings'
import {
  transformToExportRows,
  calculateExportSummary,
  generateExcelBase64,
  generateExportFilename,
} from '@/lib/export/rfp-export'
import { sendExportEmail } from '@/app/(dashboard)/rfps/[id]/matches/export-actions'
import { createClient } from '@/lib/supabase/client'

interface ExportEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: RFPItemWithMatches[]
  jobId: string
}

const MAX_EMAILS = 10

export function ExportEmailDialog({ open, onOpenChange, items, jobId }: ExportEmailDialogProps) {
  const [exportMode, setExportMode] = useState<'matched' | 'all'>('matched')
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState<AppSettings | null>(null)

  // Email state
  const [defaultEmails, setDefaultEmails] = useState<string[]>([])
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState('')

  // Fetch settings on mount
  useEffect(() => {
    if (!open) return

    const fetchSettings = async () => {
      setIsLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .single()

      if (data) {
        setSettings(data as AppSettings)
        setDefaultEmails(data.email_default_recipients || [])
      }
      setIsLoading(false)
    }

    fetchSettings()
  }, [open])

  const mode = getEmailRecipientMode(settings)
  const allEmails = [...defaultEmails, ...additionalEmails]
  const canAddMore = allEmails.length < MAX_EMAILS && mode !== 'locked'
  const canRemoveDefaults = mode === 'replaceable'

  // Calculate summary
  const { matchedCount, noMatchCount, totalRows } = useMemo(() => {
    const summary = calculateExportSummary(items)
    const matched = summary.confirmedCount + summary.manualCount
    const noMatch = summary.rejectedCount + summary.noMatchCount
    const confirmedOnly = exportMode === 'matched'
    const rows = transformToExportRows(items, confirmedOnly)

    return {
      matchedCount: matched,
      noMatchCount: noMatch,
      totalRows: rows.length,
    }
  }, [items, exportMode])

  const handleAddEmail = () => {
    const email = newEmail.trim().toLowerCase()
    if (!email || !email.includes('@')) {
      toast.error('Introduza um email valido')
      return
    }
    if (allEmails.includes(email)) {
      toast.error('Este email ja foi adicionado')
      return
    }
    if (allEmails.length >= MAX_EMAILS) {
      toast.error(`Maximo de ${MAX_EMAILS} emails`)
      return
    }
    setAdditionalEmails([...additionalEmails, email])
    setNewEmail('')
  }

  const handleRemoveDefault = (email: string) => {
    if (mode !== 'replaceable') return
    setDefaultEmails(defaultEmails.filter(e => e !== email))
  }

  const handleRemoveAdditional = (email: string) => {
    setAdditionalEmails(additionalEmails.filter(e => e !== email))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddEmail()
    }
  }

  const handleSend = async () => {
    if (allEmails.length === 0) {
      toast.error('Adicione pelo menos um destinatario')
      return
    }
    if (totalRows === 0) {
      toast.error('Sem dados para enviar')
      return
    }

    setIsSending(true)
    try {
      const confirmedOnly = exportMode === 'matched'
      const excelBase64 = await generateExcelBase64(items, confirmedOnly)
      const fileName = generateExportFilename('RFP_Resultados')
      const summary = calculateExportSummary(items)

      // Send to all emails (webhook handles multiple recipients)
      const result = await sendExportEmail({
        jobId,
        recipientEmail: allEmails.join(','), // Comma-separated for multiple
        fileName,
        excelBase64,
        summary: {
          totalItems: summary.totalItems,
          confirmedCount: summary.confirmedCount,
          rejectedCount: summary.rejectedCount,
          manualCount: summary.manualCount,
          noMatchCount: summary.noMatchCount,
        },
      })

      if (result.success) {
        toast.success(`Email enviado para ${allEmails.length} destinatario(s)`)
        onOpenChange(false)
      } else {
        toast.error(result.error || 'Erro ao enviar email')
      }
    } catch (error) {
      console.error('Send email failed:', error)
      toast.error('Erro ao enviar email')
    } finally {
      setIsSending(false)
    }
  }

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setAdditionalEmails([])
      setNewEmail('')
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Enviar por Email</DialogTitle>
          <DialogDescription>
            Envie os resultados da revisao para os destinatarios.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="flex items-center justify-center gap-6 py-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <span className="text-lg font-semibold text-emerald-700">{matchedCount}</span>
                <span className="text-xs text-muted-foreground">Correspondencias</span>
              </div>
              <div className="h-5 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100">
                  <AlertCircle className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <span className="text-lg font-semibold text-gray-700">{noMatchCount}</span>
                <span className="text-xs text-muted-foreground">Sem correspondencia</span>
              </div>
            </div>

            {/* Export mode selection */}
            <div className="space-y-3 py-3 border-t">
              <Label className="text-sm font-medium">Incluir na exportacao</Label>
              <RadioGroup
                value={exportMode}
                onValueChange={(value) => setExportMode(value as 'matched' | 'all')}
                className="space-y-2"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="matched" id="email-matched" />
                  <Label htmlFor="email-matched" className="cursor-pointer font-normal">
                    Apenas correspondencias ({matchedCount})
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="all" id="email-all" />
                  <Label htmlFor="email-all" className="cursor-pointer font-normal">
                    Todos os produtos ({items.length})
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Email recipients */}
            <div className="space-y-3 py-3 border-t">
              <Label className="text-sm font-medium">
                Destinatarios ({allEmails.length}/{MAX_EMAILS})
              </Label>

              {/* Email chips */}
              {allEmails.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {defaultEmails.map((email) => (
                    <Badge key={email} variant="secondary" className="gap-1 pr-1">
                      {email}
                      {canRemoveDefaults && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDefault(email)}
                          className="ml-1 hover:text-destructive rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                  {additionalEmails.map((email) => (
                    <Badge key={email} variant="outline" className="gap-1 pr-1">
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveAdditional(email)}
                        className="ml-1 hover:text-destructive rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Email input */}
              {canAddMore && (
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddEmail}
                    disabled={!newEmail || isSending}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {mode === 'locked' && (
                <p className="text-xs text-muted-foreground">
                  Os destinatarios estao definidos pelo administrador.
                </p>
              )}
            </div>
          </>
        )}

        <DialogFooter className="gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || allEmails.length === 0 || totalRows === 0 || isLoading}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A enviar...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Enviar Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
