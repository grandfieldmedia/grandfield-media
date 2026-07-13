# KDPFactory — n8n Runner (the ONE flow) build guide

**Date:** 2026-07-12
**Scope:** ONE n8n workflow that takes a `book_id` and produces the book. One trigger,
user-driven, self-re-triggering, one step per execution, crash-safe/resumable.
**Design source:** `kdp-book-factory-architecture.md` (§ Orchestration).

> **Mental model — a switch.** The user flips it ON (Run → webhook), the factory runs
> to done, and it switches itself OFF (book `ready`). No schedulers, no sweepers. If a
> step dies, the book sits visibly `failed`/stalled until the user clicks **Resume**
> (fires the same webhook). `completed` is the ONLY "all good" signal.

> **The golden rule:** Supabase holds STATE only (queue, statuses, logs, summaries,
> links). Every word of the book lives in **Google Drive**. Chapters/master doc/exports
> are Drive files; Supabase stores only their ids/urls.

---

## 0. Prerequisites (credentials in n8n)

Create/confirm these n8n credentials once (reuse the Aviary's where noted):

1. **Supabase (HTTP Header Auth)** — same project as the Aviary.
   - Base URL: `https://ghgqttlmndqijngeyyqy.supabase.co/rest/v1`
   - Headers: `apikey: <SERVICE_ROLE_KEY>` and `Authorization: Bearer <SERVICE_ROLE_KEY>`
   - Add header `Content-Profile: kdp_factory` (writes) and `Accept-Profile: kdp_factory`
     (reads) so PostgREST targets the **kdp_factory** schema. *(Also expose `kdp_factory`
     under Supabase → Settings → Data API → Exposed schemas.)*
2. **Anthropic (Claude) API** — HTTP Header Auth: `x-api-key: <ANTHROPIC_API_KEY>`,
   `anthropic-version: 2023-06-01`. (Same key the Aviary uses, or a new one.)
3. **Google (Drive + Docs)** — the **company** Google account (dedicated business
   account, 2FA — NOT a personal Gmail). Scopes: Drive + Docs. This account owns the
   `/KDPFactory` books folder and the `/templates` master template.
4. **Model IDs** (pin as n8n workflow variables, re-verify at build time):
   - `MODEL_FABLE = claude-fable-5` (contract, outline, metadata)
   - `MODEL_SONNET = claude-sonnet-5` (chapter draft, polish)
   - `MODEL_HAIKU = claude-haiku-4-5-20251001` (chapter summary)
   - `MODEL_OPUS = claude-opus-4-8` (KDP Check)

The admin app writes the **Blueprint** to `kdp_factory.books.blueprint` at Approve. n8n
never receives the blueprint in the webhook — only `{ "book_id": "<uuid>" }`.

---

## 1. The step queue (how the flow knows what to do)

n8n reads/writes `kdp_factory.book_steps` — the single source of truth. Step kinds
(`step_type` enum): `contract · outline · chapter · polish · assemble · metadata · kdp_check`.
Status (`run_status`): `pending · running · done · failed`.

**Who seeds the queue:** the FIRST execution. On entry, if the book has zero steps, the
**Planner** node inserts the opening steps:

- **Full run** (`books.run_type='full'`): `contract`, `outline`.
- **Sample run** (`books.run_type='sample'`): `contract`, `outline`.

Chapters aren't known until the outline exists, so after `outline` completes the Planner
inserts the rest (see §3, step B3 post-action):

- **Full:** `chapter` × N (index 1..N), then `polish`, `assemble`, `metadata`, `kdp_check`.
- **Sample:** `chapter` for index 1 and one mid-book index (~60% through), then `assemble`
  only. (Sample = preview doc; never `polish`/`metadata`/`kdp_check`, never publishable.)

---

## 2. The workflow skeleton (node by node)

**Trigger A — Webhook** (POST, path `/kdpfactory-run`). Body: `{ book_id }`.

1. **Load book** — HTTP GET
   `/books?id=eq.{{$json.book_id}}&select=*` (Accept-Profile: kdp_factory). → `book`.
2. **Guard** — IF `book.status = 'ready'` → **STOP** (nothing to do).
3. **Ensure queue (Planner-open)** — HTTP GET
   `/book_steps?book_id=eq.{{book_id}}&select=id` → IF empty, insert the opening steps
   (§1) and set `books.status='briefing'`.
4. **Claim next step (THE idempotency guard)** — one atomic update: claim the oldest
   `pending` step for this book. Use an RPC or a PATCH with a filter that also flips
   status in the same call so a duplicate webhook claims nothing:
   `PATCH /book_steps?book_id=eq.{{book_id}}&status=eq.pending&order=index.asc&limit=1`
   body `{ "status":"running", "started_at":"now()", "attempts": attempts+1 }`,
   header `Prefer: return=representation`. → IF no row returned → **another run holds it,
   or none pending → go to Finalize check** (node 8).
5. **Switch on `step_type`** → one branch each (§3). Each branch:
   - reads what it needs (blueprint, style_contract, outline, rolling summaries) from
     Supabase,
   - calls Claude (or Google for `assemble`),
   - writes its output to **Drive** (chapters/master doc) and its **state** to Supabase,
   - writes one **generation_log** row (tokens, cost, model, duration).
6. **Mark step done** — PATCH the claimed step `status='done', finished_at=now()`.
   Update `books.current_step` + `status` to the human-readable stage.
7. **More pending?** — HTTP GET `/book_steps?book_id=eq.{{book_id}}&status=eq.pending&select=id&limit=1`.
   - IF yes → **self-call Trigger A** (HTTP POST the webhook URL with `{book_id}`), then
     **END** this execution (returns in seconds — no long-running execution).
   - IF no → **Finalize**.
8. **Finalize** — set `books.status='ready'`, `completed_at=now()`, write the Drive links
   (`drive_folder_url`, `master_doc_url`, `docx_url`, `metadata_doc_url`). END.

**Error path (wrap each branch):** on failure → PATCH step `status` back to `pending` IF
`attempts < 3` (self-retry via the self-call), ELSE PATCH step `status='failed'` +
`books.status='failed'`, `books.error=<message>`. The **Resume** button in admin just
re-fires Trigger A; the claim logic picks up the still-`pending`/`failed` step.

---

## 3. The step branches (what each does)

Each Claude call = HTTP POST `https://api.anthropic.com/v1/messages` with the pinned
model, the prompt text pulled from `kdp_factory.prompt_templates` (key + latest active
version), and the variables filled from the book. Log every call to `generation_log`.

| Branch | Model | Reads | Does | Writes |
|---|---|---|---|---|
| **contract** (B2) | FABLE | blueprint, niche snapshot, support-doc text | Build `style_contract` + `fact_sheet` to the reference standard | `books.style_contract`, `books.fact_sheet` |
| **outline** (B3) | FABLE | blueprint (agreed TOC), style_contract | Expand the agreed TOC into a per-chapter production outline (topics, key points, word budgets). Log any TOC deviation. **Then Planner-chapters:** insert `chapter`×N (+ polish/assemble/metadata/kdp_check for full, or ch1+mid+assemble for sample) and one `chapters` row per chapter (index, title, goals, target_words, status=pending). | `books.style_contract.outline`, new `book_steps`, new `chapters` |
| **chapter** (B4 + B5) | SONNET draft, HAIKU summary | style_contract, full outline, rolling summaries of ch 1..i-1, fact_sheet, reference_profile | Draft chapter i (enforce word count; 1 continuation call if >20% short). Create a **Google Doc** in the book's Drive folder with the chapter text. Then summarize (~200 words) for rolling context. | Drive chapter Doc → `chapters.drive_file_id`; `chapters.summary`, actual_words, tokens, cost; `chapters.status='done'` |
| **polish** (B6) *(full only)* | SONNET | all chapter Docs | Continuity + naturalness + AI-tell removal as targeted edits across chapters | updated chapter Docs |
| **assemble** | Google (no AI) | chapter Docs, blueprint (pen name/publisher) | Copy the **Master Book Template** (`/templates`), fill placeholders, insert chapters under Heading styles, generate the hyperlinked TOC (replace `{{TOC}}`), export via Drive API to **DOCX** into the book folder | `books.master_doc_url`, `books.docx_url`, `books.drive_folder_url` |
| **metadata** (B7) *(full only)* | FABLE | book, blueprint, kdp_niche_defaults | Title/subtitle finalize, description (KDP HTML, ≤4000 chars), 7 keywords, 3 categories, blurb, price idea, cover brief → a metadata Google Doc | `books.metadata_doc_url`, `books.chosen_title/subtitle` |
| **kdp_check** (B8) *(full only)* | OPUS | assembled book, kdp rules, niche compliance | Amazon-style pre-flight: quality/repetition/filler, metadata limits, YMYL compliance, match vs reference profile. Mechanical checks (char limits, banned terms) run as n8n code, not tokens. **Reject → book `failed` with reasons.** | `books.status` (ready or failed), notes |

---

## 4. Google Drive/Docs specifics (the `assemble` branch)

1. At first chapter, create a Drive folder named after the book under `/KDPFactory/`.
   Store its id on `books.drive_folder_url`. Each chapter Doc lands here as produced.
2. `assemble` does NOT format from scratch — it **copies** `/templates/Master Book
   Template` (Drive `files.copy`), then via Docs API `batchUpdate`:
   - fill placeholders (`{{TITLE}}`, `{{SUBTITLE}}`, `{{PEN_NAME}}`, `{{PEN_NAME_BIO}}`,
     `{{PUBLISHER}}`, copyright/AI-disclosure line),
   - insert each chapter's text under Heading 1 (chapter title) / Heading 2 (sections),
   - replace `{{TOC}}` with a hyperlinked contents list (one line per chapter, via Docs
     heading ids) — **generate it as real content, never a Word TOC field**.
3. Export the master Doc via Drive `files.export` to **DOCX** into the book folder;
   store the link on `books.docx_url`. (DOCX only for v1; EPUB optional later.)

---

## 5. Test checklist (before real books)

- [ ] Fire the webhook with a hand-made `books` row (`run_type='sample'`, a small
      blueprint). Watch `book_steps` claim → done, execution returns in seconds each time.
- [ ] Duplicate-fire the webhook twice fast → second claims nothing, no double work.
- [ ] Kill n8n mid-run → click Resume (re-fire webhook) → continues at the same step.
- [ ] Sample run produces: folder + chapter Docs (ch1 + mid) + a preview master Doc.
      No polish/metadata/kdp_check steps created.
- [ ] Full run produces the whole queue, a styled master Doc, a DOCX export, a metadata
      Doc, and ends `books.status='ready'` with all Drive links populated.
- [ ] `generation_log` has one row per Claude call with sane token/cost numbers.

---

## 6. What the admin app gives you (my side, in parallel)

- **Run button** → POST to your webhook with `{book_id}` (I'll put the webhook URL in an
  env var — send it to me when you have it).
- **Resume button** → same webhook, same `{book_id}`.
- The `books`, `book_steps`, `chapters`, `generation_log`, `prompt_templates` rows your
  flow reads/writes are already live in `kdp_factory`.
- The **B-series prompt text** lives in `kdp_factory.prompt_templates` (key `B2`..`B8`) —
  I'll seed initial versions; you refine them in the Prompt Editor.

**The one thing I need back from you:** the **production webhook URL** once the flow's
Trigger A is saved. That's the only wire between the app and your flow.
