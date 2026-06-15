-- Insertion de 5 nouveaux produits — TRK Agriculture
-- À exécuter dans le SQL Editor Supabase (projet antzilughrlupmizmphk)

INSERT INTO public.products (sku, name_fr, name_en, category, price_mur, unit, is_active)
VALUES
  ('LEG-026', 'Betterave',      'Beetroot',       'legumes', 300, 'plant', true),
  ('LEG-027', 'Poireau',        'Leek',            'legumes', 300, 'plant', true),
  ('LEG-028', 'Oignon Francia', 'Onion Francia',   'legumes', 300, 'plant', true),
  ('LEG-029', 'Oignon Rosada',  'Onion Rosada',    'legumes', 300, 'plant', true),
  ('LEG-030', 'Oignon Rubex',   'Onion Rubex',     'legumes', 300, 'plant', true)
ON CONFLICT (sku) DO NOTHING;

-- Vérification
SELECT sku, name_fr, name_en, category, price_mur, unit, is_active
FROM public.products
WHERE sku IN ('LEG-026','LEG-027','LEG-028','LEG-029','LEG-030')
ORDER BY sku;
