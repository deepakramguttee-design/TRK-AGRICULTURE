-- Test seed for sowing_batches
-- Today assumed: 2026-06-15
-- Run this in the Supabase SQL Editor (bypasses RLS)
-- Safe to re-run: deletes test rows first by variety prefix

delete from public.sowing_batches where notes like '[TEST]%';

insert into public.sowing_batches (variety_name, sown_date, estimated_days, quantity_plateaux, notes) values

-- READY (remaining <= 0) ─ shown in "Prêts maintenant" filter
('Laitue Tourbillon',    '2026-05-11', 30, 4, '[TEST] Lot prêt à la vente'),
('Persil Plat',          '2026-05-05', 35, 2, '[TEST] Idéal pour aromates'),

-- SOON (1–7 days remaining) ─ shown in "Bientôt" filter
('Gros Piment',          '2026-05-29', 21, 3, '[TEST] Variété locale Maurice'),
('Oignon Rouge',         '2026-05-22', 28, 5, '[TEST] Haute demande'),

-- GROWING (> 7 days remaining) ─ shown in "En culture" filter
('Concombre Straight 8', '2026-05-01', 60, 6, '[TEST] Serre principale'),
('Chou-fleur Cristalboy','2026-05-26', 45, 3, '[TEST] Variété résistante'),
('Brèdes Mourongue',     '2026-06-01', 35, 8, '[TEST] Lot principal saison');
