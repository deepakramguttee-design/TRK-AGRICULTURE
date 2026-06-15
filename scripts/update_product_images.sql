-- Mise à jour des images produits
-- Photos locales (pépinière TRK) dans public/products/ — servies depuis /products/<nom>.jpg
-- Photos restantes : Wikimedia Commons (licence CC)
-- À exécuter dans le SQL Editor du projet Supabase : antzilughrlupmizmphk

-- ─── ÉPICES — photos locales ──────────────────────────────────────────────────
UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Thyme-Bundle.jpg/330px-Thyme-Bundle.jpg'
  WHERE sku = 'EPI-001'; -- Thym (pas de photo locale)

UPDATE public.products SET image_url = '/products/persil-plat.jpg'
  WHERE sku = 'EPI-002'; -- Persil plat

UPDATE public.products SET image_url = '/products/persil-frise.jpg'
  WHERE sku = 'EPI-003'; -- Persil frisé

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Celery_1.jpg/330px-Celery_1.jpg'
  WHERE sku = 'EPI-004'; -- Céleri

-- ─── BRÈDES ───────────────────────────────────────────────────────────────────
UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Amaranthus_tricolor0.jpg/330px-Amaranthus_tricolor0.jpg'
  WHERE sku = 'BRE-001'; -- Brède Tom-pouce (amarante)

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/N_Ipoa_D1600.JPG/330px-N_Ipoa_D1600.JPG'
  WHERE sku = 'BRE-002'; -- Brède Bâton blanc (liseron d'eau)

UPDATE public.products SET image_url = '/products/petsai-pomme.jpg'
  WHERE sku = 'BRE-003'; -- Petsai pommé

UPDATE public.products SET image_url = '/products/petsai.jpg'
  WHERE sku = 'BRE-004'; -- Petsai blanc

-- ─── LÉGUMES — photos locales ─────────────────────────────────────────────────
UPDATE public.products SET image_url = '/products/pomme-d-amour.jpg'
  WHERE sku = 'LEG-005'; -- Pomme d'amour

UPDATE public.products SET image_url = '/products/pomme-d-amour-swaraksha.jpg'
  WHERE sku = 'LEG-006'; -- Pomme d'amour double (Swaraksha)

UPDATE public.products SET image_url = '/products/choufleur.jpg'
  WHERE sku = 'LEG-007'; -- Chou-fleur

UPDATE public.products SET image_url = '/products/choufleur-2.jpg'
  WHERE sku = 'LEG-008'; -- Chou-fleur tropicale

UPDATE public.products SET image_url = '/products/choufleur-cristalboy.jpg'
  WHERE sku = 'LEG-009'; -- Chou-fleur Cristalboy

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Chou-fleur_02.jpg/330px-Chou-fleur_02.jpg'
  WHERE sku = 'LEG-010'; -- Chou-fleur gros race

UPDATE public.products SET image_url = '/products/brocoli.jpg'
  WHERE sku = 'LEG-011'; -- Brocoli

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Green-Yellow-Red-Pepper-2009.jpg/330px-Green-Yellow-Red-Pepper-2009.jpg'
  WHERE sku = 'LEG-012'; -- Poivron

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Solanum_melongena_24_08_2012_%281%29.JPG/330px-Solanum_melongena_24_08_2012_%281%29.JPG'
  WHERE sku = 'LEG-013'; -- Bringelle

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Solanum_melongena_24_08_2012_%281%29.JPG/330px-Solanum_melongena_24_08_2012_%281%29.JPG'
  WHERE sku = 'LEG-014'; -- Aubergine

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Solanum_melongena_24_08_2012_%281%29.JPG/330px-Solanum_melongena_24_08_2012_%281%29.JPG'
  WHERE sku = 'LEG-015'; -- Bringelle Angivé

UPDATE public.products SET image_url = '/products/gros-piment.jpg'
  WHERE sku = 'LEG-016'; -- Piment gros

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Thai_peppers.jpg/330px-Thai_peppers.jpg'
  WHERE sku = 'LEG-017'; -- Piment petit (oiseau)

UPDATE public.products SET image_url = '/products/piment-carri.jpg'
  WHERE sku = 'LEG-018'; -- Piment Carri

UPDATE public.products SET image_url = '/products/oignon.jpg'
  WHERE sku = 'LEG-019'; -- Oignon

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/CSA-Red-Spring-Onions.jpg/330px-CSA-Red-Spring-Onions.jpg'
  WHERE sku = 'LEG-020'; -- Queue d'oignon (ciboule)

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Hong_Kong_Okra_Aug_25_2012.JPG/330px-Hong_Kong_Okra_Aug_25_2012.JPG'
  WHERE sku = 'LEG-021'; -- Lalo (Gombo / Okra)

UPDATE public.products SET image_url = '/products/patisson.jpg'
  WHERE sku = 'LEG-022'; -- Patisson

-- ─── MELONS ───────────────────────────────────────────────────────────────────
UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Cantaloupe_and_canary_melon.jpg/330px-Cantaloupe_and_canary_melon.jpg'
  WHERE sku = 'MEL-001'; -- Melon

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Taiwan_2009_Tainan_City_Organic_Farm_Watermelon_FRD_7962.jpg/330px-Taiwan_2009_Tainan_City_Organic_Farm_Watermelon_FRD_7962.jpg'
  WHERE sku = 'MEL-002'; -- Pastèque

-- ─── SALADES ──────────────────────────────────────────────────────────────────
UPDATE public.products SET image_url = '/products/concombre.jpg'
  WHERE sku = 'LEG-001'; -- Concombre local

UPDATE public.products SET image_url = '/products/concombre.jpg'
  WHERE sku = 'LEG-002'; -- Concombre Sayali

UPDATE public.products SET image_url = '/products/chou-rouge.jpg'
  WHERE sku = 'LEG-003'; -- Chou rouge

UPDATE public.products SET image_url = '/products/chou.jpg'
  WHERE sku = 'LEG-004'; -- Chou vert

UPDATE public.products SET image_url = '/products/laitue-tourbillon.jpg'
  WHERE sku = 'SAL-001'; -- Laitue tourbillon

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Starr_070730-7911_Lactuca_sativa.jpg/330px-Starr_070730-7911_Lactuca_sativa.jpg'
  WHERE sku = 'SAL-002'; -- Laitue caipira

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Iceberg_lettuce_in_SB.jpg/330px-Iceberg_lettuce_in_SB.jpg'
  WHERE sku = 'SAL-003'; -- Laitue vizir

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Starr_070730-7911_Lactuca_sativa.jpg/330px-Starr_070730-7911_Lactuca_sativa.jpg'
  WHERE sku = 'SAL-004'; -- Laitue mignonnette
