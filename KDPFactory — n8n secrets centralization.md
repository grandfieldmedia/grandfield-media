# KDPFactory — n8n secrets centralization (one place to rotate)

**Goal:** every key/config value in the n8n runner lives in **one place**, so
rotating a token is a single edit instead of hunting through nodes.

**Approach:** n8n **Variables** (`$vars`) for everything the Code nodes need, and
(optionally, most secure) a **Supabase credential** for the HTTP nodes. After this,
rotating the Supabase key = update it in exactly **two** systems — n8n Variables and
Vercel env — never inside individual nodes. *(Making it truly one place needs the
"move secrets out of n8n" refactor — deferred.)*

> **Do this while rotating.** The Supabase secret + Anthropic key were exposed in
> chat earlier. Rotate both now, and put the NEW values only in these two places
> (n8n Variables + Vercel env `SUPABASE_SERVICE_ROLE_KEY` / `ANTHROPIC_API_KEY`).

---

## Naming convention (LOCKED — Srini 2026-07-13)
Namespace every project-scoped secret **`<SERVICE>-<PRODUCT>-<ENV>`** so it scales to
new products without collisions:
- Supabase, Grandfield Media, Production → **`SB-GFM-PROD`** (this project).
- Future: `SB-NEWPRODUCT-PROD`, and `SB-GFM-DEV` for the dev DB.
- Identifier form (n8n `$vars.` / env vars need underscores): **`SB_GFM_PROD`**.

Account-level keys that aren't per-product/DB (e.g. Anthropic) stay generic.

## Step 1 — create the Variables
n8n → **Settings → Variables** (or **Variables** in the left nav) → add:

| Variable | Value | Secret? |
|---|---|---|
| `SB_GFM_PROD_URL` | `https://ghgqttlmndqijngeyyqy.supabase.co` | no |
| `SB_GFM_PROD_KEY` | the Supabase **secret / service_role** key (freshly rotated) | **yes** |
| `ANTHROPIC_KEY` | the Anthropic API key (freshly rotated) | **yes** |
| `GFM_ADMIN_URL` | `https://admin.grandfieldmedia.com` | no |
| `KDP_ASSEMBLE_SECRET` | `lH7_0SFZvwDtNhPFsyWpi5eNT3210sjy` | yes |
| `GFM_BOOKS_FOLDER_ID` | `11Rf8JqALy-505QYJiemlTlBCxNUS-s8c` | no |

> If your n8n plan doesn't expose **Variables**, use the *fallback* at the bottom.

## Step 2 — replace the inline values, node by node

**Code nodes** (e.g. "Run step") — swap the pasted consts for:
```js
const SB_URL = $vars.SB_GFM_PROD_URL;
const SB_KEY = $vars.SB_GFM_PROD_KEY;   // was: const SB_KEY = 'sb_secret_...'
const ANTHROPIC_KEY = $vars.ANTHROPIC_KEY;
```
(Everything else in the node stays the same — it just reads the vars.)

**HTTP nodes hitting Supabase** — "Load book", "Claim", "Mark step done", "Finalize":
- URL: replace the base with `{{ $vars.SB_GFM_PROD_URL }}/rest/v1/...`
- Headers `apikey` and `Authorization`: `{{ $vars.SB_GFM_PROD_KEY }}` / `Bearer {{ $vars.SB_GFM_PROD_KEY }}`

**"Assemble" HTTP node:**
- URL: `{{ $vars.GFM_ADMIN_URL }}/api/kdp/assemble`
- Body `secret`: `{{ $vars.KDP_ASSEMBLE_SECRET }}`

**"Find Parent Niche" Google Drive search** — in the query, replace the literal
folder id with `{{ $vars.GFM_BOOKS_FOLDER_ID }}`:
```
… and '{{ $vars.GFM_BOOKS_FOLDER_ID }}' in parents and trashed = false
```

*(The Google Drive credential and the To Binary node need no changes — Drive already
uses a credential, and To Binary uses no keys.)*

## Step 3 — verify
Reset the assemble step to pending and fire the webhook (or run a real book). If it
completes, every node is reading from the variables.

## Result
Rotate the Supabase key later → edit `SB_KEY` once in n8n Variables (+ the Vercel env
for the admin app). No more editing individual nodes.

---

## Fallback — no Variables on your plan: a single "Config" node
If `$vars` isn't available, add one **Set** node named **"Config"** right after the
webhook, with fields `SB_GFM_PROD_URL`, `SB_GFM_PROD_KEY`, `ANTHROPIC_KEY`,
`GFM_ADMIN_URL`, `KDP_ASSEMBLE_SECRET`, `GFM_BOOKS_FOLDER_ID`. Then reference them as:
- Code nodes: `const SB_KEY = $('Config').first().json.SB_GFM_PROD_KEY;`
- HTTP/query fields: `{{ $('Config').first().json.SB_GFM_PROD_KEY }}`

One node to edit on rotation. *(Less secure than Variables — the values sit in the
workflow JSON — but still one place.)*

## Most-secure option for the Supabase HTTP nodes (optional)
Instead of a header var, give the HTTP Request nodes a **Predefined Credential Type →
Header Auth** credential holding `apikey: <SB_KEY>` (and set Authorization). The key
then never appears in the node at all; rotate = update the one credential.
