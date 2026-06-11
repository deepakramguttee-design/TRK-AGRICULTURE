-- ============================================================
-- TRK AGRICULTURE LIMITED — Schéma complet Supabase
-- ============================================================
-- À exécuter dans Supabase SQL Editor AVANT seed_prices.sql
-- Compatible Postgres 15+ / Supabase
--
-- Tables :
--   1. categories          — Épices, Salades, Brèdes, Légumes, Melons
--   2. products            — Catalogue (32 items)
--   3. production_lots     — Lots de production (saisons, disponibilité)
--   4. delivery_zones      — 9 districts Maurice
--   5. customers           — Profils B2C et B2B (extends auth.users)
--   6. addresses           — Adresses de livraison
--   7. orders              — Commandes
--   8. order_items         — Lignes de commande
--   9. b2b_subscriptions   — Abonnements récurrents hôtels/restos
--  10. subscription_items  — Items dans chaque abonnement
--  11. deliveries          — Suivi des livraisons
--  12. testimonials        — Témoignages clients (pour vitrine)
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          text PRIMARY KEY,           -- 'epices', 'salades', ...
  name_fr     text NOT NULL,
  name_en     text NOT NULL,
  slug        text UNIQUE NOT NULL,
  description_fr text,
  description_en text,
  icon        text,                       -- nom lucide-react
  color_hex   text,                       -- couleur badge
  sort_order  int DEFAULT 0,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

INSERT INTO categories (id, name_fr, name_en, slug, icon, color_hex, sort_order) VALUES
  ('epices',  'Épices & Aromates', 'Herbs & Spices',  'epices',  'Sprout',     '#f59e0b', 1),
  ('salades', 'Salades',           'Salads',          'salades', 'Salad',      '#84cc16', 2),
  ('bredes',  'Brèdes',            'Mauritian Greens','bredes',  'Leaf',       '#10b981', 3),
  ('legumes', 'Légumes variés',    'Vegetables',      'legumes', 'Carrot',     '#16a34a', 4),
  ('melons',  'Melons & Pastèques','Melons',          'melons',  'CircleDot',  '#f97316', 5)
ON CONFLICT (id) DO UPDATE SET
  name_fr=EXCLUDED.name_fr, name_en=EXCLUDED.name_en, slug=EXCLUDED.slug,
  icon=EXCLUDED.icon, color_hex=EXCLUDED.color_hex, sort_order=EXCLUDED.sort_order;

-- ============================================================
-- 2. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku             text UNIQUE NOT NULL,
  name_fr         text NOT NULL,
  name_en         text,
  category        text NOT NULL REFERENCES categories(id),
  price_mur       numeric(10,2) NOT NULL CHECK (price_mur >= 0),
  unit            text NOT NULL DEFAULT 'plant',
  description_fr  text,
  description_en  text,
  image_url       text,
  is_active       boolean DEFAULT true,
  is_seasonal     boolean DEFAULT false,
  stock_alert     int DEFAULT 50,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- ============================================================
-- 3. PRODUCTION LOTS — tracking saisons / disponibilité
-- ============================================================
CREATE TABLE IF NOT EXISTS production_lots (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  lot_code        text UNIQUE NOT NULL,    -- ex: LOT-2026-W23-EPI001
  sown_date       date NOT NULL,           -- date de semis
  available_from  date NOT NULL,           -- date de disponibilité
  available_until date,                    -- fin de disponibilité
  initial_qty     int NOT NULL CHECK (initial_qty > 0),
  current_qty     int NOT NULL CHECK (current_qty >= 0),
  greenhouse      text,                    -- "Serre A", "Champ Nord"
  notes           text,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lots_product ON production_lots(product_id);
CREATE INDEX IF NOT EXISTS idx_lots_available ON production_lots(available_from, available_until);

-- ============================================================
-- 4. DELIVERY ZONES — 9 districts de Maurice
-- ============================================================
CREATE TABLE IF NOT EXISTS delivery_zones (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district        text UNIQUE NOT NULL,
  district_en     text NOT NULL,
  base_fee_mur    numeric(10,2) NOT NULL DEFAULT 0,
  free_threshold  numeric(10,2),           -- montant à partir duquel livraison gratuite
  delivery_days   text[] DEFAULT '{Mon,Tue,Wed,Thu,Fri,Sat}',
  estimated_hours int DEFAULT 24,
  is_active       boolean DEFAULT true
);

INSERT INTO delivery_zones (district, district_en, base_fee_mur, free_threshold) VALUES
  ('Port Louis',           'Port Louis',          150, 2000),
  ('Pamplemousses',        'Pamplemousses',       150, 2000),
  ('Rivière du Rempart',   'Rivière du Rempart',  200, 2500),
  ('Flacq',                'Flacq',               200, 2500),
  ('Grand Port',           'Grand Port',          200, 2500),
  ('Savanne',              'Savanne',             250, 3000),
  ('Plaines Wilhems',      'Plaines Wilhems',     150, 2000),
  ('Moka',                 'Moka',                150, 2000),
  ('Black River',          'Black River',         250, 3000)
ON CONFLICT (district) DO NOTHING;

-- ============================================================
-- 5. CUSTOMERS — profils étendus auth.users
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text NOT NULL,
  full_name     text,
  phone         text,
  account_type  text NOT NULL DEFAULT 'b2c' CHECK (account_type IN ('b2c', 'b2b')),
  company_name  text,
  business_brn  text,                      -- Business Registration Number Maurice
  preferred_lang text DEFAULT 'fr' CHECK (preferred_lang IN ('fr', 'en')),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ============================================================
-- 6. ADDRESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS addresses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label           text,                    -- "Maison", "Bureau"
  street_line1    text NOT NULL,
  street_line2    text,
  city            text NOT NULL,
  district        text NOT NULL REFERENCES delivery_zones(district),
  postal_code     text,
  phone           text,
  delivery_notes  text,
  is_default      boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addresses_customer ON addresses(customer_id);

-- ============================================================
-- 7. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      text UNIQUE NOT NULL,  -- ex: TRK-20260610-0001
  customer_id       uuid REFERENCES customers(id),
  guest_email       text,                  -- pour commande sans compte
  guest_phone       text,
  delivery_address_id uuid REFERENCES addresses(id),
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','preparing','out_for_delivery','delivered','cancelled')),
  payment_method    text NOT NULL DEFAULT 'cod'
                    CHECK (payment_method IN ('cod','mips_card','pop','my_t_money','juice','bank_transfer')),
  payment_status    text NOT NULL DEFAULT 'pending'
                    CHECK (payment_status IN ('pending','paid','failed','refunded')),
  subtotal_mur      numeric(10,2) NOT NULL,
  delivery_fee_mur  numeric(10,2) NOT NULL DEFAULT 0,
  total_mur         numeric(10,2) NOT NULL,
  customer_notes    text,
  internal_notes    text,
  requested_date    date,
  delivered_at      timestamptz,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- ============================================================
-- 8. ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES products(id),
  product_sku   text NOT NULL,             -- snapshot SKU
  product_name  text NOT NULL,             -- snapshot nom
  unit_price_mur numeric(10,2) NOT NULL,   -- snapshot prix
  quantity      int NOT NULL CHECK (quantity > 0),
  line_total_mur numeric(10,2) NOT NULL,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================================
-- 9. B2B SUBSCRIPTIONS — hôtels & restaurants
-- ============================================================
CREATE TABLE IF NOT EXISTS b2b_subscriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  subscription_name text NOT NULL,         -- "Livraison hebdo Hôtel Sands"
  frequency       text NOT NULL CHECK (frequency IN ('weekly','biweekly','monthly')),
  delivery_day    text,                    -- "Mon", "Wed"
  next_delivery   date,
  delivery_address_id uuid REFERENCES addresses(id),
  status          text NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','paused','cancelled')),
  discount_pct    numeric(5,2) DEFAULT 0 CHECK (discount_pct BETWEEN 0 AND 100),
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ============================================================
-- 10. SUBSCRIPTION ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS subscription_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES b2b_subscriptions(id) ON DELETE CASCADE,
  product_id      uuid NOT NULL REFERENCES products(id),
  quantity        int NOT NULL CHECK (quantity > 0),
  UNIQUE (subscription_id, product_id)
);

-- ============================================================
-- 11. DELIVERIES — suivi
-- ============================================================
CREATE TABLE IF NOT EXISTS deliveries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid REFERENCES orders(id),
  subscription_id uuid REFERENCES b2b_subscriptions(id),
  driver_name   text,
  driver_phone  text,
  vehicle_plate text,
  scheduled_at  timestamptz NOT NULL,
  picked_up_at  timestamptz,
  delivered_at  timestamptz,
  proof_url     text,                      -- photo/signature
  status        text NOT NULL DEFAULT 'scheduled'
                CHECK (status IN ('scheduled','in_transit','delivered','failed')),
  notes         text,
  created_at    timestamptz DEFAULT now(),
  CHECK ((order_id IS NOT NULL) OR (subscription_id IS NOT NULL))
);

-- ============================================================
-- 12. TESTIMONIALS — pour la vitrine
-- ============================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name   text NOT NULL,
  author_role   text,                      -- "Chef, Hôtel Sands"
  content_fr    text NOT NULL,
  content_en    text,
  rating        int CHECK (rating BETWEEN 1 AND 5),
  avatar_url    text,
  is_featured   boolean DEFAULT false,
  is_published  boolean DEFAULT true,
  sort_order    int DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- ============================================================
-- 13. B2B INQUIRIES — demandes de devis B2B (pré-inscription)
-- ============================================================
CREATE TABLE IF NOT EXISTS b2b_inquiries (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_type         text NOT NULL,
  business_name         text NOT NULL,
  contact_name          text NOT NULL,
  email                 text NOT NULL,
  phone                 text NOT NULL,
  estimated_volume      text NOT NULL,
  varieties_interested  text[] DEFAULT '{}',
  message               text,
  status                text NOT NULL DEFAULT 'new'
                        CHECK (status IN ('new','contacted','converted','closed')),
  created_at            timestamptz DEFAULT now()
);

ALTER TABLE b2b_inquiries ENABLE ROW LEVEL SECURITY;
-- Toute personne peut soumettre une demande (anon + authenticated)
CREATE POLICY "Anyone can insert b2b_inquiry" ON b2b_inquiries
  FOR INSERT WITH CHECK (true);
-- Seul le service_role (admin) peut lire/modifier
-- (pas de policy SELECT/UPDATE publique)

-- ============================================================
-- TRIGGER : auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated ON products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_customers_updated ON customers;
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated ON orders;
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_subs_updated ON b2b_subscriptions;
CREATE TRIGGER trg_subs_updated BEFORE UPDATE ON b2b_subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TRIGGER : auto-create customer profile on auth.users insert
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.customers (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TRIGGER : auto-generate order_number
-- ============================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS trigger AS $$
DECLARE
  date_part text;
  seq_part int;
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    date_part := to_char(now(), 'YYYYMMDD');
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'TRK-\d{8}-(\d+)') AS int)), 0) + 1
      INTO seq_part
      FROM orders
      WHERE order_number LIKE 'TRK-' || date_part || '-%';
    NEW.order_number := 'TRK-' || date_part || '-' || LPAD(seq_part::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_number ON orders;
CREATE TRIGGER trg_order_number BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Lecture publique des données catalogue (vitrine sans login)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (is_active = true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active products" ON products FOR SELECT USING (is_active = true);

ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read delivery zones" ON delivery_zones FOR SELECT USING (is_active = true);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published testimonials" ON testimonials FOR SELECT USING (is_published = true);

-- Customers ne voient que leur propre profil
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON customers FOR UPDATE USING (auth.uid() = id);

-- Addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own addresses" ON addresses FOR ALL USING (auth.uid() = customer_id);

-- Orders : un user voit ses propres orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = customer_id OR customer_id IS NULL);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own order items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()));

-- B2B subscriptions
ALTER TABLE b2b_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "B2B users manage own subscriptions" ON b2b_subscriptions FOR ALL USING (auth.uid() = customer_id);

ALTER TABLE subscription_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "B2B users manage own subscription items" ON subscription_items FOR ALL
  USING (EXISTS (SELECT 1 FROM b2b_subscriptions WHERE b2b_subscriptions.id = subscription_items.subscription_id AND b2b_subscriptions.customer_id = auth.uid()));

-- Production lots et deliveries : admin only (à gérer via service_role côté back-office)
ALTER TABLE production_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
-- Pas de policy publique → seul le service_role peut accéder (= back-office admin)

-- ============================================================
-- STORAGE BUCKET (à créer manuellement dans le dashboard)
-- ============================================================
-- 1. Storage → New bucket → name: "product-images" → public: true
-- 2. Storage → New bucket → name: "testimonial-avatars" → public: true
-- 3. Storage → New bucket → name: "delivery-proofs" → public: false (privé)

-- ============================================================
-- FIN DU SCHÉMA
-- ============================================================
-- Étape suivante : exécuter seed_prices.sql pour peupler products
