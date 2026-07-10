-- ============================================================
-- PAUSE LIVRAISON (retrait / click & collect uniquement)
-- Appliqué en production le 2026-07-10 (project Supabase antzilughrlupmizmphk),
-- via 2 migrations : add_app_settings_and_fulfillment_type + enforce_delivery_enabled_trigger.
--
-- Interrupteur global : app_settings.delivery_enabled.
--   Suspendre  : UPDATE app_settings SET value='false' WHERE key='delivery_enabled';
--   Réactiver  : UPDATE app_settings SET value='true'  WHERE key='delivery_enabled';
-- (Aucun redéploiement : l'UI checkout et l'edge function place-order lisent le flag.)
-- ============================================================

-- 1) Table de configuration globale
CREATE TABLE IF NOT EXISTS public.app_settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.app_settings(key, value)
VALUES ('delivery_enabled', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS app_settings_read  ON public.app_settings;
DROP POLICY IF EXISTS app_settings_write ON public.app_settings;
CREATE POLICY app_settings_read  ON public.app_settings FOR SELECT USING (true);
CREATE POLICY app_settings_write ON public.app_settings FOR ALL   USING (is_admin()) WITH CHECK (is_admin());

-- 2) Helper
CREATE OR REPLACE FUNCTION public.is_delivery_enabled()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT value = 'true'::jsonb FROM app_settings WHERE key='delivery_enabled'), false)
$$;
REVOKE EXECUTE ON FUNCTION public.is_delivery_enabled() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.is_delivery_enabled() TO authenticated, service_role;

-- 3) Mode d'exécution structuré sur orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS fulfillment_type text NOT NULL DEFAULT 'delivery'
  CHECK (fulfillment_type IN ('delivery','pickup'));

UPDATE public.orders SET fulfillment_type = 'pickup'
WHERE customer_notes ILIKE '%retrait%' AND fulfillment_type = 'delivery';

-- 4) Backstop DB : rejette toute commande 'delivery' quand la livraison est suspendue
CREATE OR REPLACE FUNCTION public.enforce_delivery_enabled()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.fulfillment_type = 'delivery' AND NOT public.is_delivery_enabled() THEN
    RAISE EXCEPTION 'Livraison temporairement suspendue — retrait uniquement'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_enforce_delivery_enabled ON public.orders;
CREATE TRIGGER trg_enforce_delivery_enabled
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_delivery_enabled();
