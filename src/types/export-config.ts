/**
 * Export column configuration types
 * Based on database schema from supabase/migrations/20260125_export_column_config.sql
 */

/**
 * Export column configuration from export_column_config table
 */
export interface ExportColumnConfig {
  id: number
  source_table: 'rfp_items' | 'rfp_match_suggestions'
  column_name: string
  display_name: string
  visible: boolean
  display_order: number
  column_type: 'text' | 'number' | 'currency' | 'date'
  created_at: string
  updated_at: string
}

/**
 * Merged column data for export row building
 * Combines rfp_item data with matched suggestion data
 */
export interface ExportColumnMapping {
  key: string              // column_name from config
  header: string           // display_name from config
  source: 'rfp_items' | 'rfp_match_suggestions'
  type: 'text' | 'number' | 'currency' | 'date'
}

/**
 * Default columns to use when database config is unavailable
 * Matches the existing RFP_EXPORT_COLUMNS structure
 */
export const DEFAULT_EXPORT_COLUMNS: ExportColumnMapping[] = [
  { key: 'lote_pedido', header: 'Lote', source: 'rfp_items', type: 'number' },
  { key: 'posicao_pedido', header: 'Posicao', source: 'rfp_items', type: 'number' },
  { key: 'artigo_pedido', header: 'Artigo Pedido', source: 'rfp_items', type: 'text' },
  { key: 'descricao_pedido', header: 'Descricao Pedido', source: 'rfp_items', type: 'text' },
  { key: 'quantidade_pedido', header: 'Quantidade', source: 'rfp_items', type: 'number' },
  { key: 'codigo_spms', header: 'Cod. SPMS', source: 'rfp_match_suggestions', type: 'text' },
  { key: 'artigo', header: 'Artigo Match', source: 'rfp_match_suggestions', type: 'text' },
  { key: 'descricao', header: 'Descricao Match', source: 'rfp_match_suggestions', type: 'text' },
  { key: 'preco', header: 'Preco Unit.', source: 'rfp_match_suggestions', type: 'currency' },
  { key: 'similarity_score', header: 'Similaridade', source: 'rfp_match_suggestions', type: 'number' },
  { key: 'match_type', header: 'Tipo', source: 'rfp_match_suggestions', type: 'text' },
]
