# Aviary — Finish the machine: Run 2, Run 3, Run 5 (one sitting)

You've built Run 4 (engagement) and Run 1 (assets). These three finish the Aviary. **Every one is
a copy of what you already have** with small edits. Estimated 20–25 min total.

- **Run 2 (Promotions)** = Run 1, but reads the *Promotions* tab (the "push this harder" list). ~5 min.
- **Run 3 (Custom)** = your own words, no AI, no QA, marked posted so it never repeats. ~10 min.
- **Run 5 (Health)** = a single node that records "is the machine healthy" daily. ~3 min.

> Throughout: **keep node names identical to Run 1** (`Pick Asset`, `Build Gen Prompt`, `Log & Gate`,
> `Prepare Postiz`, `Upload to Postiz`, `Insert content_items`). The `$('Node Name')` references only
> work if names match exactly — that was every error we hit.

---

## PREREQ — add two tabs to your Google Sheet

Open **Grandfield Media — Assets** and add these two tabs (row-1 headers exactly):

**Tab `Promotions`** (Run 2 reads this)
| A: Brand | B: Asset Name | C: Promote? | D: Posts/day | E: Platforms | F: Started | G: Notes |
|---|---|---|---|---|---|---|
| srini-pro | SAP AI Certificate Mastery Kit | ON | 1 | all | 2026-07-12 | launch |

- **Asset Name** must exactly match a **Name** in the `Assets` tab (that's how Run 2 looks up its link/image).

**Tab `Custom Posts`** (Run 3 reads this)
| A: Brand | B: Platform | C: Post text | D: Image URL | E: Publish? | F: Posted? |
|---|---|---|---|---|---|
| srini-pro | linkedin | *(your exact words, line breaks and all)* | *(optional)* | ON | *(leave empty)* |

- **Post text** = published verbatim, no AI. **Posted?** = leave empty; the machine writes ✓ so it never re-posts.

---

# RUN 2 — Promotions  (duplicate Run 1)

Duplicate your **Run 1** workflow → rename `Aviary — Run 2 (Promotions)`. Then **4 edits**:

### Edit 1 — add "Read Promotions Sheet"
Add a **Google Sheets** node named `Read Promotions Sheet` (same as Read Assets Sheet, but **Sheet = `Promotions`**). Wire:
```
Get Live Brands → Read Promotions Sheet → Read Assets Sheet → Pick Asset
```
(Keep `Read Assets Sheet` — Run 2 still needs it for the product's link/image.)

### Edit 2 — replace the code in `Pick Asset`  (keep the node name `Pick Asset`)
This picks a product from the **Promotions** list and looks up its details from **Assets**:
```javascript
const brands = $('Get Live Brands').all().map(i => i.json);
const promos = $('Read Promotions Sheet').all().map(i => i.json);
const assets = $('Read Assets Sheet').all().map(i => i.json);
const out = [];

for (const b of brands) {
  const pool = promos.filter(r =>
    String(r['Brand'] || '').trim() === b.slug &&
    String(r['Promote?'] || '').trim().toUpperCase() === 'ON' &&
    String(r['Asset Name'] || '').trim() !== ''
  );
  if (!pool.length) continue;                                  // nothing being pushed → skip
  const p = pool[Math.floor(Math.random() * pool.length)];
  const name = String(p['Asset Name']).trim();
  const a = assets.find(x => String(x['Name'] || '').trim() === name);
  if (!a) continue;                                            // name not found in Assets

  out.push({ json: {
    ...b,
    asset_name:  name,
    asset_type:  String(a['Type'] || '').trim(),
    asset_price: String(a['Price'] || '').trim(),
    asset_desc:  String(a['Description'] || '').trim(),
    asset_url:   String(a['URL'] || '').trim(),
    image_url:   String(a['Image URL'] || '').trim(),
  }});
}
return out;
```

### Edit 3 — `Log & Gate`: change the lane
`'run1_assets'` → **`'run2_promotions'`**

### Edit 4 — `Log Published`: change the lane
`'run1_assets'` → **`'run2_promotions'`**

**That's it.** Everything else (Build Gen Prompt, Generate, Build QA, QA Check, image nodes,
Prepare Postiz, Publish) is untouched — it reuses the same `run1_generate`/`run1_qa` prompts (a promo
is a promo). Test on `type:'draft'`, then flip `'now'` + Schedule (a 3rd distinct hour) + Activate.

---

# RUN 3 — Custom  (duplicate Run 1, then gut the AI)

Your exact posts, published as-is. Duplicate **Run 1** → rename `Aviary — Run 3 (Custom)`.

### Step 1 — DELETE 5 nodes (the AI + QA)
Delete: **Build Gen Prompt · Generate · Build QA · QA Check · Log & Gate**.

### Step 2 — swap the sheet + picker
- Rename `Read Assets Sheet` → point its **Sheet = `Custom Posts`** (rename the node `Read Custom Sheet`).
- Replace the code in `Pick Asset` (rename it `Pick Custom`) with:
```javascript
const brands = $('Get Live Brands').all().map(i => i.json);
const rows   = $('Read Custom Sheet').all().map(i => i.json);
const out = [];
for (const b of brands) {
  const row = rows.find(r =>
    String(r['Brand'] || '').trim() === b.slug &&
    String(r['Publish?'] || '').trim().toUpperCase() === 'ON' &&
    String(r['Posted?'] || '').trim() === '' &&
    String(r['Post text'] || '').trim() !== ''
  );
  if (!row) continue;                          // nothing new to post
  out.push({ json: {
    ...b,
    post_text:  String(row['Post text']).trim(),
    image_url:  String(row['Image URL'] || '').trim(),
    row_number: row.row_number,
  }});
}
return out;
```
> Since you renamed `Pick Asset` → `Pick Custom`, update **Download Image**'s URL to
> `={{ $('Pick Custom').item.json.image_url }}`.

### Step 3 — rewire + simplify the insert
Wire: `Pick Custom → Insert content_items → Download Image → Upload to Postiz → Prepare Postiz → Publish → Log Published → Insert post_log → Update Custom Sheet`.

Replace **Insert content_items** query (no QA fields) — make it a Code node `Build Insert` feeding the
Postgres node, OR just set the Postgres query to build from expressions. Easiest: add a Code node
`Build Custom Insert` before Insert content_items:
```javascript
const g = $('Pick Custom').item.json;
const esc = s => String(s).replace(/'/g, "''");
const copy = JSON.stringify({ [g.platform]: g.post_text });
const mediaType = g.image_url ? 'mockup' : 'none';
const sql = `insert into social.content_items (brand_id, lane, topic, copy_by_platform, media_type, status)
values ('${g.brand_id}', 'run3_custom', 'custom post', '${esc(copy)}'::jsonb, '${mediaType}', 'published')
returning id;`;
return { json: { ...g, sql } };
```
Set **Insert content_items** query to `{{ $json.sql }}` (same as before).

### Step 4 — Prepare Postiz (verbatim, no generation)
```javascript
const g = $('Pick Custom').item.json;
const contentItemId = $('Insert content_items').item.json.id;
const up = $('Upload to Postiz').item.json;
const image = (up && up.id && up.path) ? [{ id: up.id, path: up.path }] : [];

const postizBody = {
  type: 'draft',                                    // → 'now' to go live
  date: new Date(Date.now() + 2*60*1000).toISOString(),
  posts: [{ integration: { id: g.integration_id },
    value: [{ content: g.post_text, image }],       // YOUR exact text
    settings: { __type: g.platform } }],
  shortLink: false, tags: []
};
return { json: { brand_id: g.brand_id, channel_id: g.channel_id, contentItemId,
  row_number: g.row_number, postType: postizBody.type, postizBody } };
```

### Step 5 — Log Published: lane `run3_custom` + carry row_number
```javascript
const pub = $input.item.json;
const p   = $('Prepare Postiz').item.json;
const esc = s => String(s).replace(/'/g, "''");
const status = p.postType === 'now' ? 'published' : 'draft';
const sql = `insert into social.post_log
  (content_item_id, brand_id, channel_id, postiz_post_id, lane, published_at, status)
values ('${p.contentItemId}', '${p.brand_id}', '${p.channel_id}', '${esc(pub.postId)}',
  'run3_custom', now(), '${status}') returning id;`;
return { json: { sql, row_number: p.row_number } };
```

### Step 6 — NEW node: "Update Custom Sheet" (mark Posted ✓)
Add a **Google Sheets** node after `Insert post_log`:
- Operation: **Update Row**
- Document: **Grandfield Media — Assets** · Sheet: **Custom Posts**
- **Column to match on: `row_number`** → value `={{ $('Prepare Postiz').item.json.row_number }}`
- Map column **`Posted?` = `✓`**

This flips the row to posted so it's never published again. Test on `draft`, then `now` + Schedule + Activate.

---

# RUN 5 — Health  (one node, ~3 min)

A daily heartbeat that records whether the machine is healthy. Not a posting lane — just monitoring.

### Build (2 nodes total)
1. **Schedule Trigger** — once a day (any hour).
2. **Postgres → "Execute a SQL query"** named `Write Health`, paste:
```sql
insert into social.health_status (component, status, detail, checked_at) values
  ('automation',
   (case when exists (select 1 from social.automation_controls where scope='global' and enabled) then 'ok' else 'broken' end)::social.component_health,
   'global master switch', now()),
  ('recent_posts',
   (case when (select count(*) from social.post_log where created_at > now() - interval '48 hours') > 0 then 'ok' else 'warn' end)::social.component_health,
   (select count(*)::text from social.post_log where created_at > now() - interval '48 hours') || ' posts in last 48h', now()),
  ('qa_health',
   (case when (select count(*) from social.content_items where status = 'qa_failed' and created_at > now() - interval '7 days') > 5 then 'warn' else 'ok' end)::social.component_health,
   (select count(*)::text from social.content_items where status = 'qa_failed' and created_at > now() - interval '7 days') || ' QA fails in 7d', now())
on conflict (component) do update set status = excluded.status, detail = excluded.detail, checked_at = excluded.checked_at;
```
Use your **prod Postgres** credential. Execute once, then **Activate**. The admin dashboard shows these
under a **Health** panel (I added it while you were away).

---

## Final go-live checklist (all lanes)
| Lane | Schedule (IST, staggered so no two fire together) | Live? |
|---|---|---|
| Run 4 Entertainer | 11:00 am | flip type `now`, Activate |
| Run 1 Assets | 3:00 pm | flip type `now`, Activate |
| Run 2 Promotions | 7:00 pm | flip type `now`, Activate |
| Run 3 Custom | 9:00 am | flip type `now`, Activate |
| Run 5 Health | any (e.g., 6:00 am) | Activate |

Stagger the hours — LinkedIn throttles back-to-back posts. Delete all test drafts in Postiz before flipping live.

**When all five are Activated, the Aviary is done: it writes, checks, promotes, and reports — hands-off.** 🐦
