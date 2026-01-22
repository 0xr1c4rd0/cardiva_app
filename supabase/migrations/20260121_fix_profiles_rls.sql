-- Fix: Profiles RLS Policy Infinite Recursion
--
-- PROBLEM: The "Admins can read all profiles" policy queries the profiles table
-- within the RLS check, causing infinite recursion.
--
-- SOLUTION: Use JWT claims (user_role) instead of querying the profiles table.
-- The Custom Access Token Hook already injects the role into JWT claims.
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard -> SQL Editor
-- 2. Paste and run this script
-- 3. Verify the policies work by testing login

-- ============================================================================
-- Step 1: Drop the problematic policies
-- ============================================================================

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- ============================================================================
-- Step 2: Recreate policies using JWT claims (no recursion)
-- ============================================================================

-- Admins can read all profiles (using JWT claim)
-- Uses ->> operator to extract text value directly from JWT
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_role') = 'admin'
  );

-- Admins can update any profile (using JWT claim)
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_role') = 'admin'
  );

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- The policies now use JWT claims instead of querying the profiles table,
-- avoiding the infinite recursion issue.
--
-- Note: The JWT claim value is a JSON string, so we compare to '"admin"' (with quotes)
