-- ============================================================
-- Security hardening — TRK Agriculture
-- Run in Supabase SQL Editor
-- ============================================================


-- ── 1. Prevent users from promoting their own role ────────────
-- Without this, any authenticated user could run:
--   UPDATE profiles SET role = 'admin' WHERE id = auth.uid()

CREATE OR REPLACE FUNCTION prevent_self_role_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- No change to role — allow
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;
  -- Caller is admin — allow
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'Modification du rôle non autorisée';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_role_change ON profiles;
CREATE TRIGGER trg_prevent_self_role_change
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_self_role_change();


-- ── 2. Prevent customers from modifying their own discount ────
-- Without this, any authenticated user could run:
--   UPDATE customers SET discount_pct = 100 WHERE id = auth.uid()

CREATE OR REPLACE FUNCTION prevent_self_discount_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- No change to discount_pct — allow
  IF NEW.discount_pct IS NOT DISTINCT FROM OLD.discount_pct THEN
    RETURN NEW;
  END IF;
  -- Caller is admin — allow
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'Modification de la remise non autorisée';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_discount ON customers;
CREATE TRIGGER trg_prevent_self_discount
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION prevent_self_discount_change();


-- ── 3. Tighten order_items INSERT policy ──────────────────────
-- Checkout now goes through the place-order Edge Function (service role).
-- Direct inserts via the anon key are blocked except for staff.

DROP POLICY IF EXISTS "order_items_insert_any" ON order_items;

CREATE POLICY "order_items_insert_staff"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'operator')
    )
  );


-- ── 4. Allow customers to submit their Juice transaction ID ───
-- Narrowly scoped: only provider_txn_id, only on their own Juice
-- orders that are still pending. Column-level enforcement is in
-- the app — RLS only guards the row.

DROP POLICY IF EXISTS "orders_update_juice_txn" ON orders;
CREATE POLICY "orders_update_juice_txn"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    customer_id = auth.uid()
    AND payment_method = 'juice'
    AND payment_status = 'pending'
  )
  WITH CHECK (
    customer_id = auth.uid()
    AND payment_method = 'juice'
    AND payment_status = 'pending'
  );
