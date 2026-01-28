'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, X, Plus, Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import type { AppSettings } from '@/types/app-settings'
import { updateEmailSettings } from './actions'

interface EmailSettingsSectionProps {
  initialSettings: AppSettings | null
}

export function EmailSettingsSection({ initialSettings }: EmailSettingsSectionProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [recipients, setRecipients] = useState<string[]>(
    initialSettings?.email_default_recipients || []
  )
  const [userCanEdit, setUserCanEdit] = useState(
    initialSettings?.email_user_can_edit ?? true
  )
  const [defaultsReplaceable, setDefaultsReplaceable] = useState(
    initialSettings?.email_defaults_replaceable ?? true
  )
  const [newEmail, setNewEmail] = useState('')

  const handleAddEmail = () => {
    const email = newEmail.trim().toLowerCase()
    if (!email || !email.includes('@')) {
      toast.error('Introduza um email valido')
      return
    }
    if (recipients.includes(email)) {
      toast.error('Este email ja existe')
      return
    }
    setRecipients([...recipients, email])
    setNewEmail('')
  }

  const handleRemoveEmail = (email: string) => {
    setRecipients(recipients.filter(e => e !== email))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateEmailSettings({
        email_default_recipients: recipients,
        email_user_can_edit: userCanEdit,
        email_defaults_replaceable: defaultsReplaceable,
      })

      if (result.success) {
        toast.success('Definicoes de email guardadas')
      } else {
        toast.error(result.error || 'Erro ao guardar')
      }
    } catch {
      toast.error('Erro ao guardar definicoes')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <div>
                  <CardTitle className="text-lg">Configuracao de Email</CardTitle>
                  <CardDescription>
                    Definir destinatarios padrao e permissoes de edicao
                  </CardDescription>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Default recipients */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Destinatarios padrao</Label>
              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {recipients.map((email) => (
                    <Badge key={email} variant="secondary" className="gap-1 pr-1">
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="ml-1 hover:text-destructive rounded-sm"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEmail())}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="icon" onClick={handleAddEmail} aria-label="Adicionar email">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            {/* Permission toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="user-can-edit">Utilizadores podem editar</Label>
                  <p className="text-xs text-muted-foreground">
                    Permitir adicionar emails adicionais
                  </p>
                </div>
                <Switch
                  id="user-can-edit"
                  checked={userCanEdit}
                  onCheckedChange={setUserCanEdit}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="defaults-replaceable">Emails padrao substituiveis</Label>
                  <p className="text-xs text-muted-foreground">
                    Permitir remover emails padrao
                  </p>
                </div>
                <Switch
                  id="defaults-replaceable"
                  checked={defaultsReplaceable}
                  onCheckedChange={setDefaultsReplaceable}
                  disabled={!userCanEdit}
                />
              </div>
            </div>

            {/* Save button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A guardar...
                  </>
                ) : (
                  'Guardar'
                )}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
