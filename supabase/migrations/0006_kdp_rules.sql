-- KDPFactory — kdp_rules: the KDP Output Contract stored as versioned data.
-- B7 generates metadata INSIDE these limits; B8 checks against them. When Amazon
-- changes a rule, edit a row — not code. Additive to kdp_factory. Safe to re-run.
--
-- ALL VALUES ARE DIRECTIONAL (from current knowledge 2026-07-12) and MUST be
-- re-verified against KDP's live documentation at build time — Amazon revises them.

create table if not exists kdp_factory.kdp_rules (
  id          uuid primary key default gen_random_uuid(),
  rule_key    text not null,                         -- e.g. 'keywords_count'
  rule_type   text not null,                         -- limit | prohibited | checklist | format
  value       jsonb not null,                        -- number, array, or object
  description text,
  version     int not null default 1,
  is_active   boolean not null default true,
  updated_at  timestamptz not null default now(),
  unique (rule_key, version)
);

grant usage on schema kdp_factory to service_role;
grant all on kdp_factory.kdp_rules to service_role;
alter table kdp_factory.kdp_rules enable row level security;

-- Directional seed (re-verify vs KDP live docs at build time) --------------------
insert into kdp_factory.kdp_rules (rule_key, rule_type, value, description) values
  ('title_subtitle_max_chars', 'limit', '200'::jsonb, 'Combined title + subtitle character cap (approx).'),
  ('keywords_count', 'limit', '7'::jsonb, 'Exactly 7 backend keyword slots.'),
  ('keyword_max_chars', 'limit', '50'::jsonb, 'Per-keyword character cap (approx).'),
  ('description_max_chars', 'limit', '4000'::jsonb, 'Book description character cap.'),
  ('categories_count', 'limit', '3'::jsonb, 'Number of browse categories to select.'),
  ('description_allowed_html', 'format',
    '["<br>","<p>","<b>","<i>","<u>","<h4>","<h5>","<h6>","<ol>","<ul>","<li>"]'::jsonb,
    'KDP-supported HTML tags in the description.'),
  ('prohibited_metadata_terms', 'prohibited',
    '["free","bestseller","best seller","best-selling","sale","discount","%","cheap","guaranteed"]'::jsonb,
    'Words that get listings flagged if used in title/subtitle/keywords.'),
  ('upload_checklist', 'checklist',
    '["Declare AI-generated content at upload (standing decision — no exceptions)","Open the interior in KDP''s online previewer","Confirm title/subtitle/description within limits","Set 7 keywords + 3 categories","Decide KDP Select (KU) enrollment","Set price & royalty plan","Upload the manual cover (from the cover brief)"]'::jsonb,
    'Standing upload checklist shown on every book detail page.')
on conflict (rule_key, version) do update
  set value = excluded.value, rule_type = excluded.rule_type,
      description = excluded.description, updated_at = now();
