-- Migration: Create tables for RFP match results
-- Columns match exactly the output from n8n "Formatação Match Produtos" node
--
-- Run this in Supabase Dashboard SQL Editor
-- NOTE: If tables already exist, drop them first:
--   DROP TABLE IF EXISTS rfp_match_suggestions CASCADE;
--   DROP TABLE IF EXISTS rfp_items CASCADE;

-- =============================================
-- Table 1: rfp_items - Extracted items from RFP PDF
-- Columns match: lote_pedido -> preco_lote from n8n output
-- =============================================
CREATE TABLE IF NOT EXISTS rfp_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES rfp_upload_jobs(id) ON DELETE CASCADE,

  -- Extracted data from RFP (exact field names from n8n output)
  lote_pedido INTEGER,                      -- Lot number in the RFP
  posicao_pedido INTEGER,                   -- Position within the lot
  artigo_pedido TEXT,                       -- Article code from RFP
  descricao_pedido TEXT NOT NULL,           -- Item description from RFP
  especificacoes_tecnicas TEXT,             -- Technical specifications
  quantidade_pedido INTEGER,                -- Requested quantity
  preco_artigo DECIMAL(12,6),               -- Unit price from RFP
  preco_posicao DECIMAL(12,2),              -- Position total price
  preco_lote DECIMAL(12,2),                 -- Lot total price

  -- Review status
  review_status TEXT NOT NULL DEFAULT 'pending',
  selected_match_id UUID,                   -- The match the user accepted

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_review_status CHECK (review_status IN ('pending', 'accepted', 'rejected', 'manual'))
);

-- Indexes for rfp_items
CREATE INDEX IF NOT EXISTS idx_rfp_items_job_id ON rfp_items(job_id);
CREATE INDEX IF NOT EXISTS idx_rfp_items_review_status ON rfp_items(review_status);
CREATE INDEX IF NOT EXISTS idx_rfp_items_lote ON rfp_items(lote_pedido, posicao_pedido);

-- Unique constraint for upsert operations (prevents duplicates when same RFP item has multiple matches)
ALTER TABLE rfp_items ADD CONSTRAINT uq_rfp_items_job_lote_posicao
  UNIQUE (job_id, lote_pedido, posicao_pedido);

-- =============================================
-- Table 2: rfp_match_suggestions - AI-suggested matches
-- Columns match: codigo_spms -> match_type from n8n output
-- =============================================
CREATE TABLE IF NOT EXISTS rfp_match_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_item_id UUID NOT NULL REFERENCES rfp_items(id) ON DELETE CASCADE,

  -- Match data (exact field names from n8n output)
  codigo_spms TEXT,                         -- SPMS code (if matched)
  artigo TEXT,                              -- Matched product code from inventory
  descricao TEXT,                           -- Matched product description
  unidade_venda TEXT,                       -- Unit of sale
  quantidade_disponivel INTEGER,            -- Available quantity in inventory
  preco DECIMAL(12,6),                      -- Price from inventory

  -- AI matching details
  similarity_score DECIMAL(5,4) NOT NULL DEFAULT 0, -- 0.0000 to 1.0000
  match_type TEXT,                          -- "Exato", "Similar", "Sem Match", etc.
  rank INTEGER NOT NULL DEFAULT 1,          -- 1 = best match, 2 = second best, etc.

  -- Status for user review
  status TEXT NOT NULL DEFAULT 'pending',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_confidence CHECK (similarity_score >= 0 AND similarity_score <= 1),
  CONSTRAINT valid_match_status CHECK (status IN ('pending', 'accepted', 'rejected'))
);

-- Indexes for rfp_match_suggestions
CREATE INDEX IF NOT EXISTS idx_rfp_match_suggestions_item_id ON rfp_match_suggestions(rfp_item_id);
CREATE INDEX IF NOT EXISTS idx_rfp_match_suggestions_confidence ON rfp_match_suggestions(similarity_score DESC);
CREATE INDEX IF NOT EXISTS idx_rfp_match_suggestions_artigo ON rfp_match_suggestions(artigo);

-- =============================================
-- Foreign key for selected_match_id (add after both tables exist)
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_selected_match'
  ) THEN
    ALTER TABLE rfp_items
    ADD CONSTRAINT fk_selected_match
    FOREIGN KEY (selected_match_id) REFERENCES rfp_match_suggestions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =============================================
-- RLS Policies
-- =============================================
ALTER TABLE rfp_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfp_match_suggestions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view own rfp items" ON rfp_items;
DROP POLICY IF EXISTS "Users can update own rfp items" ON rfp_items;
DROP POLICY IF EXISTS "Users can view own match suggestions" ON rfp_match_suggestions;
DROP POLICY IF EXISTS "Service role can manage rfp items" ON rfp_items;
DROP POLICY IF EXISTS "Service role can manage match suggestions" ON rfp_match_suggestions;

-- Users can view items from their own jobs
CREATE POLICY "Users can view own rfp items"
  ON rfp_items FOR SELECT
  USING (
    job_id IN (SELECT id FROM rfp_upload_jobs WHERE user_id = auth.uid())
  );

-- Users can update items from their own jobs (for accept/reject)
CREATE POLICY "Users can update own rfp items"
  ON rfp_items FOR UPDATE
  USING (
    job_id IN (SELECT id FROM rfp_upload_jobs WHERE user_id = auth.uid())
  );

-- Users can view match suggestions for their items
CREATE POLICY "Users can view own match suggestions"
  ON rfp_match_suggestions FOR SELECT
  USING (
    rfp_item_id IN (
      SELECT id FROM rfp_items WHERE job_id IN (
        SELECT id FROM rfp_upload_jobs WHERE user_id = auth.uid()
      )
    )
  );

-- Users can update match suggestions for their items (for accept/reject)
CREATE POLICY "Users can update own match suggestions"
  ON rfp_match_suggestions FOR UPDATE
  USING (
    rfp_item_id IN (
      SELECT id FROM rfp_items WHERE job_id IN (
        SELECT id FROM rfp_upload_jobs WHERE user_id = auth.uid()
      )
    )
  );

-- Service role can do everything (for n8n inserts)
CREATE POLICY "Service role can manage rfp items"
  ON rfp_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage match suggestions"
  ON rfp_match_suggestions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================
-- Trigger for updated_at
-- =============================================
DROP TRIGGER IF EXISTS rfp_items_updated_at ON rfp_items;
CREATE TRIGGER rfp_items_updated_at
  BEFORE UPDATE ON rfp_items
  FOR EACH ROW
  EXECUTE FUNCTION update_rfp_job_updated_at();

-- =============================================
-- Grants
-- =============================================
GRANT SELECT, UPDATE ON rfp_items TO authenticated;
GRANT SELECT, UPDATE ON rfp_match_suggestions TO authenticated;
GRANT ALL ON rfp_items TO service_role;
GRANT ALL ON rfp_match_suggestions TO service_role;

-- =============================================
-- Enable Realtime for live updates
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'rfp_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE rfp_items;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'rfp_match_suggestions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE rfp_match_suggestions;
  END IF;
END $$;
