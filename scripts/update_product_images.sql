-- Mise à jour des images produits (sources : Wikimedia Commons, licence CC)
-- À exécuter dans le SQL Editor du projet Supabase : antzilughrlupmizmphk

-- ─── ÉPICES ───────────────────────────────────────────────────────────────────
UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Thyme-Bundle.jpg/330px-Thyme-Bundle.jpg'
  WHERE sku = 'EPI-001'; -- Thym

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Petroselinum.jpg/330px-Petroselinum.jpg'
  WHERE sku = 'EPI-002'; -- Persil plat

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Petroselinum.jpg/330px-Petroselinum.jpg'
  WHERE sku = 'EPI-003'; -- Persil frisé

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Celery_1.jpg/330px-Celery_1.jpg'
  WHERE sku = 'EPI-004'; -- Céleri

-- ─── BRÈDES ───────────────────────────────────────────────────────────────────
UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Amaranthus_tricolor0.jpg/330px-Amaranthus_tricolor0.jpg'
  WHERE sku = 'BRE-001'; -- Brède Tom-pouce (amarante)

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/N_Ipoa_D1600.JPG/330px-N_Ipoa_D1600.JPG'
  WHERE sku = 'BRE-002'; -- Brède Bâton blanc (liseron d'eau)

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Napa_cabbages.png/330px-Napa_cabbages.png'
  WHERE sku = 'BRE-003'; -- Petsai pommé

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Napa_cabbages.png/330px-Napa_cabbages.png'
  WHERE sku = 'BRE-004'; -- Petsai blanc

-- ─── LÉGUMES ──────────────────────────────────────────────────────────────────
UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_je.jpg/330px-Tomato_je.jpg'
  WHERE sku = 'LEG-005'; -- Pomme d'amour

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Tomates_cerises_Luc_Viatour.jpg/330px-Tomates_cerises_Luc_Viatour.jpg'
  WHERE sku = 'LEG-006'; -- Pomme d'amour double (tomate cerise)

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Chou-fleur_02.jpg/330px-Chou-fleur_02.jpg'
  WHERE sku = 'LEG-007'; -- Chou-fleur

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Chou-fleur_02.jpg/330px-Chou-fleur_02.jpg'
  WHERE sku = 'LEG-008'; -- Chou-fleur tropicale

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Chou-fleur_02.jpg/330px-Chou-fleur_02.jpg'
  WHERE sku = 'LEG-009'; -- Chou-fleur Cristalboy

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Chou-fleur_02.jpg/330px-Chou-fleur_02.jpg'
  WHERE sku = 'LEG-010'; -- Chou-fleur gros race

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Broccoli_and_cross_section_edit.jpg/330px-Broccoli_and_cross_section_edit.jpg'
  WHERE sku = 'LEG-011'; -- Brocoli

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Green-Yellow-Red-Pepper-2009.jpg/330px-Green-Yellow-Red-Pepper-2009.jpg'
  WHERE sku = 'LEG-012'; -- Poivron

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Solanum_melongena_24_08_2012_%281%29.JPG/330px-Solanum_melongena_24_08_2012_%281%29.JPG'
  WHERE sku = 'LEG-013'; -- Bringelle

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Solanum_melongena_24_08_2012_%281%29.JPG/330px-Solanum_melongena_24_08_2012_%281%29.JPG'
  WHERE sku = 'LEG-014'; -- Aubergine

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Solanum_melongena_24_08_2012_%281%29.JPG/330px-Solanum_melongena_24_08_2012_%281%29.JPG'
  WHERE sku = 'LEG-015'; -- Bringelle Angivé

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Madame_Jeanette_and_other_chillies.jpg/330px-Madame_Jeanette_and_other_chillies.jpg'
  WHERE sku = 'LEG-016'; -- Piment gros

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Thai_peppers.jpg/330px-Thai_peppers.jpg'
  WHERE sku = 'LEG-017'; -- Piment petit (oiseau)

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Madame_Jeanette_and_other_chillies.jpg/330px-Madame_Jeanette_and_other_chillies.jpg'
  WHERE sku = 'LEG-018'; -- Piment Carri

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Mixed_onions.jpg/330px-Mixed_onions.jpg'
  WHERE sku = 'LEG-019'; -- Oignon

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/CSA-Red-Spring-Onions.jpg/330px-CSA-Red-Spring-Onions.jpg'
  WHERE sku = 'LEG-020'; -- Queue d'oignon (ciboule)

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Hong_Kong_Okra_Aug_25_2012.JPG/330px-Hong_Kong_Okra_Aug_25_2012.JPG'
  WHERE sku = 'LEG-021'; -- Lalo (Gombo / Okra)

-- ─── MELONS ───────────────────────────────────────────────────────────────────
UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Cantaloupe_and_canary_melon.jpg/330px-Cantaloupe_and_canary_melon.jpg'
  WHERE sku = 'MEL-001'; -- Melon

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Taiwan_2009_Tainan_City_Organic_Farm_Watermelon_FRD_7962.jpg/330px-Taiwan_2009_Tainan_City_Organic_Farm_Watermelon_FRD_7962.jpg'
  WHERE sku = 'MEL-002'; -- Pastèque

-- ─── SALADES ──────────────────────────────────────────────────────────────────
UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/ARS_cucumber.jpg/330px-ARS_cucumber.jpg'
  WHERE sku = 'LEG-001'; -- Concombre local

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/ARS_cucumber.jpg/330px-ARS_cucumber.jpg'
  WHERE sku = 'LEG-002'; -- Concombre Sayali

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Brassica_oleracea_var_capitata_Rubyball.jpg/330px-Brassica_oleracea_var_capitata_Rubyball.jpg'
  WHERE sku = 'LEG-003'; -- Chou rouge

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Cabbage_and_cross_section_on_white.jpg/330px-Cabbage_and_cross_section_on_white.jpg'
  WHERE sku = 'LEG-004'; -- Chou vert

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Iceberg_lettuce_in_SB.jpg/330px-Iceberg_lettuce_in_SB.jpg'
  WHERE sku = 'SAL-001'; -- Laitue tourbillon

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Starr_070730-7911_Lactuca_sativa.jpg/330px-Starr_070730-7911_Lactuca_sativa.jpg'
  WHERE sku = 'SAL-002'; -- Laitue caipira

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Iceberg_lettuce_in_SB.jpg/330px-Iceberg_lettuce_in_SB.jpg'
  WHERE sku = 'SAL-003'; -- Laitue vizir

UPDATE public.products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Starr_070730-7911_Lactuca_sativa.jpg/330px-Starr_070730-7911_Lactuca_sativa.jpg'
  WHERE sku = 'SAL-004'; -- Laitue mignonnette
