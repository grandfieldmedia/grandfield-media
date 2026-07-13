-- Grandfield Media — "KDPFactory" schema (the KDP book production engine)
-- Lives in the SAME Supabase project as commerce + social, in its own `kdp_factory`
-- schema, fully ISOLATED from public.* / social.* / registry.*. Schema is KDP-specific
-- (each future *Factory tool gets its own schema); private bucket is `kdp-factory`.
--
-- Design source: "kdp-book-factory-architecture.md" (§ Supabase schema).
-- GOLDEN RULE: Supabase holds only OPERATING STATE — blueprint, statuses, step
-- queue, logs, per-chapter summaries, and links. The manuscript NEVER lives here;
-- every word of every book lives in the company Google Drive. Chapter/​book TEXT
-- is referenced by Drive file id only.
--
-- Niche knowledge is read ONCE from registry.niches at book start and SNAPSHOTTED
-- into the book (inside style_contract / blueprint) — NO foreign keys point into
-- the registry (edit/delete niches freely without touching any book).
--
-- Apply via: Supabase Dashboard → SQL Editor → paste → Run  (or the repo db runner).
-- Safe to re-run: every object uses IF NOT EXISTS / guarded creation.

-- ===========================================================================
-- Schema
-- ===========================================================================
create schema if not exists kdp_factory;

-- ===========================================================================
-- Enums (guarded so re-running is safe)
-- ===========================================================================
do $$
begin
  -- book lifecycle state machine
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid=t.typnamespace
                 where t.typname='book_status' and n.nspname='kdp_factory') then
    create type kdp_factory.book_status as enum
      ('draft','ideating','idea_selected','briefing','outlining',
       'drafting','polishing','assembling','metadata','ready','failed');
  end if;
  -- idea (Workbench) lifecycle
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid=t.typnamespace
                 where t.typname='idea_status' and n.nspname='kdp_factory') then
    create type kdp_factory.idea_status as enum
      ('draft','researching','ready','in_production','produced','parked','deleted');
  end if;
  -- Sample vs Full production
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid=t.typnamespace
                 where t.typname='run_type' and n.nspname='kdp_factory') then
    create type kdp_factory.run_type as enum ('sample','full');
  end if;
  -- the n8n step queue step kinds
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid=t.typnamespace
                 where t.typname='step_type' and n.nspname='kdp_factory') then
    create type kdp_factory.step_type as enum
      ('contract','outline','chapter','polish','assemble','metadata','kdp_check');
  end if;
  -- generic run status shared by steps + chapters
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid=t.typnamespace
                 where t.typname='run_status' and n.nspname='kdp_factory') then
    create type kdp_factory.run_status as enum ('pending','running','done','failed');
  end if;
  -- support-doc parse status
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid=t.typnamespace
                 where t.typname='parse_status' and n.nspname='kdp_factory') then
    create type kdp_factory.parse_status as enum ('pending','parsed','failed');
  end if;
  -- reference-library entry status
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid=t.typnamespace
                 where t.typname='reference_status' and n.nspname='kdp_factory') then
    create type kdp_factory.reference_status as enum ('active','archived');
  end if;
end$$;

-- shared updated_at trigger fn for this schema
create or replace function kdp_factory.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end$$ language plpgsql;

-- ===========================================================================
-- kdp_niche_defaults — format defaults per niche. Keyed LOOSELY by niche slug
-- (plain string, NO FK to registry — the no-ties rule).
-- ===========================================================================
create table if not exists kdp_factory.kdp_niche_defaults (
  niche_slug            text primary key,                  -- loose key, matches registry.niches.slug
  default_kdp_categories jsonb not null default '[]'::jsonb, -- 2-3 KDP browse categories
  default_word_count    int,
  default_chapter_length int,
  book_format_notes     text,                              -- structural conventions (e.g. Kids workbook vs Money guide)
  updated_at            timestamptz not null default now()
);

-- ===========================================================================
-- reference_books — the gold-standard library. Claude analyses each ONCE into a
-- reference_profile (jsonb) that the pipeline matches against. Raw text NEVER stored.
-- ===========================================================================
create table if not exists kdp_factory.reference_books (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,                         -- for our records
  author            text,
  niche_slug        text,                                  -- loose; NULL = general-purpose reference
  book_type         text,                                  -- guide | workbook | ...
  reference_profile jsonb not null default '{}'::jsonb,    -- distilled analysis (structure/tone/pacing/conventions)
  notes             text,                                  -- why this is the benchmark
  status            kdp_factory.reference_status not null default 'active',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists reference_books_niche_idx on kdp_factory.reference_books(niche_slug);

-- ===========================================================================
-- ideas — the Idea Workbench library. STANDALONE and long-lived, NOT tied to any
-- book. Most rows never reach production — the library IS the thinking space.
-- ===========================================================================
create table if not exists kdp_factory.ideas (
  id            uuid primary key default gen_random_uuid(),
  niche_slug    text,                                      -- loose snapshot from registry (no FK)
  niche_name    text,
  topic         text,
  working_title text,
  user_draft    text,                                      -- the USER's box (his own words)
  claude_draft  text,                                      -- CLAUDE's box (current improved version, incl. proposed TOC)
  agreed_toc    jsonb not null default '[]'::jsonb,        -- the agreed table of contents
  differentiation text,                                    -- required before status can be 'ready'
  payload       jsonb not null default '{}'::jsonb,        -- subtitle, angle, target reader, rationale, keyword seeds
  notes         text,                                      -- user's own markdown notes
  research      jsonb not null default '{}'::jsonb,        -- accumulated Claude research across sessions
  target_words  int,
  status        kdp_factory.idea_status not null default 'draft',
  created_by    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists ideas_niche_idx  on kdp_factory.ideas(niche_slug);
create index if not exists ideas_status_idx on kdp_factory.ideas(status);

drop trigger if exists ideas_touch_updated_at on kdp_factory.ideas;
create trigger ideas_touch_updated_at before update on kdp_factory.ideas
  for each row execute function kdp_factory.touch_updated_at();

-- ===========================================================================
-- books — created only at Stage-2 approval. Carries the IMMUTABLE blueprint
-- snapshot (the engine's SOLE input) + all operating state. NEVER the manuscript.
-- ===========================================================================
create table if not exists kdp_factory.books (
  id                  uuid primary key default gen_random_uuid(),
  idea_id             uuid references kdp_factory.ideas(id) on delete set null,  -- provenance
  version             int not null default 1,              -- each re-approval of the same idea → next version
  run_type            kdp_factory.run_type not null default 'full', -- sample runs are never publishable
  -- niche snapshot (plain text, NO FK; compiled context lives inside style_contract/blueprint)
  niche_slug          text,
  niche_name          text,
  site_id             text,                                -- which brand/site publishes it
  -- the design
  blueprint           jsonb not null default '{}'::jsonb,  -- signed-off immutable Blueprint (engine's sole input)
  topic               text,
  title_suggestion    text,
  chosen_title        text,
  subtitle            text,
  target_words        int,
  actual_words        int,
  -- production artifacts (operating state only)
  style_contract      jsonb not null default '{}'::jsonb,  -- incl. the compiled {NICHE_CONTEXT} snapshot
  fact_sheet          jsonb not null default '{}'::jsonb,
  reference_profile   jsonb,                               -- snapshot of the chosen reference (no FK)
  model_tier          text,                                -- per-book override (default set by app; e.g. sonnet)
  status              kdp_factory.book_status not null default 'draft',
  current_step        text,
  error               text,
  -- Drive links (all output lives in Google Drive, not here)
  drive_folder_url    text,
  master_doc_url      text,
  docx_url            text,                                -- the KDP upload file
  metadata_doc_url    text,
  -- publish + portfolio
  kdp_url             text,                                -- set after publish
  kdp_select          boolean not null default false,      -- KU exclusivity flag
  registered_in_aviary boolean not null default false,
  created_by          text,
  created_at          timestamptz not null default now(),
  completed_at        timestamptz,
  updated_at          timestamptz not null default now()
);
create index if not exists books_idea_idx   on kdp_factory.books(idea_id);
create index if not exists books_status_idx on kdp_factory.books(status);
create index if not exists books_niche_idx  on kdp_factory.books(niche_slug);

drop trigger if exists books_touch_updated_at on kdp_factory.books;
create trigger books_touch_updated_at before update on kdp_factory.books
  for each row execute function kdp_factory.touch_updated_at();

-- ===========================================================================
-- support_docs — input material attached at IDEA level (carried into the book at
-- approval). Parsed to text for B2. Stored in the private `kdp-factory` bucket.
-- ===========================================================================
create table if not exists kdp_factory.support_docs (
  id               uuid primary key default gen_random_uuid(),
  idea_id          uuid references kdp_factory.ideas(id) on delete cascade,
  filename         text not null,
  storage_path     text not null,                          -- path in the private kdp-factory bucket
  mime             text,
  parsed_text_path text,                                   -- parsed plain-text path
  parse_status     kdp_factory.parse_status not null default 'pending',
  created_at       timestamptz not null default now()
);
create index if not exists support_docs_idea_idx on kdp_factory.support_docs(idea_id);

-- ===========================================================================
-- chapters — ORCHESTRATION RECORD ONLY, never the manuscript. The chapter TEXT
-- lives only in Drive (drive_file_id). summary = ~200-word rolling-context memory.
-- ===========================================================================
create table if not exists kdp_factory.chapters (
  id            uuid primary key default gen_random_uuid(),
  book_id       uuid not null references kdp_factory.books(id) on delete cascade,
  index         int not null,                              -- chapter number
  title         text,
  goals         jsonb not null default '[]'::jsonb,
  target_words  int,
  actual_words  int,
  drive_file_id text,                                      -- the chapter's Google Doc (the ONLY copy of the text)
  summary       text,                                      -- ~200 words: operational memory, part of the log — NOT book content
  status        kdp_factory.run_status not null default 'pending',
  tokens_in     int,
  tokens_out    int,
  cost_usd      numeric,
  created_at    timestamptz not null default now(),
  unique (book_id, index)
);
create index if not exists chapters_book_idx on kdp_factory.chapters(book_id);

-- ===========================================================================
-- book_steps — the n8n orchestration queue. n8n's single source of truth; the
-- atomic "claim next pending step" is the idempotency guard for the webhook.
-- ===========================================================================
create table if not exists kdp_factory.book_steps (
  id          uuid primary key default gen_random_uuid(),
  book_id     uuid not null references kdp_factory.books(id) on delete cascade,
  step_type   kdp_factory.step_type not null,
  index       int not null default 0,                      -- e.g. chapter number for 'chapter' steps
  status      kdp_factory.run_status not null default 'pending',
  attempts    int not null default 0,
  started_at  timestamptz,
  finished_at timestamptz,
  error       text,
  created_at  timestamptz not null default now()
);
create index if not exists book_steps_book_idx   on kdp_factory.book_steps(book_id);
create index if not exists book_steps_status_idx on kdp_factory.book_steps(status);

-- ===========================================================================
-- generation_log — one row per AI call. Rolls up to per-book cost + monthly spend.
-- ===========================================================================
create table if not exists kdp_factory.generation_log (
  id             uuid primary key default gen_random_uuid(),
  book_id        uuid references kdp_factory.books(id) on delete set null,
  step           text,
  prompt_key     text,                                     -- B1..B8
  prompt_version int,
  model          text,                                     -- exact model id used
  tokens_in      int,
  tokens_out     int,
  cost_usd       numeric,
  duration_ms    int,
  created_at     timestamptz not null default now()
);
create index if not exists generation_log_book_idx on kdp_factory.generation_log(book_id);

-- ===========================================================================
-- kdp_sales — the monthly-report feedback loop (manual upload → parsed rows).
-- Loosely matched to our books (ASIN/title); book_id nullable.
-- ===========================================================================
create table if not exists kdp_factory.kdp_sales (
  id            uuid primary key default gen_random_uuid(),
  book_id       uuid references kdp_factory.books(id) on delete set null,
  period        text,                                      -- e.g. '2026-07'
  asin          text,
  title_matched text,
  units         int,
  ku_page_reads int,
  royalties_usd numeric,
  marketplace   text,
  imported_at   timestamptz not null default now()
);
create index if not exists kdp_sales_book_idx   on kdp_factory.kdp_sales(book_id);
create index if not exists kdp_sales_period_idx on kdp_factory.kdp_sales(period);

-- ===========================================================================
-- prompt_templates — B1..B8 as editable, versioned rows (prompts are the product).
-- Kept in the kdp_factory schema (NOT shared with social.prompt_templates) for isolation.
-- ===========================================================================
create table if not exists kdp_factory.prompt_templates (
  id         uuid primary key default gen_random_uuid(),
  key        text not null,                                -- B1 | B1F | B2 | ... | B8
  version    int not null default 1,
  text       text not null,
  model      text,                                         -- suggested tier for this prompt
  notes      text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (key, version)
);
create index if not exists prompt_templates_key_idx on kdp_factory.prompt_templates(key);

drop trigger if exists prompt_templates_touch_updated_at on kdp_factory.prompt_templates;
create trigger prompt_templates_touch_updated_at before update on kdp_factory.prompt_templates
  for each row execute function kdp_factory.touch_updated_at();

-- ===========================================================================
-- Private Storage bucket — INPUT MATERIAL ONLY (support-doc uploads + parsed text).
-- All book OUTPUT lives in Google Drive, never in Supabase Storage.
-- ===========================================================================
insert into storage.buckets (id, name, public)
values ('kdp-factory', 'kdp-factory', false)
on conflict (id) do nothing;

-- ===========================================================================
-- Access control — same pattern as social/registry: used ONLY by the admin panel
-- and n8n via the service-role key (BYPASSES RLS). No anon access. RLS enabled as
-- defense-in-depth; no policies.
-- ===========================================================================
grant usage on schema kdp_factory to service_role;
grant all on all tables in schema kdp_factory to service_role;
grant all on all sequences in schema kdp_factory to service_role;
alter default privileges in schema kdp_factory grant all on tables to service_role;
alter default privileges in schema kdp_factory grant all on sequences to service_role;

do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname='kdp_factory'
  loop
    execute format('alter table kdp_factory.%I enable row level security;', t.tablename);
  end loop;
end$$;
