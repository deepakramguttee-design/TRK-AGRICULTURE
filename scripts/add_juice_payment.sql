-- ============================================================
-- Migration : Juice payment support + colonnes génériques V2
-- À coller dans Supabase SQL Editor et exécuter UNE SEULE FOIS
-- ============================================================

-- 1. Colonnes génériques (idempotent via IF NOT EXISTS)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_provider  text;          -- 'manual' | 'peach' | 'mips'
ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider_txn_id   text;          -- ID externe (= juice_transaction_ref en V1)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at           timestamptz;   -- horodatage confirmation paiement

-- 2. Rafraîchit le CHECK payment_method pour inclure 'juice'
--    (la contrainte peut être plus restrictive sur la DB live vs schema.sql)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders ADD  CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('cod', 'juice', 'mips_card', 'pop', 'my_t_money', 'bank_transfer'));

-- 3. Index performance pour les requêtes admin
CREATE INDEX IF NOT EXISTS idx_orders_payment
  ON orders (payment_method, payment_status);
