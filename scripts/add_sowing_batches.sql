-- Lots de semis pour le calendrier pépinière en direct
create table if not exists public.sowing_batches (
  id                uuid    default gen_random_uuid() primary key,
  product_id        uuid    references public.products(id) on delete set null,
  variety_name      text    not null,
  sown_date         date    not null,
  estimated_days    integer not null check (estimated_days > 0),
  quantity_plateaux integer not null default 1 check (quantity_plateaux > 0),
  notes             text,
  created_at        timestamptz default now()
);

alter table public.sowing_batches enable row level security;

-- Lecture publique (page Pépinière en direct, clé anon)
create policy "sowing_batches: public select"
  on public.sowing_batches for select
  using (true);

-- Écriture pour les utilisateurs authentifiés (admins)
create policy "sowing_batches: auth write"
  on public.sowing_batches for all
  to authenticated
  using (true)
  with check (true);
