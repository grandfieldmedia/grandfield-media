# Aviary — Run 1 (Assets / Promotion lane) — COMPLETE n8n build

**Run 1 = Run 4 + two things:** (1) it reads a **product** from the Assets Google Sheet, and
(2) the post carries a **tracked link** (UTM) so clicks trace back to the exact post. Everything
else — kill-switch check, generate, QA gate, publish, logging — is identical to Run 4.

**So don't build from scratch. Duplicate Run 4** (n8n → workflow menu → **Duplicate**) → rename
`Aviary — Run 1 (Assets)`. Then make the changes below. Run 4 keeps running untouched.

### Prerequisites (do first)
1. **Run `run1-config.sql` in prod** (adds `run1_generate` + `run1_qa` prompts).
2. **Google Sheets connected in n8n** + your **Sheet ID** (`docs.google.com/spreadsheets/d/<ID>/edit`).
3. Assets sheet has the headers: `Brand · Type · Name · URL · Price · Description · Promote? · Priority · Asset ID` (+ `Image URL` for Part B).

---

## New node order (2 new nodes near the front)

```
Schedule Trigger (+ Manual)
  → Get Live Brands       (Postgres — CHANGED: run1 prompts + slug)
  → Read Assets Sheet     (Google Sheets — NEW)
  → Pick Asset            (Code — NEW: choose one ON product per brand)
  → Build Gen Prompt      (Code — CHANGED: tracked link + asset blanks)
  → Generate              (HTTP — unchanged)
  → Build QA              (Code — unchanged)
  → QA Check              (HTTP — unchanged)
  → Log & Gate            (Code — CHANGED: lane run1_assets + asset topic/link)
  → Insert content_items  (Postgres — unchanged)
  → Prepare Postiz        (Code — CHANGED: date +2 min; image in Part B)
  → Publish               (HTTP — unchanged)
  → Log Published         (Code — CHANGED: lane run1_assets)
  → Insert post_log       (Postgres — unchanged)
```

---

## 1) Get Live Brands — CHANGED (add `slug`, swap to run1 prompts)

Same query as Run 4 with two edits: add `b.slug`, and point the two prompt sub-selects at `run1_*`.

```sql
select
  b.id            as brand_id,
  b.slug          as slug,
  b.name          as brand_name,
  b.niche         as niche,
  b.voice_profile as voice_profile,
  coalesce(b.compliance_rules, '') as compliance,
  c.id            as channel_id,
  c.platform      as platform,
  c.postiz_integration_id as integration_id,
  (select text from social.prompt_templates where key = 'run1_generate' and active order by version desc limit 1) as gen_template,
  (select text from social.prompt_templates where key = 'run1_qa'       and active order by version desc limit 1) as qa_template
from social.brands b
join social.channels c
  on c.brand_id = b.id and c.active = true and c.postiz_integration_id is not null
join social.automation_controls g
  on g.scope = 'global' and g.enabled = true
join social.automation_controls ab
  on ab.scope = 'brand' and ab.brand_id = b.id and ab.enabled = true
where b.status = 'active';
```

---

## 2) Read Assets Sheet — NEW (Google Sheets node)

- Add node → **Google Sheets** → Resource **Sheet Within Document**, Operation **Get Row(s)**.
- Credential: your Google account.
- Document: **By ID** → paste your **Sheet ID**.
- Sheet: **By Name** → `Assets`.
- Leave filters empty (returns all rows). Each row becomes an item whose keys are the header names
  (`Brand`, `Name`, `URL`, `Price`, `Description`, `Promote?`, `Image URL`, …).

Wire: **Get Live Brands → Read Assets Sheet → Pick Asset.**

---

## 3) Pick Asset — NEW (Code, "Run Once for All Items")

For each live brand, keep its **ON** products, pick one at random, and merge the product onto the
brand's config. Brands with no ON product are skipped (nothing to promote).

```javascript
const brands = $('Get Live Brands').all().map(i => i.json);
const rows   = $('Read Assets Sheet').all().map(i => i.json);
const out = [];

for (const b of brands) {
  const pool = rows.filter(r =>
    String(r['Brand'] || '').trim() === b.slug &&
    String(r['Promote?'] || '').trim().toUpperCase() === 'ON' &&
    String(r['Name'] || '').trim() !== ''
  );
  if (!pool.length) continue;                                  // no product → skip brand
  const a = pool[Math.floor(Math.random() * pool.length)];     // random rotation

  out.push({ json: {
    ...b,
    asset_name:  String(a['Name'] || '').trim(),
    asset_type:  String(a['Type'] || '').trim(),
    asset_price: String(a['Price'] || '').trim(),
    asset_desc:  String(a['Description'] || '').trim(),
    asset_url:   String(a['URL'] || '').trim(),
    image_url:   String(a['Image URL'] || '').trim(),
  }});
}
return out;
```

---

## 4) Build Gen Prompt — CHANGED (tracked link + asset blanks)

```javascript
const b = $input.item.json;
const platformName = { linkedin:'LinkedIn', facebook:'Facebook', instagram:'Instagram',
  pinterest:'Pinterest', youtube:'YouTube' }[b.platform] || b.platform;

// tracked link — clicks trace back to platform + this product
const slug = b.asset_name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40);
const sep  = b.asset_url.includes('?') ? '&' : '?';
const trackedUrl = `${b.asset_url}${sep}utm_source=${b.platform}&utm_medium=social-auto&utm_campaign=${slug}`;
const priceLabel = b.asset_price ? `$${b.asset_price}` : 'see the page';

const content = b.gen_template
  .replaceAll('{BRAND}', b.brand_name)
  .replaceAll('{VOICE_PROFILE}', b.voice_profile || '')
  .replaceAll('{NICHE}', b.niche || '')
  .replaceAll('{PLATFORM}', platformName)
  .replaceAll('{COMPLIANCE}', b.compliance || '')
  .replaceAll('{ASSET_NAME}', b.asset_name)
  .replaceAll('{ASSET_TYPE}', b.asset_type || 'resource')
  .replaceAll('{ASSET_PRICE}', priceLabel)
  .replaceAll('{ASSET_DESCRIPTION}', b.asset_desc || '')
  .replaceAll('{ASSET_URL}', trackedUrl);

return { json: { ...b, tracked_url: trackedUrl,
  genBody: { model: 'claude-sonnet-5', max_tokens: 2000, messages: [{ role:'user', content }] } } };
```

---

## 5) Generate · 6) Build QA · 7) QA Check — UNCHANGED
These are byte-for-byte the Run 4 nodes. `run1_generate` returns the same JSON shape
(`{linkedin, idea_label, image_concept}`), so Build QA/QA Check work as-is.

---

## 8) Log & Gate — CHANGED (lane + asset topic + store the link)

```javascript
const qa = $input.item.json;
const b  = $('Build QA').item.json;

let t = qa.content.find(c => c.type === 'text').text;
const m = t.replace(/```json/gi,'').replace(/```/g,'').match(/\{[\s\S]*\}/);
const verdict = JSON.parse(m[0]);
const passed = String(verdict.verdict || '').toLowerCase() === 'pass';
const status = passed ? 'qa_passed' : 'qa_failed';

const esc  = s => String(s).replace(/'/g, "''");
const text = b.post.linkedin;
const copy = JSON.stringify({ [b.platform]: text });
const mediaType = b.image_url ? 'mockup' : 'none';

const sql = `insert into social.content_items
  (brand_id, lane, topic, copy_by_platform, angle_used, media_type, media_ref, status, qa_verdict)
values (
  '${b.brand_id}', 'run1_assets', '${esc(b.asset_name)}',
  '${esc(copy)}'::jsonb, '${esc(b.post.idea_label)}', '${mediaType}', '${esc(b.tracked_url)}',
  '${status}', '${esc(JSON.stringify(verdict))}'::jsonb
) returning id, status;`;

return { json: { ...b, verdict, passed, status, text, sql } };
```

## 9) Insert content_items — UNCHANGED  (`{{ $json.sql }}`)

---

## 10) Prepare Postiz — CHANGED (date +2 min; text-only for now)

```javascript
const g = $('Log & Gate').item.json;
if (!g.passed) return [];                          // QA failed → logged, never published
const contentItemId = $input.item.json.id;         // from Insert content_items

const postizBody = {
  type: 'now',
  date: new Date(Date.now() + 2*60*1000).toISOString(),   // 2 min ahead — reliable fire
  posts: [{
    integration: { id: g.integration_id },
    value: [{ content: g.text, image: [] }],       // link is already inside g.text
    settings: { __type: g.platform }
  }],
  shortLink: false, tags: []
};

return { json: { brand_id: g.brand_id, channel_id: g.channel_id, contentItemId,
  postType: postizBody.type, postizBody } };
```

## 11) Publish — UNCHANGED  (`{{ $json.postizBody }}`)

## 12) Log Published — CHANGED (lane only)
Identical to Run 4, change `'run4_entertainer'` → `'run1_assets'`:

```javascript
const pub = $input.item.json;
const p   = $('Prepare Postiz').item.json;
const esc = s => String(s).replace(/'/g, "''");
const status = p.postType === 'now' ? 'published' : 'draft';

const sql = `insert into social.post_log
  (content_item_id, brand_id, channel_id, postiz_post_id, lane, published_at, status)
values (
  '${p.contentItemId}', '${p.brand_id}', '${p.channel_id}',
  '${esc(pub.postId)}', 'run1_assets', now(), '${status}'
) returning id;`;

return { json: { sql } };
```

## 13) Insert post_log — UNCHANGED  (`{{ $json.sql }}`)

---

## Test → cut over
1. In **Prepare Postiz**, temporarily set `type: 'draft'`.
2. **Test workflow** — should: read a live brand → pick a product → write a promo with the tracked
   link → QA → insert content_items → Postiz **draft**. Check the admin dashboard (lane **Assets**)
   and the Postiz draft (open the link — confirm the `?utm_...` is on it).
3. Set `type: 'now'`, set the Schedule (a different hour than Run 4 so they don't collide),
   **Activate**.

---

# PART B — Add product images (do after Part A works)

Attaches the product's `Image URL` when present; text-only when blank. **No IF branch needed** —
we let the image nodes fail softly on a blank URL.

Insert **two nodes between `Insert content_items` and `Prepare Postiz`**:

### Download Image — HTTP Request
- Method `GET` · URL `={{ $('Pick Asset').item.json.image_url }}`
- **Options → Response → Response Format: `File`**
- **Settings → On Error: `Continue`** (blank/broken URL → skips instead of failing the run)

### Upload to Postiz — HTTP Request
- Method `POST` · URL `https://api.postiz.com/public/v1/upload`
- Auth: Header Auth → your **Postiz `Authorization`** credential
- Send Body: ON · Body Content Type **Form-Data (multipart)**
- Parameter: Name `file` · Type **n8n Binary File** · Input Data Field `data`
- **Settings → On Error: `Continue`**

### Prepare Postiz — replace with the image-aware version
```javascript
const g = $('Log & Gate').item.json;
if (!g.passed) return [];
const contentItemId = $('Insert content_items').item.json.id;   // id, since image nodes replaced $json

const up = $('Upload to Postiz').item.json;                     // {id, path} or an error object
const image = (up && up.id && up.path) ? [{ id: up.id, path: up.path }] : [];

const postizBody = {
  type: 'now',
  date: new Date(Date.now() + 2*60*1000).toISOString(),
  posts: [{
    integration: { id: g.integration_id },
    value: [{ content: g.text, image }],
    settings: { __type: g.platform }
  }],
  shortLink: false, tags: []
};

return { json: { brand_id: g.brand_id, channel_id: g.channel_id, contentItemId,
  postType: postizBody.type, postizBody } };
```

Test: one product **with** an Image URL (image attaches) and one **without** (text-only) — both publish.

---

## Then Run 2 & Run 3 (previews — same skeleton)
- **Run 2 (Promotions):** same workflow, but `Read Assets Sheet` → the **Promotions** tab, and
  `Pick Asset` honors `Posts/day`. Reuses `run1_generate`/`run1_qa`. (It's the "push harder" version.)
- **Run 3 (Custom):** simplest — read the **Custom Posts** tab, **no Generate/QA** (your words are
  final), attach optional image, publish, mark `Posted? ✓`. A short 6-node workflow.
