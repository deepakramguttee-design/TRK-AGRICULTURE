-- ============================================================
-- Schéma : comptes clients OTP + customer_id sur orders
-- À exécuter dans le SQL Editor Supabase
-- ============================================================

-- 1. customer_id sur orders (nullable = commande invité)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_id UUID
    REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders(customer_id);

-- 2. Adresse de livraison dans customers (pour pré-remplissage checkout)
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS address  TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT;

-- 3. Normaliser le rôle employee : 'employe' → 'operator'
--    (le code AuthContext attend 'operator')
UPDATE profiles SET role = 'operator' WHERE role = 'employe';

-- 4. Trigger : auto-création de la ligne customers après OTP inscription
--    (le trigger existant on_auth_user_created peut déjà exister - on le recrée)
CREATE OR REPLACE FUNCTION public.handle_new_customer()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Ne créer une ligne customers que si pas déjà admin/employee
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.customers (id, phone, account_type, preferred_lang)
    VALUES (
      NEW.id,
      NEW.phone,
      'retail',
      'fr'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_customer ON auth.users;
CREATE TRIGGER on_auth_user_created_customer
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_customer();

-- ── NOTE SMS OTP ──────────────────────────────────────────────
-- Config Supabase Dashboard → Authentication → Providers → Phone :
--   Provider : Twilio
--   Account SID : ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
--   Auth Token  : xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
--   Message Service SID (ou From) : +1xxxxxxxx (numéro Twilio)
--
-- Coût estimé vers Maurice :
--   Emtel  : ~$0.09/SMS  |  my.t : ~$0.10/SMS  |  Chili : ~$0.11/SMS
--   Tester manuellement avant la prod (les petits MNO locaux peuvent bloquer)
--
-- Alternative moins chère : MessageBird (~$0.065/SMS vers Maurice)
