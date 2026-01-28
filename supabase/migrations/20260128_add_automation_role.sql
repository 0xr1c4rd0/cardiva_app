-- ============================================================================
-- Add 'automation' role type for service accounts (e.g., Gmail bot)
-- Migration: 20260128_add_automation_role.sql
-- ============================================================================

-- Add 'automation' to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'automation';

-- Add comment explaining the automation role
COMMENT ON TYPE user_role IS 'User roles: user (regular), admin (administrator), automation (service accounts like Gmail bot)';
