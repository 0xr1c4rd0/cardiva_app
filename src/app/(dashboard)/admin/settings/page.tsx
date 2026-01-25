import { createClient } from '@/lib/supabase/server'
import { EmailSettingsSection } from './email-settings-section'
import { ExportFieldsSection } from './export-fields-section'
import { InventoryFieldsSection } from './inventory-fields-section'

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  // Fetch app settings
  const { data: appSettings } = await supabase
    .from('app_settings')
    .select('*')
    .eq('id', 1)
    .single()

  // Fetch export column config
  const { data: exportColumns } = await supabase
    .from('export_column_config')
    .select('*')
    .order('source_table')
    .order('display_order')

  // Fetch inventory column config
  const { data: inventoryColumns } = await supabase
    .from('inventory_column_config')
    .select('*')
    .order('display_order')

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Definicoes</h1>
        <p className="text-muted-foreground">
          Configuracoes gerais da aplicacao
        </p>
      </div>

      <div className="space-y-4">
        <EmailSettingsSection initialSettings={appSettings} />
        <ExportFieldsSection initialColumns={exportColumns || []} />
        <InventoryFieldsSection initialColumns={inventoryColumns || []} />
      </div>
    </div>
  )
}
