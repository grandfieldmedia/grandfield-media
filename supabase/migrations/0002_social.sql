-- Grandfield Media — "Aviary" social automation schema
-- Lives in the SAME Supabase project as commerce, but in its own `social` schema,
-- fully ISOLATED from public.products / public.orders (this migration never touches them).
-- Apply via: Supabase Dashboard → SQL Editor → paste → Run   (DEV first, then PROD later)
-- Safe to re-run: every object uses IF NOT EXISTS / guarded creation.

-- ===========================================================================
-- Schema + extensions
-- ===========================================================================
create schema if not exists social;

-- pgvector powers the "topic cool holder" (embedding similarity on content_items)
create extension if not exists vector with schema extensions;

-- ===========================================================================
-- Enums (guarded so re-running is safe)
-- ===========================================================================
do $$
begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                 where t.typname = 'brand_status' and n.nspname = 'social') then
    create type social.brand_status as enum ('active', 'paused');
  end if;
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                 where t.typname = 'asset_status' and n.nspname = 'social') then
    create type social.asset_status as enum ('live', 'paused', 'retired');
  end if;
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                 where t.typname = 'control_scope' and n.nspname = 'social') then
    create type social.control_scope as enum ('global', 'brand');
  end if;
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                 where t.typname = 'lane' and n.nspname = 'social') then
    create type social.lane as enum ('run1_assets', 'run2_promotions', 'run3_custom', 'run4_entertainer');
  end if;
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                 where t.typname = 'slot' and n.nspname = 'social') then
    create type social.slot as enum ('morning', 'afternoon', 'evening');
  end if;
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                 where t.typname = 'content_status' and n.nspname = 'social') then
    create type social.content_status as enum
      ('planned', 'generated', 'qa_passed', 'qa_failed', 'scheduled', 'published', 'failed');
  end if;
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                 where t.typname = 'component_health' and n.nspname = 'social') then
    create type social.component_health as enum ('ok', 'warn', 'broken');
  end if;
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                 where t.typname = 'cost_cadence' and n.nspname = 'social') then
    create type social.cost_cadence as enum ('monthly', 'annual', 'one_time');
  end if;
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                 where t.typname = 'promotion_status' and n.nspname = 'social') then
    create type social.promotion_status as enum ('active', 'paused', 'ended');
  end if;
end$$;

-- ===========================================================================
-- REGISTRY TABLES (human-maintained, written once)
-- ===========================================================================

-- brands — the portfolio-wide registry (broader than commerce site_id; includes
-- srini.pro and grandfieldmedia.com). Adding a future brand = one row.
create table if not exists social.brands (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  site_id          text,                              -- optional link to commerce products.site_id
  site_url         text,
  voice_profile    text,                              -- tone, persona, vocabulary, audience  ({VOICE_PROFILE})
  compliance_rules text,                              -- e.g. Money & Finance YMYL framing     ({COMPLIANCE_RULES})
  image_style      text,                              -- per-brand P8 image style block
  brand_colors     text,
  hashtag_sets     jsonb not null default '{}'::jsonb,
  timezone_targets jsonb not null default '[]'::jsonb,
  status           social.brand_status not null default 'active',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- channels — one social account = one row. Adding a platform = connect in Postiz + insert here.
create table if not exists social.channels (
  id                    uuid primary key default gen_random_uuid(),
  brand_id              uuid not null references social.brands(id) on delete cascade,
  platform              text not null,                -- facebook | instagram | pinterest | linkedin | youtube
  postiz_integration_id text,
  cadence_per_day       int not null default 3,
  slot_times            jsonb not null default '{}'::jsonb,  -- {"morning":"13:00","afternoon":"17:00","evening":"01:00"} UTC
  active                boolean not null default true,       -- kill-switch LEVEL 3 (channel)
  created_at            timestamptz not null default now(),
  unique (brand_id, platform)
);
create index if not exists channels_brand_idx on social.channels(brand_id);

-- assets — machine mirror of the Assets Google Sheet (the Sheet is human source of truth;
-- this is what the automation operates on, synced at the start of every daily run).
create table if not exists social.assets (
  id                 uuid primary key default gen_random_uuid(),  -- the "Asset ID" written back to the Sheet
  brand_id           uuid not null references social.brands(id) on delete cascade,
  asset_type         text,                             -- pdf_template | book | course | prompt_pack | app | tool | newsletter | youtube | website
  name               text not null,
  slug               text,
  url                text,                             -- the destination: "bring people here"
  price_cents        int,
  one_liner          text,
  description        text,
  key_benefits       jsonb not null default '[]'::jsonb,   -- P1 enrichment
  target_audience    text,                                 -- P1
  pain_points_solved jsonb not null default '[]'::jsonb,   -- P1
  promo_angles       jsonb not null default '[]'::jsonb,   -- P1 (6-10 angles, auto-replenished)
  media              jsonb not null default '[]'::jsonb,   -- image pool + auto-captions
  media_folder_url   text,                             -- Google Drive folder link from the Sheet
  priority_score     int not null default 5,           -- 1-10, auto-updated nightly (sales + engagement)
  priority_override  int,                              -- 1-10 forces the score; null = automatic
  status             social.asset_status not null default 'live',
  sheet_source       text not null default 'assets',   -- which tab the row came from
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists assets_brand_idx  on social.assets(brand_id);
create index if not exists assets_status_idx on social.assets(status);

-- automation_controls — the kill switches (defense in depth, levels 1-2).
-- One 'global' row + one 'brand' row per website. EVERY website starts OFF by default.
create table if not exists social.automation_controls (
  id         uuid primary key default gen_random_uuid(),
  scope      social.control_scope not null,            -- 'global' or 'brand'
  brand_id   uuid references social.brands(id) on delete cascade,  -- null for the global row
  enabled    boolean not null default false,           -- starts OFF; flipped ON from admin only when ready
  reason     text,                                     -- "fixing issue" | "budget" | "subscription" | "no content yet"
  updated_at timestamptz not null default now()
);
-- at most one global row; at most one row per brand
create unique index if not exists automation_controls_global_uidx
  on social.automation_controls(scope) where scope = 'global';
create unique index if not exists automation_controls_brand_uidx
  on social.automation_controls(brand_id) where scope = 'brand';

-- idea_sources — external inspiration feeds (Run 4 fuel). brand_id null = portfolio-wide.
create table if not exists social.idea_sources (
  id              uuid primary key default gen_random_uuid(),
  brand_id        uuid references social.brands(id) on delete cascade,
  source_type     text not null,                       -- rss | quotes_api | subreddit | trends | holidays_api | on_this_day | static_bank
  name            text not null,
  url_or_config   jsonb not null default '{}'::jsonb,
  fetch_interval  text,                                -- 'daily' | 'weekly'
  last_fetched_at timestamptz,
  active          boolean not null default true,
  notes           text,
  created_at      timestamptz not null default now()
);
create index if not exists idea_sources_brand_idx on social.idea_sources(brand_id);

-- content_pillars — weights drive the daily mix (~60% value / 25% promo / 15% engagement).
create table if not exists social.content_pillars (
  id              uuid primary key default gen_random_uuid(),
  brand_id        uuid references social.brands(id) on delete cascade,  -- null = applies to all brands
  name            text not null,                       -- tip | product_promo | inspired_by_source | engagement_question | seasonal | myth_buster | quote_card | relatable_humor
  weight          numeric not null default 1,
  prompt_template text,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);
create index if not exists content_pillars_brand_idx on social.content_pillars(brand_id);

-- prompt_templates — P1..P9 stored as editable, versioned DATA (not hardcoded in n8n).
create table if not exists social.prompt_templates (
  id         uuid primary key default gen_random_uuid(),
  key        text not null,                            -- P1..P9
  text       text not null,
  version    int not null default 1,
  model      text,                                     -- pinned model id / tier note
  active     boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (key, version)
);

-- company_costs — Srini-maintained fixed costs for the Company P&L (auto-vars come from run_log).
create table if not exists social.company_costs (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,                          -- Vercel Pro | Postiz | n8n | domains ...
  amount_cents int not null,
  cadence      social.cost_cadence not null default 'monthly',
  category     text,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ===========================================================================
-- MACHINE-MAINTAINED TABLES (written by the automation)
-- ===========================================================================

-- inspiration_items — fetched from idea_sources by Run 4. AI writes an original take (never copies).
create table if not exists social.inspiration_items (
  id         uuid primary key default gen_random_uuid(),
  source_id  uuid references social.idea_sources(id) on delete set null,
  brand_id   uuid references social.brands(id) on delete cascade,
  title      text,
  summary    text,
  source_url text,
  score      numeric,                                  -- P7 relevance 0-10
  post_seed  text,                                     -- P7 one-line idea
  fetched_at timestamptz not null default now(),
  used_at    timestamptz                               -- null = fresh
);
create index if not exists inspiration_items_fresh_idx
  on social.inspiration_items(brand_id) where used_at is null;

-- asset_promotion_state — THE anti-repetition mechanism: one row per (asset x channel).
create table if not exists social.asset_promotion_state (
  id               uuid primary key default gen_random_uuid(),
  asset_id         uuid not null references social.assets(id) on delete cascade,
  channel_id       uuid not null references social.channels(id) on delete cascade,
  last_promoted_at timestamptz,
  promotion_count  int not null default 0,
  last_angle_used  text,
  angle_history    jsonb not null default '[]'::jsonb,
  next_eligible_at timestamptz,                         -- cooldown gate (comes first, always)
  unique (asset_id, channel_id)
);
create index if not exists aps_eligible_idx on social.asset_promotion_state(channel_id, next_eligible_at);

-- active_promotions — machine mirror of the Promotions tab (hard-push list).
create table if not exists social.active_promotions (
  id            uuid primary key default gen_random_uuid(),
  asset_id      uuid not null references social.assets(id) on delete cascade,
  posts_per_day int not null default 1,
  platforms     jsonb not null default '"all"'::jsonb, -- "all" or ["facebook","instagram",...]
  started_at    timestamptz not null default now(),
  status        social.promotion_status not null default 'active',
  notes         text
);
create index if not exists active_promotions_status_idx on social.active_promotions(status);

-- content_items — one planned/generated post (all platform variants in copy_by_platform).
create table if not exists social.content_items (
  id                  uuid primary key default gen_random_uuid(),
  brand_id            uuid not null references social.brands(id) on delete cascade,
  pillar_id           uuid references social.content_pillars(id) on delete set null,
  asset_id            uuid references social.assets(id) on delete set null,
  inspiration_item_id uuid references social.inspiration_items(id) on delete set null,
  lane                social.lane,
  topic               text,
  topic_embedding     extensions.vector(1536),         -- OpenAI text-embedding-3-small (cool holder)
  copy_by_platform    jsonb not null default '{}'::jsonb,  -- {"facebook":..,"instagram":..,"pinterest":..,"linkedin":..}
  angle_used          text,
  media_type          text,                            -- template | mockup | generated
  media_ref           text,
  status              social.content_status not null default 'planned',
  qa_verdict          jsonb,
  recycle_eligible    boolean not null default false,
  prompt_version      int,
  created_at          timestamptz not null default now(),
  last_used_at        timestamptz
);
create index if not exists content_items_brand_idx  on social.content_items(brand_id);
create index if not exists content_items_status_idx on social.content_items(status);
-- NOTE: no ANN (hnsw/ivfflat) index yet — at pilot volumes a seq scan over ~35 days of a
-- brand's rows is fine. Add a vector index later if similarity search gets slow.

-- post_log — EVERY published post from EVERY lane lands here, stamped with its lane.
create table if not exists social.post_log (
  id              uuid primary key default gen_random_uuid(),
  content_item_id uuid references social.content_items(id) on delete set null,  -- null for verbatim custom posts
  channel_id      uuid not null references social.channels(id) on delete cascade,
  brand_id        uuid references social.brands(id) on delete cascade,
  postiz_post_id  text,
  lane            social.lane not null,
  slot            social.slot,
  scheduled_at    timestamptz,                          -- UTC
  published_at    timestamptz,
  status          text not null default 'scheduled',    -- scheduled | published | failed
  qa_verdict      text,                                 -- pass | fail | n/a
  error           text,
  created_at      timestamptz not null default now()
);
create index if not exists post_log_channel_idx   on social.post_log(channel_id);
create index if not exists post_log_brand_idx     on social.post_log(brand_id);
create index if not exists post_log_lane_idx       on social.post_log(lane);
create index if not exists post_log_scheduled_idx on social.post_log(scheduled_at);

-- metrics — on-platform (Postiz) + after-click (PostHog) numbers per post.
create table if not exists social.metrics (
  id            uuid primary key default gen_random_uuid(),
  post_log_id   uuid not null references social.post_log(id) on delete cascade,
  impressions   int,
  likes         int,
  comments      int,
  shares        int,
  clicks        int,
  visits        int,                                    -- PostHog
  conversions   int,                                    -- PostHog -> Stripe
  revenue_cents int,
  fetched_at    timestamptz not null default now()
);
create index if not exists metrics_post_idx on social.metrics(post_log_id);

-- run_log — one row per workflow run (feeds the budget breaker + admin spend meter).
create table if not exists social.run_log (
  id                 uuid primary key default gen_random_uuid(),
  run_name           text not null,                     -- run1_assets .. run5_health | launch_hook
  started_at         timestamptz not null default now(),
  finished_at        timestamptz,
  posts_planned      int not null default 0,
  posts_generated    int not null default 0,
  posts_scheduled    int not null default 0,
  posts_skipped      int not null default 0,
  claude_tokens      int not null default 0,
  openai_images      int not null default 0,
  estimated_cost_usd numeric not null default 0,
  prompt_versions    jsonb not null default '{}'::jsonb,
  errors             jsonb not null default '[]'::jsonb
);
create index if not exists run_log_name_idx    on social.run_log(run_name);
create index if not exists run_log_started_idx on social.run_log(started_at);

-- health_status — one row per checked component (green/red panel reads this directly).
create table if not exists social.health_status (
  id         uuid primary key default gen_random_uuid(),
  component  text not null unique,                      -- 'postiz_key' | 'channel:<id>' | 'sheet' | 'claude' | ...
  status     social.component_health not null default 'ok',
  detail     text,
  checked_at timestamptz not null default now()
);

-- ===========================================================================
-- Access control
--   The social schema is used ONLY by n8n and the admin panel via the
--   service-role key (which BYPASSES RLS). No anon/public access at all.
--   RLS is enabled as defense-in-depth (matches the commerce pattern).
-- ===========================================================================
grant usage on schema social to service_role;
grant all on all tables in schema social to service_role;
grant all on all sequences in schema social to service_role;
alter default privileges in schema social grant all on tables to service_role;
alter default privileges in schema social grant all on sequences to service_role;

do $$
declare t record;
begin
  for t in
    select tablename from pg_tables where schemaname = 'social'
  loop
    execute format('alter table social.%I enable row level security;', t.tablename);
  end loop;
end$$;
