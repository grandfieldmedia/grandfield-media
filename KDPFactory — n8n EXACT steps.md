# KDPFactory — n8n Runner: EXACT node-by-node steps

Literal build guide for the ONE workflow. Follow top to bottom. Companion to the
architecture doc `KDPFactory — n8n Runner build.md` (the "why"); this is the "click this".

Conventions used below:
- **SB** = `https://ghgqttlmndqijngeyyqy.supabase.co/rest/v1`
- **{{KEY}}** = your Supabase **service_role** key.
- Every Supabase call uses the **"Supabase KDP" Header Auth credential** (set up in §0) PLUS
  the per-call `Accept-Profile` / `Content-Profile` header shown.

---

## §0 — Credentials (do once)

**A. Supabase KDP (Header Auth)** — n8n → Credentials → New → *Header Auth*.
Actually you need TWO headers, so use *Generic Credential Type → Header Auth* twice OR
use a single **HTTP Header Auth** cred with Name `apikey`, Value `{{KEY}}`, and add
`Authorization: Bearer {{KEY}}` as an extra header on each node. Simplest: create Header
Auth cred **`apikey` = {{KEY}}**, and on every Supabase HTTP node add a second header
`Authorization` = `Bearer {{KEY}}` manually.

**B. Anthropic (Header Auth)** — Name `x-api-key`, Value = your Anthropic key.
(You'll add `anthropic-version: 2023-06-01` and `content-type: application/json` as node headers.)

**C. Google** — add **Google Drive OAuth2** + **Google Docs OAuth2** creds using the
**company** Google account (2FA business account, not personal Gmail).

---

## §1 — The skeleton (build this first, test it, then add branches)

### Node 1 — **Webhook**
- Type: *Webhook*
- HTTP Method: **POST**
- Path: **`kdpfactory-run`**
- Respond: **Immediately**, Response Code **200**, Response Body `{ "ok": true }`
- Save the workflow → copy the **Production URL** (looks like
  `https://<you>.app.n8n.cloud/webhook/kdpfactory-run`). **Send me this URL** → I set
  `KDP_RUN_WEBHOOK_URL` and the admin Run/Resume buttons light up.
- Book id arrives at: **`{{ $json.body.book_id }}`**

### Node 2 — **HTTP Request "Load book"**
- Method **GET**
- URL: `{{ "SB" }}/books?id=eq.{{ $json.body.book_id }}&select=*`
  → literally: `https://ghgqttlmndqijngeyyqy.supabase.co/rest/v1/books?id=eq.{{ $json.body.book_id }}&select=*`
- Authentication: **Supabase KDP** cred
- Headers: `Authorization` = `Bearer {{KEY}}`, `Accept-Profile` = `kdp_factory`
- Options → Response → keep as JSON. (Unique id ⇒ one item; fields at `{{ $json.id }}`,
  `{{ $json.status }}`, `{{ $json.run_type }}`, `{{ $json.blueprint }}`.)

### Node 3 — **IF "already ready"**
- Condition (String): `{{ $json.status }}` **equals** `ready`
- TRUE → **NoOp "Nothing to do"** (dead-ends). FALSE → Node 4.

### Node 4 — **HTTP Request "Claim next step"** (the idempotency guard)
- Method **POST**
- URL: `https://ghgqttlmndqijngeyyqy.supabase.co/rest/v1/rpc/claim_next_step`
- Auth: Supabase KDP; Headers: `Authorization: Bearer {{KEY}}`, `Content-Profile: kdp_factory`,
  `Content-Type: application/json`
- Body (JSON): `{ "p_book_id": "{{ $node['Load book'].json.id }}" }`
- Returns the claimed step row, or a row whose **`id` is null** if none pending.

### Node 5 — **IF "got a step"**
- Condition: `{{ $json.id }}` **is not empty**
- TRUE → Node 6 (Switch). FALSE → Node 9 (Finalize check).

### Node 6 — **Switch "step_type"**
- Mode: *Rules*, Value: `{{ $json.step_type }}`
- 7 outputs (string equals): `contract`, `outline`, `chapter`, `polish`, `assemble`,
  `metadata`, `kdp_check`. Each output → its branch (§2). Keep the claimed step's
  `id`/`index` available downstream via `{{ $node['Claim next step'].json.id }}`.

### Node 7 — **HTTP Request "Mark step done"** (every branch ends here)
- Method **PATCH**
- URL: `.../book_steps?id=eq.{{ $node['Claim next step'].json.id }}`
- Headers: `Authorization: Bearer {{KEY}}`, `Content-Profile: kdp_factory`, `Prefer: return=minimal`
- Body: `{ "status": "done", "finished_at": "{{ $now.toISO() }}" }`

### Node 8 — **HTTP Request "More pending?"**
- Method **POST** → `.../rpc/has_pending_steps`
- Body: `{ "p_book_id": "{{ $node['Load book'].json.id }}" }` → returns `true` / `false`.

### Node 9 — **IF "more pending"**
- Condition (Boolean): `{{ $json }}` is `true`
  (RPC returns a bare boolean; if n8n wraps it, use `{{ $json.has_pending_steps }}`.)
- TRUE → **Node 10 "Self-call"**. FALSE → **Node 11 "Finalize"**.

### Node 10 — **HTTP Request "Self-call"** (re-trigger, fire-and-forget)
- Method **POST** → your **Webhook Production URL** (from Node 1)
- Body: `{ "book_id": "{{ $node['Load book'].json.id }}" }`
- Options → Response → **"Never Error"** and low timeout; this execution then ENDS.

### Node 11 — **HTTP Request "Finalize"**
- PATCH `.../books?id=eq.{{ $node['Load book'].json.id }}`
- Headers: `Content-Profile: kdp_factory`
- Body: `{ "status": "ready", "completed_at": "{{ $now.toISO() }}",
  "drive_folder_url": "{{ ... }}", "master_doc_url": "{{ ... }}", "docx_url": "{{ ... }}",
  "metadata_doc_url": "{{ ... }}" }`

**✅ Test the skeleton now** with a hand-made book that has only `contract`+`outline`
steps (the admin seeds these at Approve). Before adding real branch logic, make each
Switch output just PATCH its step to done — confirm claim→done→self-call→claim loops
through both steps and finishes at Finalize.

---

## §2 — The branches (add one at a time)

**Shared sub-pattern for any Claude step:**

1. **HTTP Request "Get prompt Bx"** — GET
   `.../prompt_templates?key=eq.B4&is_active=eq.true&order=version.desc&limit=1&select=text,model`
   (header `Accept-Profile: kdp_factory`). → `{{ $json.text }}`, `{{ $json.model }}`.
2. **Code "Build prompt"** (JavaScript) — fill the `{PLACEHOLDER}`s in the prompt text
   from the book/blueprint/state. Return `{ system, user, model }`.
3. **HTTP Request "Claude"** — POST `https://api.anthropic.com/v1/messages`
   - Auth: Anthropic cred; Headers `anthropic-version: 2023-06-01`, `content-type: application/json`
   - Body (JSON):
     ```json
     { "model": "{{ $json.model }}", "max_tokens": 4000,
       "system": "{{ $json.system }}",
       "messages": [ { "role": "user", "content": "{{ $json.user }}" } ] }
     ```
   - Output text = `{{ $json.content[0].text }}`.
4. **HTTP Request "Log cost"** — POST `.../generation_log` (Content-Profile: kdp_factory),
   body `{ book_id, step, prompt_key, prompt_version, model, tokens_in:
   {{ $json.usage.input_tokens }}, tokens_out: {{ $json.usage.output_tokens }}, cost_usd }`.
5. Write the step's output to Supabase (state) and/or Drive (text) — see each branch.

### contract (B2 · Fable)
Build prompt from `books.blueprint` + niche context (already inside the blueprint) +
support-doc text. → PATCH `books` set `style_contract`, `fact_sheet` (parse Claude's JSON).

### outline (B3 · Fable) — also the **Planner**
Build from blueprint's agreed TOC + `style_contract`. Claude returns JSON `chapters[]`.
Then TWO writes:
- **Insert chapters:** POST `.../chapters` with one row per chapter
  `{ book_id, index, title, goals, target_words, status:'pending' }`.
- **Insert the rest of the queue** (POST `.../book_steps`):
  - **Full** (`run_type='full'`): one `chapter` step per chapter (`index` = 100 + i),
    then `polish` (900), `assemble` (910), `metadata` (920), `kdp_check` (930).
  - **Sample:** `chapter` for i=1 (index 101) and one mid chapter (~60% → index 100 + round(0.6·N)),
    then `assemble` (910) only.
  (Index gaps keep ordering: contract 0 < outline 1 < chapters 100+ < tail 900+.)

### chapter (B4 Sonnet + B5 Haiku)
- Read `style_contract`, full outline, `chapters.summary` of chapters 1..i-1 (GET
  `.../chapters?book_id=eq.X&index=lt.{{i}}&select=summary&order=index`), fact sheet.
- B4 (Sonnet) drafts the chapter. If word count >20% short, one continuation call.
- **Google Docs "Create"** the chapter as a Doc in the book's Drive folder (create the
  folder on i=1 with **Google Drive "Create Folder"** under `/KDPFactory`; store its id
  on `books.drive_folder_url`).
- B5 (Haiku) summarizes → PATCH `chapters` set `drive_file_id`, `summary`, `actual_words`,
  `tokens_*`, `cost_usd`, `status:'done'`.

### polish (B6 Sonnet) — full only
Read all chapter Docs, run B6, apply targeted edits back to the Docs (Google Docs
`batchUpdate`). No new Drive files.

### assemble (Google only, no AI)
- **Google Drive "Copy File"** the master template (`/templates/Master Book Template`).
- **Google Docs "Update"** (`batchUpdate`): replace `{{TITLE}}`, `{{SUBTITLE}}`,
  `{{PEN_NAME}}`, `{{PEN_NAME_BIO}}`, `{{PUBLISHER}}`, copyright/AI line; insert each
  chapter under Heading 1/2; replace `{{TOC}}` with a hyperlinked contents list.
- **Google Drive "Download/Export"** as **DOCX** into the book folder.
- PATCH `books` set `master_doc_url`, `docx_url`, `drive_folder_url`.

### metadata (B7 Fable) — full only
B7 → a metadata Google Doc; PATCH `books` `metadata_doc_url`, `chosen_title`, `subtitle`.

### kdp_check (B8 Opus) — full only
Run mechanical checks in a **Code** node (metadata char limits, banned terms) first;
then B8 (Opus) for the quality/compliance verdict. If verdict `fail` → PATCH `books`
`status:'failed'`, `error:<reasons>` (skip Finalize). If `pass` → normal flow to Finalize.

---

## §3 — Error & Resume (wrap each branch)

On any branch error, route to a shared **IF "retries left"** on
`{{ $node['Claim next step'].json.attempts }} < 3`:
- TRUE → PATCH the step back to `status:'pending'` → **Self-call** (Node 10) to retry.
- FALSE → PATCH step `status:'failed'` + PATCH `books` `status:'failed', error:<msg>`.

The admin **Resume** button just re-POSTs `{book_id}` to the webhook; `claim_next_step`
picks up the still-pending/failed step and continues. Nothing else to wire.

---

## §4 — Test checklist

1. Skeleton loop (contract+outline as no-op PATCH) → finishes at Finalize.
2. Duplicate-fire the webhook twice fast → 2nd claim returns null id → no double work.
3. Full `outline` branch creates chapters + the chapter/polish/assemble/metadata/kdp_check queue.
4. A `chapter` branch writes a real Google Doc into the book folder + a summary row.
5. `assemble` produces a styled master Doc + DOCX in the folder.
6. Kill mid-run → admin Resume → continues at the same step.
7. `generation_log` has one row per Claude call with sane tokens/cost.

---

## What I've already wired on my side
- `kdp_factory.claim_next_step(book_id)` and `has_pending_steps(book_id)` RPCs — live.
- Admin seeds `contract` + `outline` steps at Approve (you only add chapters + tail in §2).
- B1–B8 prompt text in `kdp_factory.prompt_templates` (GET by key, §2 step 1).
- Run/Resume buttons POST `{book_id}` to your webhook once you send me its URL.
