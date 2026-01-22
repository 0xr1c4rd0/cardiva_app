// Artigo is now dynamic - columns are discovered from database
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Artigo = Record<string, any>

export interface InventoryColumnConfig {
  id: number
  column_name: string
  display_name: string
  visible: boolean
  sortable: boolean
  searchable: boolean
  display_order: number
  column_type: 'text' | 'number' | 'currency' | 'date'
  created_at: string
  updated_at: string
}
