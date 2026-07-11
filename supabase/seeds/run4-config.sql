-- Aviary Run 4 — the config-driven BACKEND.
-- Moves every per-brand detail OUT of n8n and INTO the database, so ONE workflow
-- can serve all brands by reading each brand's row. Adding a brand = a row, not a workflow.
-- Safe to re-run. Run in DEV.

-- ---------------------------------------------------------------------------
-- 1. brands gets a `niche` column (the topic the posts must stay inside)
-- ---------------------------------------------------------------------------
alter table social.brands add column if not exists niche text;

-- ---------------------------------------------------------------------------
-- 2. srini.pro's full Run-4 config (voice, niche, compliance) — the "form-letter blanks"
-- ---------------------------------------------------------------------------
update social.brands set
  niche = 'SAP Integration',
  voice_profile = 'Srinivas Vanamala, an SAP Integration expert with 20+ years hands-on experience (SAP PO, BTP, Integration Suite, CPI). Writes in plain, simple English, explaining any technical term in a few plain words. Short, punchy, engagement-first — sounds like a seasoned architect talking to a colleague, no hype, no buzzwords.',
  compliance_rules = 'No certification/job/salary guarantees; no fabricated specific stats or named clients; no financial/medical/legal advice; strictly on-niche.',
  updated_at = now()
where slug = 'srini-pro';

-- ---------------------------------------------------------------------------
-- 3. srini.pro's LinkedIn channel — store the real Postiz integration id
--    (so the workflow reads WHERE to publish, instead of it being hardcoded)
-- ---------------------------------------------------------------------------
update social.channels set postiz_integration_id = 'cmrgewrqm09npk90yqhpjhcnl'
where platform = 'linkedin'
  and brand_id = (select id from social.brands where slug = 'srini-pro');

-- ---------------------------------------------------------------------------
-- 4. The SHARED Run-4 prompts (written ONCE, used by every brand).
--    n8n fills the {PLACEHOLDERS} from each brand's row at run time.
-- ---------------------------------------------------------------------------
insert into social.prompt_templates (key, text, version, model) values
('run4_generate', $gen$You are the voice of {BRAND}. {VOICE_PROFILE}

Write ONE SHORT {PLATFORM} post that people want to LIKE and REPOST — not just read and scroll past. Make it either so relatable people share it, so useful people save it, or a take people want to co-sign. Keep it punchy: 30-70 words. NOT a long lesson or story.

Pick ONE angle at random and write that type (make it fit {NICHE}):
- Relatable pain
- Hot take
- This or that
- Validation
- Spot the mistake
- Shoutout
- Fill in the blank
- Quick list

Rules:
- First line = a scroll-stopping hook.
- Last line = a short question/ask that pulls a reaction (agree? who else? vote below? your turn?).
- Short chunks with a BLANK LINE between each, scannable on a phone.
- Stay strictly on {NICHE}. Explain any jargon in plain words. No selling, no links, no hashtags. {COMPLIANCE}

Return JSON only: {"linkedin":"...","idea_label":"...","image_concept":"..."}$gen$, 1, 'sonnet-class'),

('run4_qa', $qa$You are the pre-publish reviewer for {BRAND}, a {NICHE} brand. No human sees the post before it goes live, so block anything genuinely unsafe or off-brand — but do NOT reject good posts over style nitpicks. Default to PASS when the post is on-niche, safe, accurate, and readable.

Judge this post: {POST_JSON}

HARD-FAIL checks (fail only if one is truly violated):
(1) ON-NICHE & AUDIENCE-SAFE: squarely inside {NICHE}. Forbidden: off-niche topics; {COMPLIANCE}; selling; links; hashtags.
(2) FACTUALLY SANE: no fabricated specific numbers, fake testimonials, or named clients. Generic relatable scenarios (e.g. "2 AM", "on a Friday") are illustrative and fine.
(3) NOT BROKEN: no leftover template tokens; post is complete. An intentional fill-in-the-blank "___" hook is a VALID format, not a placeholder error.

SOFT (note only, do NOT fail unless it is a boring wall of text):
(4) short, plain English, has a hook, ends with a question/ask.

Return JSON only: {"verdict":"pass|fail","failures":[{"check":n,"reason":"...","suggested_fix":"..."}]}$qa$, 1, 'haiku-class')

on conflict (key, version) do update set text = excluded.text, model = excluded.model, updated_at = now();
