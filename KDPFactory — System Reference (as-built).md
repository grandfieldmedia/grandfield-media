# KDPFactory — System Reference (as-built)

**The definitive "how it actually works" doc.** Last updated 2026-07-13, after the
full build + the "thin conductor" refactor. For the original *design* rationale see
`kdp-book-factory-architecture.md`; for step-by-step n8n wiring see
`KDPFactory — n8n assemble step.md`. This doc is the current truth.

---

## 1. What it does
Takes an approved book **Blueprint** and produces a complete, publish-ready Amazon
KDP book — fully automated, zero manual writing — plus a sellable PDF and a KDP
listing sheet, filed by niche into the company Google Drive.

**Output package per book** (in `Drive/KDPFactory/Books/<Parent Niche>/<Sub Niche>/<Book Title>/`):
| File | Purpose |
|---|---|
| `<Title>.docx` | KDP interior — the template, filled (embedded fonts, 6×9") |
| `<Title>.pdf` | 6×9 sellable PDF for the site (pdfkit, embedded fonts) |
| `<Title> — Metadata.md` | KDP listing sheet: title, subtitle, author, HTML description, 7 keywords, 3 categories, price, series idea, back-cover blurb, cover brief |
| `<Title>.html` | Full book HTML (repurposing) |
| `NN - <Chapter>.docx` ×N | Per-chapter files (fonts stripped, lightweight) |

---

## 2. Architecture — four parts
> **Admin app = the brain · n8n = the nervous system · Supabase = the memory · Google Drive = the hands.**

- **Admin app** (`apps/admin`, Astro on Vercel, `admin.grandfieldmedia.com`) — ALL
  business logic + ALL secrets (via `packages/shared-backend/src/env.ts` → Vercel env).
  The UI (Idea Workbench, Dashboard, Registry) **and** the machine-to-machine
  endpoints that do every step's work.
- **n8n** (Cloud) — a **thin conductor**: it loops through a book's steps and does the
  Google Drive upload (its one genuine strength — verified OAuth, no plumbing). It
  holds **no real secrets** — only the handshake secret + the Drive credential.
- **Supabase** (`kdp_factory` schema, project `ghgqttlmndqijngeyyqy` = SB-GFM-PROD) —
  operating state only: books, chapters (draft_md/summary), the step queue, prompts,
  logs, listing/qa. The manuscript's home is Drive, not here.
- **Google Drive** (company account **grandfieldmedia@gmail.com**) — every book's files.

---

## 3. The pipeline (a book is a state machine)
Steps run one at a time via the n8n loop. `book_steps` is the queue; `claim_next_step`
(atomic, `FOR UPDATE SKIP LOCKED`) is the idempotency guard.

```
approve idea → seeds: contract, outline
  contract  (B2 Fable)  → books.style_contract + fact_sheet
  outline   (B3 Fable)  → creates chapter rows + enqueues: chapter×N, metadata, kdp_check, assemble
  chapter   (B4 Sonnet draft + B5 Haiku summary) → chapters.draft_md + summary   [×N, rolling summaries give coherence]
  metadata  (B7 Fable)  → books.listing
  kdp_check (B8 Opus)   → books.qa   (reads the FULL draft — no truncation)
  assemble               → admin builds files; n8n uploads to Drive
  → book status = ready
```
Sample runs: outline enqueues only chapter 1 + one mid-book chapter.

---

## 4. Admin endpoints (the "fat services")
All are machine-to-machine, bypass the login wall (middleware allow-list), and are
guarded by the **`KDP_ASSEMBLE_SECRET`** handshake secret. Code in `apps/admin/src`.

| Endpoint | Does |
|---|---|
| `POST /api/kdp/steps/claim` | atomic `claim_next_step`; returns `{book_id, step_type, index}` (empty step_type = book done) |
| `POST /api/kdp/steps/run` | does one step's work (contract/outline/chapter/metadata/kdp_check) — `lib/steps.ts`. Calls Claude, writes results, **logs every call to generation_log** |
| `POST /api/kdp/steps/done` | marks the running step done; finalizes the book (`status=ready`) when nothing remains; returns `{has_more}` |
| `POST /api/kdp/assemble` | fills the template DOCX (jszip) + builds PDF (pdfkit) + metadata + html + per-chapter docx; returns 11 files base64/text — `lib/assemble.ts`, `lib/pdf.ts` |

Body for all: `{ "book_id": "...", "secret": "..." , [step_type for /run] }`.
Prompts are read live from `kdp_factory.prompt_templates` (versioned; the product).
Model per prompt: **Haiku** plays (B1/B5), **Fable** finalizes/outlines/metadata
(B1F/B2/B3/B7), **Sonnet** writes (B4/B6), **Opus** judges (B8).

---

## 5. The n8n runner (thin conductor)
```
Webhook → Claim → got-a-step? → is-assemble?
   true  → Assemble → Find Parent Niche → Find Sub Niche → Create Book Folder
           → To Binary → Upload File → Limit → Done → Self-call
   false → Run → Done → Self-call
   (got-a-step false → stop)
```
- Fire it: `POST {book_id}` to `KDP_RUN_WEBHOOK_URL`. It self-chains one step per
  execution (crash-safe; resume by firing the webhook again).
- **Contains no Supabase and no Claude keys** — only the handshake secret (Claim/Run/
  Assemble/Done bodies) and the Google Drive credential.
- Niche folders (`Parent/Sub`) are **pre-created by hand** in the Books folder; the two
  Drive Search nodes find the sub-niche folder to nest under.
- **Gotchas baked in:** `Limit(1)` collapses the per-file upload fan-out so Self-call
  fires once; Drive parent refs use `{{ $('Create Book Folder').first().json.id }}`
  (`$('Node').first()`, never `$node['Node'].first()`).

---

## 6. Secrets & config — where everything lives (rotation)
Convention: `<SERVICE>-<PRODUCT>-<ENV>` (e.g. **SB-GFM-PROD**) → scales to new products.

| Secret / config | Lives in | Rotate by |
|---|---|---|
| Supabase service key, Anthropic key | **Vercel env** (admin project) only | update Vercel env + redeploy |
| Handshake secret (`KDP_ASSEMBLE_SECRET`) | Vercel env **+** n8n (Claim/Run/Assemble/Done) | update both |
| Google Drive auth | n8n Google Drive **credential** | reconnect the credential |
| Books folder id, admin URL | n8n (config, not secret) | — |

After the refactor, **n8n holds no Supabase or Claude keys at all** — the big win.
Optional: move the handshake secret + config into n8n **Variables** (see
`KDPFactory — n8n secrets centralization.md`).

---

## 7. Data model (Supabase `kdp_factory`)
- **books** — blueprint (immutable snapshot; the engine's sole input), style_contract,
  fact_sheet, listing (B7), qa (B8), status, chosen_title/subtitle, niche_slug/name,
  drive_folder_url/master_doc_url, run_type, version.
- **chapters** — index, title, goals, target_words, actual_words, **draft_md** (chapter
  text — temp; Drive is the real home), summary (rolling context), status, cost_usd.
- **book_steps** — the queue: step_type, index, status. `claim_next_step` /
  `has_pending_steps` RPCs.
- **generation_log** — one row per Claude call: prompt_key, model, tokens, cost_usd,
  duration. Powers the Dashboard Money lens.
- **prompt_templates** — B1..B8 versioned rows (edit prompts without redeploy).
- **ideas** (Workbench), **reference_books**, **kdp_niche_defaults**, **kdp_rules**,
  **kdp_sales** (reports feedback loop). Full DDL: `supabase/migrations/0004..0006`.
- Niche knowledge is `registry.niches` (separate schema), snapshotted into the
  blueprint at approve — no FK, no re-read.

---

## 8. Operations
- **Make a book:** approve an idea in the admin Workbench (Sample or Full), which seeds
  the contract+outline steps, then Run → fires the webhook. The pipeline does the rest.
- **Test-fire:** insert a book + `contract`/`outline` pending steps, `POST {book_id}` to
  `KDP_RUN_WEBHOOK_URL`. Watch `book_steps` / `generation_log` / `books.status`.
- **Resume a stall:** re-fire the webhook — `claim_next_step` continues where it stopped.
- **Debug tooling (this Windows box):** query Supabase via REST (service key; no `pg`
  npm); render DOCX→PDF with **Word COM** (`SaveAs2 …,17`) and PDF→PNG with
  **Windows.Data.Pdf** (PowerShell WinRT). Check a Vercel deploy without a token via
  `api.github.com/repos/grandfieldmedia/grandfield-media/commits/<sha>/status`
  (look for `Vercel – grandfield-admin`).
- **Local preview:** `python kdp-factory-assemble-local.py <book_id>` writes the same
  package under `_book-output/` (needs the template docx).

---

## 9. Known open items (all non-blocking)
- **`drive_folder_url` writeback** — not saved to the book yet, so the admin page can't
  link to Drive. Fix: the assemble-branch Done node passes the Create-Book-Folder id;
  `/api/kdp/steps/done` saves it.
- **Duplicate book folders on re-run** — accepted (re-run = fresh files, by design). No dedupe.
- **polish (B6)** — deferred; edits not auto-applied.
- **Support-doc parsing** into B2 — not built (SUPPORT_DOCS passed empty).
- **Register-in-Aviary** hook, **KDP Reports** import — future.
- `- ` markdown bullets render as literal dashes; empty `{{DEDICATION}}` → near-blank page.

---

## 10. Key files
```
apps/admin/src/lib/steps.ts          step handlers (contract/outline/chapter/metadata/kdp_check) + claim/complete
apps/admin/src/lib/assemble.ts       DOCX/HTML/metadata builder (jszip)
apps/admin/src/lib/pdf.ts            6×9 book PDF (pdfkit)
apps/admin/src/lib/factory.ts        ideas/books CRUD + Run/Resume + approveIdea
apps/admin/src/pages/api/kdp/steps/  claim.ts · run.ts · done.ts
apps/admin/src/pages/api/kdp/assemble.ts
apps/admin/public/kdp-book-template.docx   the Master Book Template (canonical: committed)
packages/shared-backend/src/env.ts   the single secret/config surface
supabase/migrations/0003..0006 · supabase/seeds/   schema, RPCs, prompts, niches
kdp-factory-assemble-local.py        local preview twin
```
