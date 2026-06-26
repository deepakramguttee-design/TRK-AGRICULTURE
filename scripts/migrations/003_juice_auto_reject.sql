-- ============================================================
-- MIGRATION 003 — Auto-reject unpaid Juice orders after 5 hours
-- Requires pg_cron extension (available on Supabase Pro)
-- Run in Supabase SQL Editor
-- ============================================================

-- Enable pg_cron (Supabase Pro only — skip if on free tier)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function to cancel stale Juice orders
CREATE OR REPLACE FUNCTION cancel_stale_juice_orders()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE orders
  SET
    status         = 'cancelled',
    payment_status = 'failed',
    internal_notes = COALESCE(internal_notes || E'\n', '') ||
                     'Auto-annulé : paiement Juice non validé dans les 5 heures.'
  WHERE
    payment_method  = 'juice'
    AND payment_status = 'pending'
    AND status NOT IN ('cancelled', 'delivered')
    AND created_at < now() - interval '5 hours';
END;
$$;

-- Schedule: run every 30 minutes
SELECT cron.schedule(
  'cancel-stale-juice-orders',
  '*/30 * * * *',
  $$ SELECT cancel_stale_juice_orders(); $$
);

-- ── FALLBACK: if on free tier (no pg_cron), call this Edge Function instead ──
-- Deploy supabase/functions/cancel-stale-juice/index.ts and invoke via
-- an external cron (e.g., cron-job.org hitting the function URL every 30min).
-- The function must use the service_role key to bypass RLS.
