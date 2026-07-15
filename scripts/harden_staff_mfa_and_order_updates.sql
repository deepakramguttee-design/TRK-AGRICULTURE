-- Migration : harden_staff_mfa_and_order_updates (appliquée 2026-07-15 via Supabase Management API)
-- Durcissement sécurité TRK Agriculture — voir mémoire trk-security-2026-07-10.
--
-- Contexte : is_staff()/is_admin() ne testaient que profiles.role. Une session
-- mot-de-passe-seul (AAL1) avait donc un accès staff/admin complet en tapant l'API
-- REST en direct, contournant le TOTP imposé côté front. Ce script exige aal2 (MFA).

-- ============================================================
-- HIGH : exiger aal2 (MFA) dans is_staff() / is_admin()
-- Durcit d'un coup TOUTES les policies qui les référencent.
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_staff()
  RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
  SELECT (auth.jwt() ->> 'aal') = 'aal2'
     AND EXISTS (
       SELECT 1 FROM public.profiles
       WHERE id = auth.uid() AND role IN ('admin', 'operator')
     );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
  SELECT (auth.jwt() ->> 'aal') = 'aal2'
     AND EXISTS (
       SELECT 1 FROM public.profiles
       WHERE id = auth.uid() AND role = 'admin'
     );
$function$;

-- order_items_insert_staff utilisait un check inline sans aal2 → aligner sur is_staff()
DROP POLICY IF EXISTS order_items_insert_staff ON public.order_items;
CREATE POLICY order_items_insert_staff ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

-- ============================================================
-- MED : un client ne peut modifier QUE provider_txn_id sur sa
-- propre commande (policy orders_update_juice_txn). service_role
-- (auth.uid IS NULL) et staff (aal2) passent librement.
-- ============================================================
CREATE OR REPLACE FUNCTION public.enforce_customer_order_update()
  RETURNS trigger
  LANGUAGE plpgsql SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  v_txn text;
BEGIN
  IF auth.uid() IS NULL OR public.is_staff() THEN
    RETURN NEW;
  END IF;
  v_txn := NEW.provider_txn_id;
  NEW := OLD;
  NEW.provider_txn_id := v_txn;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_enforce_customer_order_update ON public.orders;
CREATE TRIGGER trg_enforce_customer_order_update
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_customer_order_update();

-- ============================================================
-- Hardening : fonctions trigger non destinées au RPC public
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.enforce_delivery_enabled() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_customer_order_update() FROM PUBLIC, anon, authenticated;

-- ============================================================
-- Nettoyage : fonctions probe résiduelles (search_path mutable)
-- ============================================================
DO $cleanup$
DECLARE r record;
BEGIN
  FOR r IN SELECT oid::regprocedure AS sig FROM pg_proc
           WHERE proname IN ('_verifier_probe', '_verifier_probe2') LOOP
    EXECUTE 'DROP FUNCTION ' || r.sig;
  END LOOP;
END $cleanup$;
