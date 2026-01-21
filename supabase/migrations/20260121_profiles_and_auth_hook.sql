-- Phase 2: Authentication - Profiles table and Custom Access Token Hook
--
-- INSTRUCTIONS FOR MANUAL EXECUTION:
--
-- 1. Copy this entire SQL script
-- 2. Go to Supabase Dashboard -> SQL Editor
-- 3. Click "New query" and paste this script
-- 4. Click "Run" to execute
-- 5. After successful execution, enable the Custom Access Token Hook:
--    - Go to Dashboard -> Authentication -> Hooks
--    - Find "custom_access_token_hook" in the dropdown
--    - Select "public.custom_access_token_hook" from the function list
--    - Click "Enable Hook"
-- 6. Disable email confirmation for simpler approval flow:
--    - Go to Dashboard -> Authentication -> Providers -> Email
--    - Toggle OFF "Confirm email"
--    - Click "Save"
--
-- This creates:
-- - user_role enum type (user, admin)
-- - profiles table with RLS policies
-- - Trigger to auto-create profile on user signup
-- - Custom Access Token Hook to inject role into JWT
-- - Trigger to auto-update updated_at timestamp

-- ============================================================================
-- Step 1: Create user_role enum type
-- ============================================================================

CREATE TYPE user_role AS ENUM ('user', 'admin');

-- ============================================================================
-- Step 2: Create profiles table
-- ============================================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Step 3: Enable Row Level Security
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Step 4: Create RLS policies
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================================
-- Step 5: Create trigger to auto-create profile on user signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Step 6: Create Custom Access Token Hook function
-- This injects the user role into JWT claims
-- ============================================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims JSONB;
  user_role_value user_role;
BEGIN
  -- Fetch user role from profiles table
  SELECT role INTO user_role_value
  FROM public.profiles
  WHERE id = (event->>'user_id')::UUID;

  -- Get existing claims
  claims := event->'claims';

  -- Add user_role to claims
  IF user_role_value IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role_value));
  ELSE
    claims := jsonb_set(claims, '{user_role}', 'null');
  END IF;

  -- Update the claims in the event
  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$$;

-- ============================================================================
-- Step 7: Grant execute permission to supabase_auth_admin
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Revoke from public and authenticated (security)
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated;

-- ============================================================================
-- Step 8: Create updated_at trigger for profiles
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Next steps:
-- 1. Enable Custom Access Token Hook in Dashboard (see instructions above)
-- 2. Disable email confirmation in Dashboard (see instructions above)
-- 3. Set SUPABASE_SERVICE_ROLE_KEY in .env.local for admin operations
