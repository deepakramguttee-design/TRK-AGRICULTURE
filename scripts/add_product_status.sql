-- Migration : ajout du champ status sur la table products
-- À exécuter dans le SQL Editor de Supabase (projet antzilughrlupmizmphk)
-- Valeurs autorisées : 'available' | 'in_production' | 'coming_soon'

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS status text
    NOT NULL
    DEFAULT 'available'
    CHECK (status IN ('available', 'in_production', 'coming_soon'));

-- Vérification
SELECT sku, name_fr, status FROM products ORDER BY category, name_fr LIMIT 10;
