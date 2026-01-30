/**
 * TypeScript types for RFP match review
 * Based on database schema from supabase/migrations/20260122_rfp_match_results.sql
 */

/**
 * RFP Item - Extracted from uploaded RFP document
 * Maps to rfp_items table
 */
export interface RFPItem {
  id: string
  job_id: string

  // Extracted data from RFP
  lote_pedido: number | null
  posicao_pedido: number | null
  artigo_pedido: string | null
  descricao_pedido: string
  especificacoes_tecnicas: string | null
  quantidade_pedido: number | null
  preco_artigo: number | null
  preco_posicao: number | null
  preco_lote: number | null

  // Review status
  review_status: 'pending' | 'accepted' | 'rejected' | 'manual'
  selected_match_id: string | null

  // Timestamps
  created_at: string
  updated_at: string
}

/**
 * Match Suggestion - AI-suggested match from inventory
 * Maps to rfp_match_suggestions table
 */
export interface MatchSuggestion {
  id: string
  rfp_item_id: string

  // Match data from inventory
  codigo_spms: string | null
  artigo: string | null
  descricao: string | null
  descricao_comercial: string | null // Commercial description for hover display
  unidade_venda: string | null
  quantidade_disponivel: number | null
  preco: number | null

  // AI matching details
  similarity_score: number // 0.0000 to 1.0000
  match_type: string | null
  rank: number

  // Status for user review
  status: 'pending' | 'accepted' | 'rejected'

  // Timestamp
  created_at: string
}

/**
 * RFP Item with nested match suggestions
 * Used for display in match review page
 */
export interface RFPItemWithMatches extends RFPItem {
  rfp_match_suggestions: MatchSuggestion[]
}
