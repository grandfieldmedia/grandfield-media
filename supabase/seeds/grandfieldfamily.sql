-- Grandfield Media — Aviary seed: grandfieldfamily.com (brand #2, first COMMERCE brand)
-- Prep only. Run when ready to add this brand. Nothing posts until:
--   1) you connect its social accounts in Postiz + fill channels.postiz_integration_id
--   2) the n8n Run-4 workflow is refactored to be multi-brand (reads brand config from DB)
--   3) you flip its automation_controls row ON
-- Safe to re-run (idempotent upsert). The shared run4_generate / run4_qa prompts already
-- in prompt_templates apply to this brand too — only voice/niche/compliance differ.
--
-- VOICE below is a DRAFT from grandfieldfamily.com — refine it like we did srini.pro.

do $$
declare
  v_brand uuid;
begin
  -- =========================================================================
  -- BRAND  (commerce brand — site_id links to the Relationships & Family niche.
  --   VERIFY the exact site_id against public.products for this store.)
  -- =========================================================================
  insert into social.brands (name, slug, site_id, site_url, niche, voice_profile, compliance_rules, image_style, hashtag_sets, timezone_targets, status)
  values (
    'Grandfield Family',
    'grandfieldfamily',
    'relationships-family',
    'https://grandfieldfamily.com',
    'Family Organization & Planning',
    $voice$Grandfield Family makes practical, downloadable family planning and organization templates — organizers, chore and routine charts, communication guides, and connection activities — for busy families. Voice: warm, practical, encouraging, and simple. Talks to busy parents like a helpful friend who gets it — no judgment, no overwhelm, no jargon. Emphasizes ease ("ready when you are," no setup, no learning curve) and small wins that bring a little more calm and connection to everyday family life. Plain, friendly, real.$voice$,
    $comp$Family-friendly and inclusive for all kinds of families. No medical, psychological, financial, or legal advice; no parenting-shaming or guilt; no political, religious-doctrine, or divisive topics; no guaranteed outcomes. Keep it warm, practical, and safe.$comp$,
    $img$Warm, friendly, homey. Soft flat illustration, cozy but uncluttered, gentle rounded shapes, a calm inviting palette (warm neutrals + one soft accent), generous white space, one clear subject. Feels calm and welcoming, never busy or stressful. No stock-photo clichés, no faces, no text/letters/numbers in the image.$img$,
    '{"instagram":["#familyorganization","#momlife","#familyroutines","#homeorganization"],"facebook":["#familylife","#parentingtips","#organizedhome"],"pinterest":["#familyplanner","#chorechart","#familyroutine","#printables"]}'::jsonb,
    '["Americas","Europe","India"]'::jsonb,
    'active'
  )
  on conflict (slug) do update
    set niche            = excluded.niche,
        voice_profile    = excluded.voice_profile,
        compliance_rules = excluded.compliance_rules,
        image_style      = excluded.image_style,
        site_id          = excluded.site_id,
        site_url         = excluded.site_url,
        hashtag_sets     = excluded.hashtag_sets,
        timezone_targets = excluded.timezone_targets,
        updated_at       = now()
  returning id into v_brand;

  -- =========================================================================
  -- CHANNELS  (the plan's core trio for niche brands: FB + IG + Pinterest).
  --   Seeded INACTIVE + no integration id — connect in Postiz, then fill
  --   postiz_integration_id and flip active=true.
  -- =========================================================================
  insert into social.channels (brand_id, platform, cadence_per_day, slot_times, active)
  values
    (v_brand, 'facebook',  3, '{"morning":"13:00","afternoon":"17:00","evening":"01:00"}'::jsonb, false),
    (v_brand, 'instagram', 3, '{"morning":"13:00","afternoon":"17:00","evening":"01:00"}'::jsonb, false),
    (v_brand, 'pinterest', 3, '{"morning":"13:00","afternoon":"17:00","evening":"01:00"}'::jsonb, false)
  on conflict (brand_id, platform) do nothing;

  -- =========================================================================
  -- KILL SWITCHES  (global row if missing + this brand's row, OFF)
  -- =========================================================================
  insert into social.automation_controls (scope, brand_id, enabled, reason)
  select 'global', null, false, 'initial setup — master OFF until pilot ready'
  where not exists (select 1 from social.automation_controls where scope = 'global');

  insert into social.automation_controls (scope, brand_id, enabled, reason)
  select 'brand', v_brand, false, 'not launched yet — seed only'
  where not exists (select 1 from social.automation_controls where scope = 'brand' and brand_id = v_brand);

  -- =========================================================================
  -- CONTENT PILLARS
  -- =========================================================================
  insert into social.content_pillars (brand_id, name, weight, active)
  select v_brand, x.name, x.weight, true
  from (values
    ('tip',                 3),   -- practical family-org tip
    ('relatable_humor',     2),   -- "we've all been there" parent moments
    ('engagement_question', 2),   -- ask the community
    ('seasonal',            1),   -- holidays / back-to-school / routines
    ('product_promo',       3)    -- promote a template (Run 1/2)
  ) as x(name, weight)
  where not exists (
    select 1 from social.content_pillars p where p.brand_id = v_brand and p.name = x.name
  );

  -- =========================================================================
  -- IDEA SOURCES  (family/parenting inspiration — verify URLs when building Run 4)
  -- =========================================================================
  insert into social.idea_sources (brand_id, source_type, name, url_or_config, fetch_interval, active)
  select v_brand, x.stype, x.name, x.cfg::jsonb, 'weekly', true
  from (values
    ('subreddit',   'r/Parenting (top weekly)', '{"subreddit":"Parenting","sort":"top","window":"week"}'),
    ('subreddit',   'r/Mommit (top weekly)',    '{"subreddit":"Mommit","sort":"top","window":"week"}'),
    ('holidays_api','Public holidays & observances', '{"provider":"nager.date","note":"seasonal hooks"}')
  ) as x(stype, name, cfg)
  where not exists (
    select 1 from social.idea_sources s where s.brand_id = v_brand and s.name = x.name
  );

  raise notice 'Seeded grandfieldfamily (brand id %) — 3 channels (inactive), controls OFF, pillars, idea sources.', v_brand;
end$$;
