-- Migration: Add performance indexes for common query patterns
-- Phase 2 of Performance Optimization Plan
--
-- Existing indexes (already created in 20260122_rfp_match_results.sql):
--   idx_rfp_items_job_id, idx_rfp_items_review_status
--   idx_rfp_match_suggestions_item_id, idx_rfp_match_suggestions_artigo
--
-- This migration adds missing indexes for common query patterns.

-- =============================================
-- 1. Index on rfp_match_suggestions.status
--    Used in: batch reject queries, status filtering
-- =============================================
CREATE INDEX IF NOT EXISTS idx_rfp_match_suggestions_status
ON rfp_match_suggestions(status);

-- =============================================
-- 2. Index on artigos.artigo
--    Used in: FK lookup for descricao_comercial join
--    Critical for N+1 fix query performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_artigos_artigo
ON artigos(artigo);

-- =============================================
-- 3. Composite index on rfp_items (job_id, review_status)
--    Used in: autoAcceptExactMatches, status-filtered queries
--    More efficient than separate indexes for combined filters
-- =============================================
CREATE INDEX IF NOT EXISTS idx_rfp_items_job_status
ON rfp_items(job_id, review_status);

-- =============================================
-- 4. Composite index on rfp_match_suggestions (rfp_item_id, status)
--    Used in: checking remaining matches after reject
--    Covers both FK lookup and status filter in one scan
-- =============================================
CREATE INDEX IF NOT EXISTS idx_rfp_match_suggestions_item_status
ON rfp_match_suggestions(rfp_item_id, status);

-- =============================================
-- 5. Index on artigos.descricao for search queries
--    Used in: manual match search (searchInventory action)
-- =============================================
CREATE INDEX IF NOT EXISTS idx_artigos_descricao_trgm
ON artigos USING gin(descricao gin_trgm_ops);

-- Note: gin_trgm_ops requires pg_trgm extension
-- If extension not enabled, this index will fail silently with IF NOT EXISTS
-- To enable: CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================
-- 6. Index on artigos.codigo_spms for search queries
--    Used in: manual match search (searchInventory action)
-- =============================================
CREATE INDEX IF NOT EXISTS idx_artigos_codigo_spms
ON artigos(codigo_spms);
