# Aviary — Run 4 (Entertainer) — COMPLETE multi-brand n8n build

Turns the hardcoded srini.pro workflow into a **config-driven, multi-brand, kill-switch-aware**
workflow. **One workflow serves every brand.** Adding a brand = data in Supabase, never a new workflow.

**The whole thing is driven by ONE query** ("Get Live Brands") that returns a row per
live (brand × active channel). That single query IS: the kill-switch check + the config read +
the multi-brand loop. n8n then runs the chain once per returned brand.

**Safest way to build:** duplicate your working srini.pro workflow (menu → Duplicate) → rename it
`Run 4 — Multi-brand` → build the changes in the copy. srini.pro keeps running on the old one until
the new one works. Then disable old, enable new.

Reused credentials (already in n8n): Anthropic Header Auth `x-api-key`, Postiz Header Auth
`Authorization`, and the Postgres (prod) credential.

---

## Node order

```
Schedule Trigger (+ Manual)
  → Get Live Brands      (Postgres — the switch-check + config + loop)
  → Build Gen Prompt     (Code — fill run4_generate from the brand's row)
  → Generate             (HTTP — Claude sonnet)
  → Build QA             (Code — parse post, fill run4_qa)
  → QA Check             (HTTP — Claude haiku)
  → Log & Gate           (Code — verdict, build content_items INSERT, gate)
  → Insert content_items (Postgres)
  → Prepare Postiz       (Code — gate on pass, build Postiz body per platform)
  → Publish              (HTTP — Postiz)
  → Log Published        (Code — build post_log INSERT)
  → Insert post_log      (Postgres)
```

---

## 1) Get Live Brands — Postgres → "Execute a SQL query"

Returns one row per brand that is fully live (global ON + brand ON + channel active + has a Postiz id),
with that brand's config + the shared prompts. **If global is OFF or no brand qualifies → 0 rows →
nothing runs** (that's the master kill switch).

```sql
select
  b.id            as brand_id,
  b.name          as brand_name,
  b.niche         as niche,
  b.voice_profile as voice_profile,
  coalesce(b.compliance_rules, '') as compliance,
  c.id            as channel_id,
  c.platform      as platform,
  c.postiz_integration_id as integration_id,
  (select text from social.prompt_templates where key = 'run4_generate' and active order by version desc limit 1) as gen_template,
  (select text from social.prompt_templates where key = 'run4_qa'       and active order by version desc limit 1) as qa_template
from social.brands b
join social.channels c
  on c.brand_id = b.id and c.active = true and c.postiz_integration_id is not null
join social.automation_controls g
  on g.scope = 'global' and g.enabled = true
join social.automation_controls ab
  on ab.scope = 'brand' and ab.brand_id = b.id and ab.enabled = true
where b.status = 'active';
```

*(Today this returns exactly 1 row: srini.pro on LinkedIn. grandfieldfamily's channels are inactive
with no Postiz id, so it's excluded until you connect it.)*

---

## 2) Build Gen Prompt — Code

```javascript
const b = $input.item.json;
const platformName = {
  linkedin: 'LinkedIn', facebook: 'Facebook', instagram: 'Instagram',
  pinterest: 'Pinterest', youtube: 'YouTube'
}[b.platform] || b.platform;

const content = b.gen_template
  .replaceAll('{BRAND}', b.brand_name)
  .replaceAll('{VOICE_PROFILE}', b.voice_profile || '')
  .replaceAll('{NICHE}', b.niche || '')
  .replaceAll('{PLATFORM}', platformName)
  .replaceAll('{COMPLIANCE}', b.compliance || '');

return { json: { ...b, genBody: { model: 'claude-sonnet-5', max_tokens: 2000, messages: [{ role: 'user', content }] } } };
```

---

## 3) Generate — HTTP Request

- Method `POST` · URL `https://api.anthropic.com/v1/messages`
- Auth: Header Auth → your `x-api-key` credential
- Header: `anthropic-version` = `2023-06-01`
- Body: JSON, expression → `{{ $json.genBody }}`

---

## 4) Build QA — Code

```javascript
const gen = $input.item.json;                  // Claude generate response
const b   = $('Build Gen Prompt').item.json;   // brand config carried forward
const post = JSON.parse(gen.content.find(c => c.type === 'text').text);

const content = b.qa_template
  .replaceAll('{BRAND}', b.brand_name)
  .replaceAll('{NICHE}', b.niche || '')
  .replaceAll('{COMPLIANCE}', b.compliance || '')
  .replaceAll('{POST_JSON}', JSON.stringify(post));

return { json: { ...b, post, qaBody: { model: 'claude-haiku-4-5', max_tokens: 1024, messages: [{ role: 'user', content }] } } };
```

---

## 5) QA Check — HTTP Request
Same as Generate, but Body expression → `{{ $json.qaBody }}`.

---

## 6) Log & Gate — Code

```javascript
const qa = $input.item.json;              // QA response
const b  = $('Build QA').item.json;       // brand + post carried

let t = qa.content.find(c => c.type === 'text').text;
const m = t.replace(/```json/gi, '').replace(/```/g, '').match(/\{[\s\S]*\}/);
const verdict = JSON.parse(m[0]);
const passed = String(verdict.verdict || '').toLowerCase() === 'pass';
const status = passed ? 'qa_passed' : 'qa_failed';

const esc = s => String(s).replace(/'/g, "''");
const text = b.post.linkedin;                                  // generated post text
const copy = JSON.stringify({ [b.platform]: text });

const sql = `insert into social.content_items
  (brand_id, lane, topic, copy_by_platform, angle_used, media_type, status, qa_verdict)
values (
  '${b.brand_id}', 'run4_entertainer', '${esc(b.post.idea_label)}',
  '${esc(copy)}'::jsonb, '${esc(b.post.idea_label)}', 'template',
  '${status}', '${esc(JSON.stringify(verdict))}'::jsonb
) returning id, status;`;

return { json: { ...b, verdict, passed, status, text, sql } };
```

---

## 7) Insert content_items — Postgres "Execute a SQL query"
Query expression → `{{ $json.sql }}`.

---

## 8) Prepare Postiz — Code
(the QA gate: a failed post is logged but never published)

```javascript
const g = $('Log & Gate').item.json;         // brand + passed + text + integration_id + platform
if (!g.passed) return [];                     // QA failed → skip publish (already logged qa_failed)

const contentItemId = $input.item.json.id;    // from Insert content_items (returning id)

const postizBody = {
  type: 'now',
  date: new Date().toISOString(),
  posts: [{
    integration: { id: g.integration_id },
    value: [{ content: g.text, image: [] }],
    settings: { __type: g.platform }
  }],
  shortLink: false,
  tags: []
};

return { json: { brand_id: g.brand_id, channel_id: g.channel_id, contentItemId, postizBody } };
```

---

## 9) Publish — HTTP Request
- Method `POST` · URL `https://api.postiz.com/public/v1/posts`
- Auth: Header Auth → your `Authorization` (Postiz) credential
- Body: JSON, expression → `{{ $json.postizBody }}`

---

## 10) Log Published — Code

```javascript
const pub = $input.item.json;                 // Postiz response { postId, integration }
const p   = $('Prepare Postiz').item.json;    // brand_id, channel_id, contentItemId
const esc = s => String(s).replace(/'/g, "''");

const sql = `insert into social.post_log
  (content_item_id, brand_id, channel_id, postiz_post_id, lane, published_at, status)
values (
  '${p.contentItemId}', '${p.brand_id}', '${p.channel_id}',
  '${esc(pub.postId)}', 'run4_entertainer', now(), 'published'
) returning id;`;

return { json: { sql } };
```

---

## 11) Insert post_log — Postgres "Execute a SQL query"
Query expression → `{{ $json.sql }}`.

---

## Test → cut over

1. In **Prepare Postiz**, temporarily set `type: 'draft'` (so a test run doesn't post live).
2. **Test workflow** (full run). It should: read srini.pro from the DB → generate → QA → insert
   content_items → create a Postiz draft → insert post_log. Check the admin dashboard + Postiz drafts.
3. Set `type: 'now'` again, set the Schedule, **Activate** the new workflow, **deactivate** the old srini.pro one.

## Now adding any brand = data only
- Seed the brand + its channels (voice/niche in `brands`, Postiz id + `active=true` in `channels`).
- Flip its `automation_controls` row ON.
- The **same workflow** picks it up on the next run. No n8n change ever again.

## Kill switches (now real)
- **Master off:** set `automation_controls` global `enabled=false` → 0 rows → nothing posts.
- **One brand off:** its brand row `enabled=false`.
- **One channel off:** `channels.active=false`.
(These are what the Controls page in admin will toggle.)
