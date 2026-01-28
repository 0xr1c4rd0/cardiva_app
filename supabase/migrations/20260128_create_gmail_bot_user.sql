-- ============================================================================
-- Create Gmail Bot automation user
-- Migration: 20260128_create_gmail_bot_user.sql
-- ============================================================================
--
-- IMPORTANT: This migration will create an auth user and profile for the Gmail bot.
-- After running this migration, you need to:
-- 1. Note the generated UUID from the output
-- 2. Update your n8n workflow with this user_id
-- ============================================================================

-- Generate a deterministic UUID for the Gmail bot
-- This way we can reference it in code if needed
DO $$
DECLARE
  gmail_bot_id UUID := gen_random_uuid();
BEGIN
  -- Create auth user for Gmail bot
  -- Note: This approach uses raw auth.users insert which requires superuser
  -- Alternative: Create through Supabase Dashboard > Authentication > Users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
  ) VALUES (
    gmail_bot_id,
    '00000000-0000-0000-0000-000000000000',
    'gmail-bot@cardiva.internal',
    crypt('AUTOMATION_ACCOUNT_NO_LOGIN', gen_salt('bf')), -- Random password, user can't login
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Gmail Bot"}',
    false,
    'authenticated',
    'authenticated'
  );

  -- Create profile with automation role
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    approved_at,
    created_at,
    updated_at
  ) VALUES (
    gmail_bot_id,
    'gmail-bot@cardiva.internal',
    'Gmail',
    'Bot',
    'automation',
    NOW(), -- Pre-approved
    NOW(),
    NOW()
  );

  -- Output the UUID for reference
  RAISE NOTICE 'Gmail Bot User ID: %', gmail_bot_id;
  RAISE NOTICE 'Update your n8n workflow with this user_id in the "Create Email RFP Job" node';
END $$;
