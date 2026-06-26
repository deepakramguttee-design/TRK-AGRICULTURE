-- ============================================================
-- MIGRATION 002 — Fix account_type CHECK constraint
-- The app uses 'retail' but schema only allowed 'b2c'/'b2b'
-- Run in Supabase SQL Editor
-- ============================================================

-- Drop old constraint
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_account_type_check;

-- Add corrected constraint that matches all values used in code
ALTER TABLE customers
  ADD CONSTRAINT customers_account_type_check
  CHECK (account_type IN ('b2c', 'b2b', 'retail'));

-- Normalize legacy values: treat 'retail' as synonym for 'b2c' where needed
-- (leave 'retail' as-is since the app writes it; constraint now accepts it)
