-- ============================================================
-- RLS policies : role employee (operator) — TRK Agriculture
-- ============================================================
-- Employees (role = 'operator') :
--   - products  : SELECT seulement (lecture catalogue), pas de INSERT/UPDATE/DELETE
--   - profiles  : SELECT de leur propre profil seulement
-- ============================================================

-- ── PRODUCTS ─────────────────────────────────────────────────
-- S'assurer que RLS est activé sur la table products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Lecture publique (catalogue vitrine + admin employee)
DROP POLICY IF EXISTS "products_select_all" ON products;
CREATE POLICY "products_select_all"
  ON products FOR SELECT
  USING (true);

-- Insert : admins uniquement
DROP POLICY IF EXISTS "products_insert_admin" ON products;
CREATE POLICY "products_insert_admin"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update : admins uniquement
DROP POLICY IF EXISTS "products_update_admin" ON products;
CREATE POLICY "products_update_admin"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Delete : admins uniquement
DROP POLICY IF EXISTS "products_delete_admin" ON products;
CREATE POLICY "products_delete_admin"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── PROFILES ─────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Chaque utilisateur peut lire son propre profil
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Les admins peuvent lire tous les profils (liste utilisateurs)
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Les admins peuvent mettre à jour les profils (changer les rôles)
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Chaque utilisateur peut mettre à jour son propre profil
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ── NOTE CHIFFRE D'AFFAIRES ───────────────────────────────────
-- Le CA est calculé depuis la table orders. Les employees ont
-- besoin d'accès SELECT sur orders pour gérer les commandes.
-- Le masquage du CA est géré au niveau UI (AdminDashboard).
-- Une restriction RLS complète nécessiterait une vue dédiée
-- (ex: orders_revenue) accessible aux admins uniquement.
