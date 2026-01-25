-- Export Column Configuration
--
-- This table allows admins to configure which columns from rfp_items and
-- rfp_match_suggestions tables are included in exports, and how they should be labeled.
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard -> SQL Editor
-- 2. Paste and run this script
-- 3. After running, configure columns via the admin UI or directly in the table

-- ============================================================================
-- Step 1: Create the export column configuration table
-- ============================================================================

CREATE TABLE public.export_column_config (
  id SERIAL PRIMARY KEY,
  source_table TEXT NOT NULL,              -- 'rfp_items' or 'rfp_match_suggestions'
  column_name TEXT NOT NULL,               -- Actual column name in source table
  display_name TEXT NOT NULL,              -- Label shown in Excel header
  visible BOOLEAN NOT NULL DEFAULT true,   -- Whether to include in export
  display_order INT NOT NULL DEFAULT 0,    -- Order of columns (lower = first)
  column_type TEXT DEFAULT 'text',         -- text, number, currency, date
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(source_table, column_name)
);

-- Add comment for documentation
COMMENT ON TABLE public.export_column_config IS 'Configuration for export columns from RFP tables';
COMMENT ON COLUMN public.export_column_config.source_table IS 'Source table: rfp_items or rfp_match_suggestions';
COMMENT ON COLUMN public.export_column_config.column_name IS 'Actual database column name';
COMMENT ON COLUMN public.export_column_config.display_name IS 'Display name shown in export headers';
COMMENT ON COLUMN public.export_column_config.visible IS 'Whether this column is included in exports';
COMMENT ON COLUMN public.export_column_config.display_order IS 'Order of columns in export (lower = first)';
COMMENT ON COLUMN public.export_column_config.column_type IS 'Data type hint: text, number, currency, date';

-- ============================================================================
-- Step 2: Enable Row Level Security
-- ============================================================================

ALTER TABLE public.export_column_config ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Step 3: Create RLS policies
-- ============================================================================

-- All authenticated users can read column config
CREATE POLICY "Authenticated users can read export column config"
  ON public.export_column_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify column config
CREATE POLICY "Admins can manage export column config"
  ON public.export_column_config
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() ->> 'user_role') = 'admin'
  );

-- ============================================================================
-- Step 4: Create updated_at trigger
-- ============================================================================

CREATE TRIGGER update_export_column_config_updated_at
  BEFORE UPDATE ON public.export_column_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Step 5: Create function to auto-discover columns from RFP tables
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_export_columns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  col RECORD;
  col_order INT := 0;
  tbl TEXT;
BEGIN
  -- Process both rfp_items and rfp_match_suggestions tables
  FOREACH tbl IN ARRAY ARRAY['rfp_items', 'rfp_match_suggestions']
  LOOP
    col_order := 0;  -- Reset order for each table

    -- Get all columns from the current table
    FOR col IN
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = tbl
      ORDER BY ordinal_position
    LOOP
      -- Insert column if it doesn't exist
      INSERT INTO public.export_column_config (
        source_table,
        column_name,
        display_name,
        visible,
        display_order,
        column_type
      )
      VALUES (
        tbl,
        col.column_name,
        -- Convert snake_case to Title Case for display
        INITCAP(REPLACE(col.column_name, '_', ' ')),
        -- Hide system columns and embeddings by default
        CASE WHEN col.column_name IN ('id', 'created_at', 'updated_at', 'embedding')
             THEN false ELSE true END,
        col_order,
        -- Map database types to display types
        CASE
          WHEN col.data_type IN ('numeric', 'decimal', 'money') THEN 'currency'
          WHEN col.data_type IN ('integer', 'bigint', 'smallint', 'real', 'double precision') THEN 'number'
          WHEN col.data_type IN ('timestamp', 'timestamptz', 'date', 'time') THEN 'date'
          ELSE 'text'
        END
      )
      ON CONFLICT (source_table, column_name) DO NOTHING;

      col_order := col_order + 1;
    END LOOP;
  END LOOP;
END;
$$;

-- Add comment for function
COMMENT ON FUNCTION public.sync_export_columns() IS 'Auto-discovers columns from rfp_items and rfp_match_suggestions tables';

-- ============================================================================
-- Step 6: Run initial sync to populate columns
-- ============================================================================

SELECT public.sync_export_columns();

-- ============================================================================
-- Migration Complete
-- ============================================================================
--
-- After running this migration:
-- 1. Check the export_column_config table to see discovered columns
-- 2. Update display_name values to match your preferred labels (e.g., Portuguese)
-- 3. Set visible=false for columns you want to exclude from exports
-- 4. Adjust display_order to change column order in exports
--
-- To re-sync columns after schema changes, run:
-- SELECT public.sync_export_columns();
--
-- Note: The sync function will not overwrite existing configurations,
-- it only adds new columns that don't exist yet.
