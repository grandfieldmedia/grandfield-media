-- Grandfield Media — Aviary seed: srini.pro (the Phase-1 PILOT brand)
-- Seeds ONE brand so Run 1 (Assets) + Run 4 (Entertainer) have something real to run against.
-- Safe to re-run: idempotent (upserts the brand, guards every child insert).
-- Run in DEV first (SQL Editor). Nothing posts — the kill switches are seeded OFF.
--
-- To refine the VOICE later: either edit the voice_profile below and re-run this file,
-- or edit the brand row directly in Table Editor (schema: social -> brands).

do $$
declare
  v_brand uuid;
begin
  -- =========================================================================
  -- BRAND  (voice_profile / compliance_rules / image_style are STARTERS — edit freely)
  -- =========================================================================
  insert into social.brands (name, slug, site_url, voice_profile, compliance_rules, image_style, hashtag_sets, timezone_targets, status)
  values (
    'srini.pro',
    'srini-pro',
    'https://srini.pro',
    $voice$srini.pro is the personal brand of Srinivas Vanamala, an SAP Integration Architect with 20+ years of hands-on experience (SAP PO, BTP, Integration Suite, CPI). He teaches SAP integration, but his STYLE IS SIMPLE, PLAIN ENGLISH — he explains things the way he would tell a colleague over coffee, not like a textbook or a certification manual. Approachable, clear, human, practical. He AVOIDS heavy jargon; when a technical term is genuinely necessary he explains it in a few plain words so even a newcomer follows along. Short sentences. Real talk. No hype, no fluff, no buzzwords. Audience: consultants, developers, architects, and anyone learning or working in SAP integration. He sounds like a helpful senior colleague sharing what actually works on real projects — teaching by making complicated things feel simple.$voice$,
    $comp$Stay technically accurate — correct SAP product names, terminology, and current capabilities; never state SAP features or behavior you are not sure are real. No guaranteed certification-pass, salary, or job-placement claims. No financial, medical, or legal advice. No invented benchmarks, testimonials, or client names. Avoid political and divisive topics. Professional and respectful at all times.$comp$,
    $img$Clean, professional, enterprise-tech aesthetic. Flat vector or subtle isometric illustration evoking systems, data flow, and integration (nodes, connections, pipelines) — abstract, never a literal cluttered diagram. Cool corporate palette (blues/teals with a single accent), generous negative space, one clear subject. Calm, credible, modern. No stock-photo clichés, no human faces, no text/letters/numbers anywhere in the image.$img$,
    '{"linkedin":["#SAP","#SAPIntegration","#SAPCPI","#SAPBTP","#IntegrationSuite","#SAPPO"],"instagram":["#SAP","#SAPintegration","#techlearning","#itcareers"]}'::jsonb,
    '["Americas","Europe","India"]'::jsonb,
    'active'
  )
  on conflict (slug) do update
    set voice_profile    = excluded.voice_profile,
        compliance_rules = excluded.compliance_rules,
        image_style      = excluded.image_style,
        site_url         = excluded.site_url,
        hashtag_sets     = excluded.hashtag_sets,
        timezone_targets = excluded.timezone_targets,
        updated_at       = now()
  returning id into v_brand;

  -- =========================================================================
  -- CHANNELS
  --   PILOT SCOPE: LinkedIn only is ACTIVE (the natural SAP channel; text+image).
  --   Instagram + YouTube are seeded but INACTIVE (active=false) so nothing posts
  --   there even if the brand switch is flipped ON — activate them deliberately later.
  --   YouTube also waits on the video pipeline (deferred per the plan).
  --   slot_times are UTC starters for Americas / Europe / India prime times — tune later.
  -- =========================================================================
  insert into social.channels (brand_id, platform, cadence_per_day, slot_times, active)
  values
    (v_brand, 'linkedin',  3, '{"morning":"13:00","afternoon":"17:00","evening":"01:00"}'::jsonb, true),
    (v_brand, 'instagram', 3, '{"morning":"13:00","afternoon":"17:00","evening":"01:00"}'::jsonb, false),
    (v_brand, 'youtube',   1, '{"morning":"17:00"}'::jsonb, false)
  on conflict (brand_id, platform) do nothing;

  -- =========================================================================
  -- KILL SWITCHES  (both seeded OFF — nothing posts until you flip them ON in admin)
  -- =========================================================================
  insert into social.automation_controls (scope, brand_id, enabled, reason)
  select 'global', null, false, 'initial setup — master OFF until pilot ready'
  where not exists (select 1 from social.automation_controls where scope = 'global');

  insert into social.automation_controls (scope, brand_id, enabled, reason)
  select 'brand', v_brand, false, 'pilot not started — seed only'
  where not exists (select 1 from social.automation_controls where scope = 'brand' and brand_id = v_brand);

  -- =========================================================================
  -- CONTENT PILLARS  (drive the daily mix ~ value / promo / engagement)
  -- =========================================================================
  insert into social.content_pillars (brand_id, name, weight, active)
  select v_brand, x.name, x.weight, true
  from (values
    ('tip',                 3),   -- value
    ('inspired_by_source',  2),   -- value (original take on AI news)
    ('myth_buster',         1),   -- value
    ('engagement_question', 1),   -- engagement
    ('relatable_humor',     1),   -- entertainment
    ('product_promo',       3)    -- promo (Run 1/2)
  ) as x(name, weight)
  where not exists (
    select 1 from social.content_pillars p where p.brand_id = v_brand and p.name = x.name
  );

  -- =========================================================================
  -- IDEA SOURCES  (Run 4 fuel — SAP-focused, matching the REAL srini.pro brand)
  --   NOTE: verify each URL is live when we build Run 4 (SAP Community has changed
  --   feed paths over time; the ones marked TBD need confirming).
  -- =========================================================================
  insert into social.idea_sources (brand_id, source_type, name, url_or_config, fetch_interval, active)
  select v_brand, x.stype, x.name, x.cfg::jsonb, 'daily', true
  from (values
    ('rss',       'SAP News Center',          '{"url":"https://news.sap.com/feed/","note":"verify feed URL"}'),
    ('rss',       'SAP Community — Integration', '{"url":"TBD — confirm SAP Community integration blog RSS","topic":"integration-suite"}'),
    ('subreddit', 'r/SAP (top weekly)',        '{"subreddit":"SAP","sort":"top","window":"week"}')
  ) as x(stype, name, cfg)
  where not exists (
    select 1 from social.idea_sources s where s.brand_id = v_brand and s.name = x.name
  );

  raise notice 'Seeded srini.pro (brand id %) — 3 channels, controls OFF, 6 pillars, 3 idea sources.', v_brand;
end$$;
