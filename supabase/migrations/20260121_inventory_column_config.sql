-- Inventory Column Configuration
--
-- This table allows admins to configure which columns from the artigos table
-- are displayed in the inventory view, and how they should be labeled.
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard -> SQL Editor
-- 2. Paste and run this script
-- 3. After running, you can configure columns via the admin UI or directly in the table

-- ============================================================================
-- Step 1: Create the column configuration table
-- ============================================================================

CREATE TABLE public.inventory_column_config (
  id SERIAL PRIMARY KEY,
  column_name TEXT NOT NULL UNIQUE,        -- Actual column name in artigos table
  display_name TEXT NOT NULL,              -- Label shown in UI
  visible BOOLEAN NOT NULL DEFAULT true,   -- Whether to show this column
  sortable BOOLEAN NOT NULL DEFAULT true,  -- Whether column can be sorted
  searchable BOOLEAN NOT NULL DEFAULT false, -- Whether to include in search
  display_order INT NOT NULL DEFAULT 0,    -- Order of columns (lower = first)
  column_type TEXT DEFAULT 'text',         -- text, number, currency, date
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Step 2: Enable Row Level Security
-- ============================================================================

ALTER TABLE public.inventory_column_config ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Step 3: Create RLS policies
-- ============================================================================

-- All authenticated users can read column config
CREATE POLICY "Authenticated users can read column config"
  ON public.inventory_column_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify column config
CREATE POLICY "Admins can manage column config"
  ON public.inventory_column_config
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

CREATE TRIGGER update_inventory_column_config_updated_at
  BEFORE UPDATE ON public.inventory_column_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Step 5: Create function to auto-discover columns from artigos table
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_inventory_columns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  col RECORD;
  col_order INT := 0;
BEGIN
  -- Get all columns from artigos table
  FOR col IN
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'artigos'
    ORDER BY ordinal_position
  LOOP
    -- Insert column if it doesn't exist
    INSERT INTO public.inventory_column_config (
      column_name,
      display_name,
      visible,
      sortable,
      searchable,
      display_order,
      column_type
    )
    VALUES (
      col.column_name,
      -- Convert snake_case to Title Case for display
      INITCAP(REPLACE(col.column_name, '_', ' ')),
      -- Hide system columns by default
      CASE WHEN col.column_name IN ('id', 'created_at', 'updated_at') THEN false ELSE true END,
      true,
      -- Make text columns searchable by default
      CASE WHEN col.data_type IN ('text', 'character varying', 'varchar') THEN true ELSE false END,
      col_order,
      -- Map database types to display types
      CASE
        WHEN col.data_type IN ('numeric', 'decimal', 'money') THEN 'currency'
        WHEN col.data_type IN ('integer', 'bigint', 'smallint', 'real', 'double precision') THEN 'number'
        WHEN col.data_type IN ('timestamp', 'timestamptz', 'date', 'time') THEN 'date'
        ELSE 'text'
      END
    )
    ON CONFLICT (column_name) DO NOTHING;

    col_order := col_order + 1;
  END LOOP;
END;
$$;

-- ============================================================================
-- Step 6: Run initial sync to populate columns
-- ============================================================================

SELECT public.sync_inventory_columns();

-- ============================================================================
-- Migration Complete
-- ============================================================================
--
-- After running this migration:
-- 1. Check the inventory_column_config table to see discovered columns
-- 2. Update display_name values to match your preferred labels
-- 3. Set visible=false for columns you want to hide
-- 4. Adjust display_order to change column order
--
-- To re-sync columns after schema changes, run:
-- SELECT public.sync_inventory_columns();
