-- Grandfield Media — shared commerce schema (ONE Supabase project for all 10 niche sites)
-- Every row carries site_id so a single admin panel can query across niches.
-- Apply via: Supabase Dashboard → SQL Editor → paste → Run
--   (or `supabase db push` if you wire up the Supabase CLI later).

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum ('pending', 'completed', 'refunded', 'failed');
  end if;
end$$;

-- ---------------------------------------------------------------------------
-- products  — public catalog (name/price/description are safe to read via anon)
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  site_id      text not null,                 -- e.g. 'money-finance'
  name         text not null,
  slug         text not null,
  description  text,
  price        integer not null,              -- in cents (e.g. 2900 = $29.00)
  storage_path text,                          -- path in private Storage bucket
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  unique (site_id, slug)
);

create index if not exists products_site_id_idx on public.products (site_id);

-- ---------------------------------------------------------------------------
-- orders  — one row per purchase. No customer accounts; recovery via token/email.
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  site_id            text not null,
  email              text not null,
  product_id         uuid references public.products (id),
  stripe_session_id  text unique,             -- idempotency anchor for the webhook
  amount             integer not null,        -- cents actually charged
  status             order_status not null default 'pending',
  download_token     text unique,             -- opaque token in the download link
  downloaded         boolean not null default false,
  downloaded_at      timestamptz,
  refund_status      text,
  refund_reason      text,
  refund_notes       text,
  created_at         timestamptz not null default now(),
  expires_at         timestamptz              -- download link expiry
);

create index if not exists orders_site_id_idx        on public.orders (site_id);
create index if not exists orders_email_idx          on public.orders (email);
create index if not exists orders_download_token_idx on public.orders (download_token);

-- ---------------------------------------------------------------------------
-- Row Level Security
--   secret/service-role key BYPASSES RLS  → webhook, downloads, admin all work.
--   publishable/anon key is subject to RLS → used only by the public site.
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.orders   enable row level security;

-- Public site may READ active products (the catalog). Nothing else for anon.
drop policy if exists "anon can read active products" on public.products;
create policy "anon can read active products"
  on public.products for select
  to anon
  using (active = true);

-- orders: NO anon policies at all → anon cannot read or write orders.
-- (All order access goes through the secret key, which bypasses RLS.)

-- ---------------------------------------------------------------------------
-- Private Storage bucket for the PDFs (served only via short-lived signed URLs)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-files', 'product-files', false)
on conflict (id) do nothing;
