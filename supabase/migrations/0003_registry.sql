-- Grandfield Media — "Niche Master Registry" schema
-- Shared company infrastructure: the single source of niche knowledge read by
-- ALL Factories (KDPFactory, PlannerFactory, PPTFactory, …). Lives in its own
-- `registry` schema, fully isolated from public.* and social.*.
--
-- Design source: "kdp-book-factory-architecture.md" (§ Niche knowledge). There is
-- no separate registry spec doc yet, so this schema is derived from that section:
--   * one table holding top-level niches AND their sub-niches (self-referencing tree)
--   * each entry carries rich context: audience, buying motivation, voice/tone,
--     reading level, compliance rules, do's / don'ts, keywords
--   * a PURE reference — no foreign keys point INTO it from books; Factories call
--     getNicheContext(slug), compile {NICHE_CONTEXT} (parent + sub-niche, compliance
--     accumulated), and SNAPSHOT that text into their own records. Rows here can be
--     edited or deleted freely without affecting any in-flight or finished asset.
--
-- Apply via: Supabase Dashboard → SQL Editor → paste → Run  (or the repo db runner).
-- Safe to re-run: every object uses IF NOT EXISTS / guarded creation; seed is idempotent.

-- ===========================================================================
-- Schema
-- ===========================================================================
create schema if not exists registry;

-- ===========================================================================
-- Enums (guarded so re-running is safe)
-- ===========================================================================
do $$
begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                 where t.typname = 'niche_status' and n.nspname = 'registry') then
    create type registry.niche_status as enum ('active', 'archived');
  end if;
end$$;

-- ===========================================================================
-- niches — the tree. parent_id NULL = a top-level parent niche; parent_id set =
-- a sub-niche that REFINES its parent. The compiler merges parent context with the
-- sub-niche's own, accumulating compliance rules down the tree.
-- ===========================================================================
create table if not exists registry.niches (
  id                 uuid primary key default gen_random_uuid(),
  parent_id          uuid references registry.niches(id) on delete cascade,   -- NULL = top-level niche
  slug               text not null unique,                 -- e.g. 'money-finance', 'money-finance-budgeting'
  name               text not null,                        -- display name
  pen_name           text,                                 -- author persona — set on the PARENT niche; ALL its sub-niches share it ({PEN_NAME})
  pen_name_bio       text,                                 -- truthful about-the-author bio; NO invented credentials ({PEN_NAME_BIO})
  publisher_name     text,                                 -- imprint / publisher brand on listing ({PUBLISHER_NAME})
  audience           text,                                 -- who they are                         ({AUDIENCE})
  buying_motivation  text,                                 -- what they are REALLY buying          ({BUYING_MOTIVATION})
  voice_tone         text,                                 -- voice / tone / persona               ({VOICE_TONE})
  reading_level      text,                                 -- e.g. 'general adult', 'grade 3-5'    ({READING_LEVEL})
  compliance_rules   text,                                 -- hard rules; accumulates down the tree ({COMPLIANCE_RULES})
  dos                jsonb not null default '[]'::jsonb,    -- array of do's                        ({DOS})
  donts              jsonb not null default '[]'::jsonb,    -- array of don'ts                      ({DONTS})
  keywords           jsonb not null default '[]'::jsonb,    -- keyword seeds                        ({KEYWORDS})
  context_notes      text,                                 -- free-text extra context for the compiler
  sort_order         int not null default 0,               -- display order among siblings
  status             registry.niche_status not null default 'active',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint niches_not_self_parent check (parent_id is null or parent_id <> id)
);
create index if not exists niches_parent_idx on registry.niches(parent_id);
create index if not exists niches_status_idx on registry.niches(status);

-- Guarded ALTERs — so a table created before these columns existed (e.g. prod,
-- applied 2026-07-12) picks them up on re-run. Pen name is ONE persona per PARENT
-- niche; every sub-niche under it resolves to the parent's pen name (never its own).
alter table registry.niches add column if not exists pen_name       text;
alter table registry.niches add column if not exists pen_name_bio   text;
alter table registry.niches add column if not exists publisher_name text;

-- keep updated_at fresh on edits (admin add/edit/archive)
create or replace function registry.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end$$ language plpgsql;

drop trigger if exists niches_touch_updated_at on registry.niches;
create trigger niches_touch_updated_at
  before update on registry.niches
  for each row execute function registry.touch_updated_at();

-- ===========================================================================
-- Seed — the 10 LOCKED parent niches (CLAUDE.md, finalized 2026-07-09).
-- Only the STRUCTURE + the locked facts are seeded here: names, slugs, order,
-- and the two YMYL compliance scopes that are already decided. Audience, voice,
-- keywords, and sub-niches are Srini's creative input, entered via the admin
-- Registry pages (or drafted later) — this migration does not invent them.
-- Idempotent: re-running only fills compliance on the two scoped niches.
-- ===========================================================================
insert into registry.niches (slug, name, sort_order, compliance_rules) values
  ('business-entrepreneurship', 'Business & Entrepreneurship', 1, null),
  ('career-professional',       'Career & Professional Development', 2, null),
  ('learning-education',        'Learning & Education', 3, null),
  ('home-lifestyle',            'Home & Lifestyle', 4, null),
  ('technology-tools',          'Technology & Digital Tools', 5, null),
  ('money-finance',             'Money & Finance', 6,
    'YMYL — scope to budgeting, saving, and financial EDUCATION only. Never give regulated investment, tax, or securities advice. No personalized financial recommendations. Frame everything as general education, not advice.'),
  ('relationships-family',      'Relationships & Family', 7, null),
  ('health-wellness',           'Health & Wellness', 8,
    'YMYL — scope to fitness, general wellness, and healthy habits only. Never make medical claims, give diagnoses, or prescribe diet/treatment. No cures, no dosages. Frame as general wellness education; recommend consulting a professional for medical concerns.'),
  ('events-celebrations',       'Events & Celebrations', 9, null),
  ('kids-education',            'Kids & Children''s Education', 10, null)
on conflict (slug) do update
  set name             = excluded.name,
      sort_order       = excluded.sort_order,
      compliance_rules = coalesce(registry.niches.compliance_rules, excluded.compliance_rules);

-- ===========================================================================
-- Access control — same pattern as social.*: used ONLY by the admin panel and
-- Factory backends via the service-role key (which BYPASSES RLS). No anon access.
-- RLS enabled as defense-in-depth; no policies (service_role bypasses).
-- ===========================================================================
grant usage on schema registry to service_role;
grant all on all tables in schema registry to service_role;
grant all on all sequences in schema registry to service_role;
alter default privileges in schema registry grant all on tables to service_role;
alter default privileges in schema registry grant all on sequences to service_role;

do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'registry'
  loop
    execute format('alter table registry.%I enable row level security;', t.tablename);
  end loop;
end$$;
