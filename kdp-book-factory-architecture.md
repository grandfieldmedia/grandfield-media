# KDPFactory — the KDP Books Factory

**Full name:** KDP Books Factory — the automated book production system
**Short name (LOCKED 2026-07-12):** **KDPFactory**
**Naming principle (Srini's rule): one tool, one purpose — the Factory family.** KDPFactory generates Amazon KDP books — end of story. Future siblings, each its own separate tool with its own doc: **PlannerFactory** (PDF planners/journals), **PPTFactory** (presentation templates/decks), and any later `*Factory` for a new asset type. Each reuses the same architecture *patterns* (Niche Registry, prompt-as-data, n8n step runner, cost ledger, Register-in-Aviary hook) but they are never merged into one product. Names considered and retired for this tool: Hatchery, Bindery, Galley, Colophon, Scriptorium.

**Date:** 2026-07-12
**Status:** ✅ **DESIGN CLOSED (v1) — 2026-07-12.** All architecture decisions locked with Srini across the full working session. Not built yet — awaiting build go-ahead. Any change from here is a dated amendment to this doc, not a redesign.
**Stack (confirmed 2026-07-12):** `apps/admin` module (new Factory section — the window and control surface) + Supabase (`factory` schema — blueprint, statuses, step queue, logs, links; **never the manuscript**) + n8n Cloud (owns ALL of production) + Claude API (Sonnet-class drafting) + **the COMPANY Google Drive (decided 2026-07-12: a dedicated business Google account, 2FA — the same pattern as the Aviary's Sheets and image folders; never a personal Gmail). Every word of every book lives here — chapters, master doc, exports.** No Vercel involvement in production; no book content in Supabase.

## The whole machine in ten lines (read this, skim the rest)

1. **One tool, one job: generate KDP books for Amazon to sell.** Every prompt, stage, and check is specialized for that single output — that specialization is the quality strategy. AI writes the books; Srini does not. Human input is exactly: topic, niche, word count, optional title suggestion, one idea approval, optional support docs.
2. **Two things make every book: the user's BLUEPRINT + the KDPFactory machine.** Three stages: DESIGN → VERIFY & APPROVE → PRODUCE. Stage 1 is the Idea Workbench: the user and Claude work the two boxes (his ideas in, Claude's improved version back) until the design converges; **Verify** renders the Blueprint, **Approve** snapshots it immutably. Stage 3 is the Production page — pick **Sample** (1–2 chapter preview for pennies; never overkill the machine to find out the output is wrong) or **Full** (the complete book, fully automated, no stops) — and the machine reads ONLY the Blueprint.
3. **The Niche Master Registry is the brain's long-term memory** (shared company infrastructure, own doc): niches + sub-niches with rich context — audience, voice, compliance, do/don'ts — entered ONCE via the admin Registry pages and read by ALL Factories (KDP, PDF, PPT, T-shirts…). Creating a book = picking niche/sub-niche from dropdowns; the machine injects the compiled context itself.
4. **A book is a state machine, not one API call:** ideation → idea approved → briefing → outline → chapter-by-chapter drafting → polish → assembly → metadata → done. State lives in Supabase at every step.
5. **n8n conducts, Supabase remembers, Google Drive holds the book:** admin fires one webhook; from there n8n owns production — each execution processes ONE step (one chapter) and re-triggers the next, crash-safe, resumable mid-book (~18 executions per book). Supabase holds only the operating state: blueprint, statuses, step queue, logs, per-chapter summaries, and links. Every chapter lands as a file in the book's Google Drive folder; the manuscript never lives in Supabase.
6. **Coherence is engineered, quality is benchmarked:** style contract + full outline + rolling summaries in every drafting call, then a continuity/polish pass — so the book reads as one book, not 15 essays in a trench coat. And a curated **reference KDP book** sets the gold standard: its distilled profile (structure, tone, pacing, conventions) shapes the contract, outline, and drafting, and the final QA grades the output *against it* — the output always matches the benchmark.
7. **Output = a package Amazon accepts as-is, assembled by Google Docs:** the definition of done is the **KDP Output Contract** — content + KDP content rules + KDP formatting spec. n8n combines the chapters into a master **Google Doc** (proper heading styles → proper TOC/structure) and exports it via Drive to **DOCX — the KDP upload format (decided 2026-07-12: keep it simple, DOCX only; KDP converts it excellently; EPUB optional later)** — plus the metadata pack generated inside KDP's hard limits. **One-shot production:** the user can open the master Doc, hand-edit or use Claude tools right there, and upload to KDP himself — no factory round-trip needed for line-level fixes.
8. **Prompts are the product** (same philosophy as the Aviary): B1–B8 stored as versioned rows in Supabase, editable without redeploy. Refining them is Srini's creative job.
9. **Budget discipline:** Sonnet-class for everything a reader reads, Haiku-class for summaries/checks. ~$2–5 of Claude tokens per 30k-word book; every book's exact cost logged and shown.
10. **KDPFactory feeds Aviary:** when a book is published on KDP, one click registers it in the Aviary's Assets sheet → the Launch hook campaigns it automatically. The factory makes the assets; the Aviary flies them.

## Purpose

**One tool, one job — and that's the quality strategy, not just a naming rule.** KDPFactory generates KDP books for Amazon to sell. Every prompt, every pipeline stage, every check, every hour of refinement effort serves that single output. The system knows exactly what it's producing (a sellable Amazon KDP book), exactly what "done" looks like (interior files + listing metadata that match a defined standard), and exactly what each step needs to complete the task — which is why the output quality can be extraordinary where general-purpose "AI writing tools" stay mediocre. A tool that makes everything masters nothing; this one masters one deliverable.

## Operating principle — keep the machine alive; spend everything on quality (Srini, 2026-07-12)

An automation factory has exactly one existential requirement: **nothing anywhere in the line may break the system or get the account rejected — it must be able to run forever.** So every known kill-risk is engineered out, permanently, as system design rather than ongoing vigilance:

| Kill-risk | Engineered answer |
|---|---|
| False AI declaration | Every book declared AI-generated at upload — standing decision, checklist item |
| Fake author identity / credentials | Pen name = declared brand persona in the registry; truthful bio, zero invented qualifications |
| Metadata violations (stuffing, banned terms) | Generated inside `kdp_rules` limits + B8 gate |
| Thin/low-quality content flags | Craft rules in B4/B6 + KDP Check quality bar + calibration audits |
| YMYL compliance slips | Registry compliance rules accumulate into every prompt; strictest B8 on Money/Health |
| Formatting rejections | Deterministic assembly to KDP spec + epubcheck before "ready" |
| Spam-pattern publishing | Deliberate cadence despite factory speed (Amazon volume limits respected) |
| Mid-run crashes losing work | State in Supabase, one step per execution, resumable |
| Company assets hostage to a personal account | All output in the **company Google Drive** (dedicated business account, 2FA) — same rule as the Aviary's Sheets |

With survival guaranteed by design, **the real work is the quality parameters** — the levers that make each book better: niche context blocks, reference profiles, the B-prompts, blueprint sharpness, and the KDP Reports feedback loop. That's where all ongoing human effort goes. The machine's safety is settled once; its quality is refined forever.

**Factory readiness protocol:** the first books off the line are audited and manually edited — sample production, not mass production. Every manual fix is a defect report against a specific stage (B4 craft, B6 polish, B8 detection, assembly), fixed at the stage, not in the book alone. Mass production opens only when samples come out needing nothing. Same discipline as any real factory line.

One admin-panel tool that takes a topic and a niche and produces a complete, publish-ready Amazon KDP book with zero manual writing. The human's role is strategic (what book, which niche, how long, which idea) and evidentiary (optional support docs); the machine's role is everything editorial and mechanical. Lives inside the existing shared `apps/admin` panel (same Supabase Auth email-whitelist login — the only login in the system), alongside the commerce dashboard and the Aviary's Social section.

**v1 scope: text-interior non-fiction** — how-to guides, educational books, self-help-adjacent content across the 10 niches. Children's picture books / low-content books (major for the Kids niche) and fiction are explicit **v2 extensions**: they need an illustration/layout pipeline and plot-continuity machinery respectively. The Niche Registry and pipeline are designed so those become new book *types*, not new systems.

## The three stages (revised 2026-07-12)

**The core model (Srini's picture, 2026-07-12): two things working together make every book — the user's BLUEPRINT and the KDPFactory machine.** The user's job is to come up with the right book, using Claude's help at the design stage: he creates ideas, saves them, brings them back, thinks, sometimes says "not a good idea, drop it." Not every idea becomes a book — but the ones that do get finalized into a **Blueprint**: the complete design of the book to be produced. The KDPFactory machine does exactly one thing with it: take any proper Blueprint and produce the final KDP-formatted book. A brilliant idea with a proper blueprint in; a KDP book out. The machine never designs; the human never writes.

**The Blueprint — the entire contract between human and machine.** It is everything the engine reads, and the engine reads nothing else: topic and final title direction · niche + compiled context (registry snapshot, incl. **pen name + publisher name**) · target reader and angle · **the agreed TOC** (designed in Stage 1, not invented by the engine) · **differentiation statement** (what exists on KDP, why this one wins) · target word count · must-cover topics and free-text guidance · attached support docs · the reference profile that sets the standard · model tier. Signed off at Stage 2, snapshotted into the book record (`books.blueprint`), immutable from that moment. If it's not in the Blueprint, the machine doesn't know it — which is exactly what keeps the interface clean.

KDPFactory is organized as three stages around this model:

### Stage 1 — DESIGN THE BLUEPRINT (the Idea Workbench: human territory, no clock running)

Not a wizard step — a **persistent design studio and library**. The user sits here, thinks, researches, and designs what's worth producing:

- **Create** an idea from scratch (topic + niche/sub-niche from the registry) or ask Claude (B1) to generate candidates around a topic.
- **The two boxes (the design mechanic, decided 2026-07-12):** the idea page has two panels — **the user's box**, where Srini writes his own thinking in his own words (what the book is, who it's for, what it must cover), and **Claude's box**, where Claude takes that input and returns the improved, structured version: sharpened title options, tightened angle, a proposed TOC, gaps flagged. The user reacts, edits his box, regenerates — back and forth until the improved version says what he means. Design is a conversation between the two boxes, converging on the Blueprint. **V1 implementation stays deliberately minimal (2026-07-12): two panels and an *Improve* button** — the user provides his input, Claude (Haiku) documents the blueprint from it; that document is what gets handed to KDPFactory. No streaming chat UI until books are earning. **Comp-titles rule:** competitor books come from the USER's own Amazon browsing, pasted into the research notes — Claude reads, organizes, and analyzes them; it never supplies comps from memory (training-data comps are stale or invented, and a differentiation statement built on fictional competitors is worthless).
- **Research** inside the idea: Claude-assisted exploration — market angle, competing KDP titles, what the niche audience is buying, possible titles/subtitles, target reader sharpening. Research findings and the user's own notes save onto the idea and accumulate across sessions.
- **Edit, save, park, revive, delete.** Ideas live in the library indefinitely. Most ideas will never go to production — that's by design, that's what deciding looks like. Any idea can be pulled back weeks later and researched further ("pull back an idea and start researching again").
- An idea is worked until its design is complete — at that point it has become a **Blueprint**: topic, chosen title direction, the agreed TOC, word count, angle, support docs, and a filled-in **differentiation statement** (comp titles on KDP, their weaknesses, why ours wins — if you can't articulate why it beats what exists, it's a "not a good idea, drop it").
- Once the user is satisfied with what the two boxes have converged on, he clicks **Verify** — that's the handoff from designing to reviewing.

### Stage 2 — VERIFY & APPROVE (blueprint sign-off: one summary, one decision)

Clicking **Verify** in the Workbench renders the **Blueprint view** — a single summary of the agreed design exactly as it will be handed to the machine: final title/subtitle, author pen name + publisher, niche + compiled context (from the registry snapshot), **the agreed TOC**, differentiation statement, target word count, support docs attached, reference book/profile that will set the standard, and estimated cost. The user reads it and clicks **Approve** — or goes back to the Workbench. Approval snapshots the Blueprint into the book record; it is immutable from that moment, and it is the ONLY thing the engine reads. Nothing generates yet — approval hands the user to the Production page.

### Regeneration — back to design, tweak, rerun (added 2026-07-12)

Production never consumes an idea. When production settings change (prompts sharpened, model tier switched, reference profile improved) — or the output just isn't right — the loop is: open the produced book → **Back to Design** → the same idea reopens in the Workbench with its Blueprint editable → tweak (or change nothing and let the new settings do the work) → re-approve → the engine produces a **new version**. Every approval of the same idea creates a new versioned book record (v1, v2…) under that idea; earlier versions and their files are kept, so v1 vs v2 can be compared side by side — and because `generation_log` stamps the prompt versions and model used in each run, "did the settings change improve the output?" is answerable from data, not memory. This is the factory's tuning loop: same blueprint, better machine, measurably better book.

### Stage 3 — PRODUCE & DOWNLOAD (machine territory, fully automated)

Approval lands on the **Production page**: the user selects the run mode — **Sample or Full** — and clicks Run; KDPFactory runs based on exactly those selections.

- **Sample:** a cheap, fast taste of the real thing — the identical pipeline and settings, but only the style contract, the expanded outline, and **two honest chapters: chapter 1 plus one mid-book chapter (~60% through the TOC)** — middles reveal the padding that openings hide — assembled into a downloadable preview doc (~$0.30–0.60, minutes not an hour). Its purpose: never overkill the machine to find out the output is wrong — judge voice, depth, and structure before committing. Sample reads wrong → Back to Design, having spent pennies. Sample runs are stamped `sample` in the version list and never publishable.
- **Full:** the complete book through the entire pipeline and the full KDP Output Contract, no stops — contract, outline, chapters, polish, assembly to KDP format, metadata, KDP Check — with live progress in the panel (Supabase Realtime).

Done → the book page shows the **Drive links**: the book's folder, the master Google Doc, the DOCX export (the KDP upload file), and the metadata doc (sample: the preview doc), with total cost shown.

**One-shot production (the philosophy of the handoff):** the factory produces once and hands over the Doc — from there the output is the *user's*. He can open the master Google Doc and change a line himself, use Claude tools right inside it, or upload as-is; re-export from Docs and publish without ever coming back to KDPFactory. The factory's regenerate loop exists for blueprint/settings changes — never for typo repair. And because Supabase holds no manuscript, there is no second copy to fall out of sync: the Doc in Drive is always THE book. Human uploads to Amazon (declares AI-generated per the standing decision), and once live, registers it in the Aviary.

## Niche knowledge — the shared Niche Master Registry (upgraded 2026-07-12)

Niche knowledge is NOT a KDPFactory feature — it's **company infrastructure**: the **Niche Master Registry** (`registry.niches`, full design in its own doc: *"Grandfield Media - Niche Master Registry"*). One table holding the top-level niches and their sub-niches, each entry carrying rich **context** (audience, what they're really buying, voice/tone, reading level, compliance rules, do/don'ts, keywords) — entered once by the user through dedicated admin pages (add / edit / archive, tree view, compiled-context preview) and read by **all Factories** (KDPFactory, PlannerFactory, PPTFactory, TShirtFactory…) in whatever format they produce.

**The registry is a pure reference — no ties in either direction (Srini's rule, 2026-07-12).** KDPFactory reads it at exactly one moment: when a book **starts**. It calls the shared `getNicheContext()` compiler, gets the merged `{NICHE_CONTEXT}` block (parent context + sub-niche refinement, compliance accumulated), and **snapshots that text into the book's own record** (inside the style contract). From then on the book never touches the registry again: no foreign keys, no version stamps, no back-references. Registry entries can be edited or deleted freely without affecting any book, in flight or finished.

What KDPFactory itself keeps is only the **format-specific defaults**, in its own table:

**`factory.kdp_niche_defaults`** — keyed loosely by niche slug (plain string, no FK): default_kdp_categories (jsonb — the 2–3 KDP browse categories), default_word_count, default_chapter_length, book_format_notes (structural conventions: e.g. Kids workbooks vs Money guides).

## Pipeline — the book state machine

```
draft → ideating → idea_selected → briefing → outlining
      → drafting (chapter i of N) → polishing → assembling
      → metadata → ready ✅   (any step → failed, resumable)
```

| Stage | What happens | Prompt / tool |
|---|---|---|
| *(Ideation & research live in Stage 1's Idea Workbench — interactive, not part of the automated run)* | topic + niche context (registry) → idea candidates, market research, title exploration; saved onto the idea across sessions | B1, Sonnet |
| Briefing | support docs parsed to text (pdf/docx/txt/md); Claude distills them + niche context (registry) into the **style contract** (voice, structure, formatting rules, must-cover topics, must-avoid list) and a **fact sheet** (claims/data the book may use) | B2, Sonnet |
| Outline | the Blueprint's agreed TOC is the contract; B3 (Fable) may **enhance within it, never rewrite it** — add a clearly missing topic, drop a weak one, reorder for flow, always inside the agreed intent and word budget — and **every deviation is logged and shown on the book page ("Changes from your agreed TOC: added X, removed Y, because Z")**. Then it writes the production outline: specific topics and key points per chapter, coverage boundaries, word budgets — **the blueprint for Sonnet**. No human stop — straight to drafting | B3, **Fable 5** |
| Drafting | one Claude call per chapter. Context = style contract + full outline + rolling summaries of ch. 1..i−1 + fact sheet excerpts. Word-count enforcement: if a chapter lands >20% short, one continuation call extends it | B4 Sonnet; B5 (per-chapter summary) Haiku |
| Polish | continuity + naturalness pass over the assembled draft: repeated phrases across chapters, contradictions, tone drift, intro/conclusion stitching, transition smoothing, and **AI-tell removal** (stock phrases, formulaic scaffolds, filler — per the KDP Check craft rules). Applied as targeted edits, not a full rewrite | B6, Sonnet |
| Assembly | combine the chapter Docs into the **master Google Doc** — title page, copyright page (incl. AI-disclosure line), TOC via heading styles, front/back matter, about-the-author (pen name bio from the Blueprint) — then **export via Drive API to DOCX** (KDP upload format; EPUB optional later) into the book's Drive folder; links written to Supabase | n8n + Google Docs/Drive (no AI) |
| Metadata | KDP listing pack: description (KDP's allowed HTML), **7 keywords**, **3 category suggestions**, author (niche pen name) + publisher (niche brand) from the Blueprint, back-cover blurb, subtitle variants, price suggestion vs comparable KDP titles, series naming idea, and a **cover brief** (title treatment, mood, imagery direction, comp covers) for the manual cover step | B7, Sonnet |
| KDP Check | the pre-flight review that mirrors Amazon's own (see KDP Check section): quality bar (repetition/filler/formula scan — reads like a human-edited book), KDP content rules (metadata limits, prohibited terms), compliance vs niche rules (strict on YMYL), match vs reference profile, placeholder/artifact scan. Fail → flagged in panel with reasons, never silently shipped | B8, **Sonnet** (quality judgment is not cheap-model work) |

## Reference books — the gold standard the output must match

The strongest quality mechanism in the system (added 2026-07-12): the factory doesn't just follow instructions, it **matches a benchmark**. Srini curates **reference KDP books** — real, successful books whose structure, tone, pacing, and formatting represent the standard our output must meet.

**How it works — analyze once, inject everywhere:** a reference book is uploaded (or described) once in admin. Claude analyzes it ONCE into a **reference profile** stored as data: how its TOC is structured, how chapters open and close, section rhythm and length, how it uses examples/exercises/summaries, tone fingerprint, front/back-matter conventions, what makes it feel professional. That distilled profile — never the book's raw text — is what gets injected into the pipeline:

- **B2 (style contract):** the contract is written *to the reference standard* — the book being produced commits to the benchmark's structural and tonal bar.
- **B3 (outline):** chapter architecture patterned on how the reference organizes a book of this type.
- **B4 (drafting):** chapter craft rules (openings, pacing, use of examples) drawn from the profile.
- **B8 (QA):** the final gate grades the finished book *against the reference profile* — "does this meet the standard?" is a comparison, not an opinion.

**`factory.reference_books`** — id, title/author (for our records), niche_slug (loose string; null = general-purpose reference), book_type (guide/workbook/etc.), reference_profile (jsonb — the distilled analysis), notes (why this is the benchmark), status. Managed in a small **Reference Library** page in the Factory section. At Start, the wizard picks the matching reference automatically (by niche + type, overridable) and snapshots its profile into the book's record — same no-ties snapshot pattern as the registry.

**Copyright line (hard rule):** reference books teach *structure, standards, and craft* — the profile holds analysis and conventions, never reproductions of the reference's text, and B4 is explicitly forbidden from imitating protected expression. We match the bar, we never copy the book.

## The KDP Output Contract — the definition of done

We are not writing "a book" — we are writing **a book for Amazon KDP that gets uploaded directly**. So the target is threefold, and all three are engineered, not hoped for: **content** (registry context + reference standard) + **KDP content rules** + **KDP formatting spec**. A book is `ready` only when it passes the whole contract; then the human uploads it and is done.

**The contract is enforced in two different ways, deliberately:**

1. **Formatting via Google Docs assembly (decided 2026-07-12 — no code, no Vercel):** n8n builds the master Google Doc with proper heading styles (that's what gives KDP's converter a correct TOC and structure), correct front-matter order, no print-style page numbers — then exports via Drive to DOCX + EPUB, KDP's two upload formats. Assembly is Google's code, not ours; thousands of KDP authors publish from Docs exports. The final format gate is procedural: **"open in KDP's online previewer" is a standing upload-checklist item.** Honest trade-off, accepted by the kill-risk principle: a format rejection is a fix-and-reupload inconvenience, never an account risk — if rejections ever actually occur, add automated validation then, not speculatively.

2. **Rule-aware generation + B8 gate (AI):** B7 generates metadata *inside* KDP's hard limits rather than being trimmed afterward — title+subtitle within Amazon's character limit, exactly 7 keyword slots within their length caps, description within the 4,000-character cap using only KDP-supported HTML tags, 3 category selections. B8's final QA additionally checks KDP's *content* policies: no prohibited metadata words (e.g. "free," "bestseller," rival brand names in title/keywords — keyword-stuffing kills listings), no unsupported claims in YMYL topics, minimum-content-quality bar (Amazon actively flags poorly formatted/thin books), and the **AI-generated content declaration** noted for the upload checklist.

**`factory.kdp_rules`** — the contract stored as versioned data (same philosophy as prompts): metadata limits, prohibited terms, formatting requirements, upload checklist items. When Amazon changes a rule, we edit rows — not code, not prompts scattered everywhere. *All specific limits above are from current knowledge and must be re-verified against KDP's live documentation at build time — Amazon revises these.*

### The KDP Check — we review the way Amazon reviews (added 2026-07-12)

**Governance is universal (Srini, 2026-07-12): every automated machine must be governed.** Any stage's output can be **rejected** — the verdict and reason are written to Supabase (`rejected — guidelines not accepted`), and rejected content is trash: never patched, never shipped, the step reruns or the book stops. The KDP Check below is the final gate, but the reject-and-record rule applies at every automated step, same as the Aviary's research → create → QA law.

Before a book is `ready`, it passes a **pre-flight review that simulates Amazon's own**, so upload day holds no surprises. Three lenses, in order of what actually gets books blocked:

1. **Amazon's quality bar (the real gatekeeper):** Amazon's enforcement targets *low-quality* content — repetitive phrasing, generic filler, formulaic structure, thin substance, typos, broken formatting. These are also the classic tells of lazy AI writing, so the factory attacks them **at the writing stage, not just the checking stage**: B4/B6 carry explicit craft rules — varied sentence and paragraph rhythm, concrete specifics over generalities, banned stock phrases ("in today's fast-paced world…" and family), no two chapters opening or closing on the same scaffold, examples that feel lived-in rather than templated. The KDP Check then reads the assembled book as a skeptical reviewer: repetition scan across chapters, filler-density check, formulaic-structure detection, "would a paying reader feel this was written for them?" The output must read like a professional, human-edited book — because that's what passes review, earns reviews, and doesn't get returned.
2. **KDP content rules:** metadata limits and prohibited terms, misleading-claims scan, YMYL guardrails — per `kdp_rules`.
3. **Format spec:** Google Docs assembly with proper heading styles + the KDP previewer check on the upload checklist, as described above.

**Compliance stance on AI content — DECIDED 2026-07-12: every book is declared AI-generated at upload. No exceptions.** Amazon KDP *accepts* AI-generated books; its policy requires declaring them via a checkbox at upload — a private declaration between publisher and Amazon, not a public badge on the listing. Srini's ruling: keep the system clean so nothing can block the production line once it opens at scale. The strategy is **extraordinary, natural-reading quality (the real moat) + truthful declaration (the paperwork)** — a false declaration is the one mistake that risks the entire KDP account and every book on it, and a clean account is what lets the factory run at volume without fear. The declaration is a standing item on the upload checklist shown on every book's detail page. (Re-verify the current policy wording at build time, as already noted.)

**KDP Select:** enrollment (90-day Kindle Unlimited exclusivity — the ebook cannot be sold anywhere else while enrolled) is a per-book business decision made at upload. The book record carries a `kdp_select` flag so the portfolio always knows which titles are exclusivity-locked — relevant later if books are ever sold on the niche sites too, since a Select-enrolled ebook must NOT also be sold there.

## Orchestration — n8n as conductor, one step per execution

n8n Cloud is already paid for and already conducts the Aviary; the factory reuses it rather than adding a vendor (Trigger.dev/Inngest were considered and remain the swap-in option if n8n ever pinches — viable precisely because no state lives in n8n).

**The pattern (the one hard technical problem, solved the Aviary way — state in Supabase, never in the vendor):**

**ONE workflow — Srini's rule (2026-07-12): a single n8n flow that starts with the Blueprint and finishes with the produced book. One trigger, user-driven — no schedulers.** The single **webhook trigger** (`{book_id}`) is fired by the user's Run click and by the workflow itself between steps. The mental model is a switch: **the user flips it ON (Run), the factory runs to done, and it switches itself OFF (book ready).** No background sweeper watching for stalls (dropped by decision 2026-07-12): if a step ever dies silently, the book simply sits visibly stalled in the panel until the user clicks **Resume** — which fires the same webhook and the claim logic continues exactly where it stopped. Trade-off accepted: a stall costs waiting-until-noticed, never lost work, and the system stays maximally simple. **No notifications, by decision (2026-07-12): `completed` is the only "all good" signal — any other state means something is wrong and the user investigates** (Production Dashboard for where it stopped, the Drive folder for what got produced). That manual check IS production support, and the user owns it.

**The handshake (how the Blueprint reaches the factory):** the Blueprint document does NOT travel through the webhook. It already lives in Supabase (`books.blueprint`, written at Approve). The webhook carries only `{book_id}` — the power button; the workflow's first node reads the agreed document from Supabase. KDPFactory is asleep until that webhook fires; power-on is the webhook, the Blueprint is what it wakes up to. Replayable by construction: Resume re-fires the same id against the same immutable document.

The body, per execution: load book → **claim next pending step** (atomic status update — the claim is the idempotency guard; a duplicate firing claims nothing and exits) → switch on step_type (contract / outline / chapter / polish / assemble / metadata / kdp_check — chapters write to Drive, summaries to the step log, assembly runs the Docs-combine + DOCX/EPUB export) → record tokens/cost → more steps pending? async self-call to Trigger A (execution ends in seconds) : finalize (book ready, Drive links written). A 30k-word book ≈ 18 executions of a few minutes each — no long-execution timeout risk, and a crash at chapter 11 resumes at chapter 11. Sample vs Full is the same flow with a shorter step queue.

- **Error path:** step failed → attempts++ → up to 2 self-retries → then book `failed` with the error visible in the panel and a **Resume** button (fires Trigger A; the claim logic resumes exactly where it died).
- Execution budget: ~18–25 per book. Even 20 books/month ≈ 500 executions — comfortable inside the n8n Starter quota alongside the Aviary's ~1,200–2,400.
- Concurrency: v1 allows multiple books in flight; steps are per-book sequential (chapters need prior summaries), across books parallel.

**Assembly stays in n8n too — Google Docs is the assembler (decided 2026-07-12; the earlier Vercel assembly endpoint is dropped).** At production start, n8n creates a **Google Drive folder named after the book**. Each chapter step drops its chapter into that folder as it's produced — the user can literally watch the folder fill. The combine step does NOT format from scratch — it **copies the Master Book Template and prints into it**. **The Master Book Template is "the paper" (Srini, 2026-07-12): the Blueprint says what to print; the template is what it prints on.** One official Google Doc kept in the company Drive under `/templates`: real heading styles, auto-TOC, title page, copyright page (AI-disclosure line + imprint), dedication, about-the-author placeholder (filled from the pen-name bio), clean ebook conventions. Per book, assembly copies the template, fills the placeholders from the Blueprint, inserts the chapters under the heading styles, and **writes the Contents list itself** — replacing the template's `{{TOC}}` placeholder with one hyperlinked line per chapter (via Docs heading IDs). Never a Word TOC *field*: fields sit empty until manually refreshed and don't survive Docs conversion (bug found and fixed 2026-07-12, template v1.3); the machine generates the TOC as real content, and Kindle additionally auto-builds navigation from the Heading 1 structure — and exports via the Drive API to **DOCX (the KDP upload format — DOCX only, decided 2026-07-12; EPUB optional later)** into the same folder, alongside the metadata doc. Improve the template once → every future book prints on the upgrade (in-flight books keep the copy they started with — same snapshot pattern as everything else). Template v1 was built from scratch (2026-07-12); **v1.1/v1.2 same day** synthesized the best of TWO purchased Etsy KDP packs after code-level inspection of each (both passed the Alfred test — real named styles): **body face Libre Baskerville** 11pt justified, 0.3" first-line indent, 1.4 line spacing (pack 1) · **display face EB Garamond** for the caps title page (36pt), chapter titles (24pt centered) and small-caps section heads (pack 2) · **Epigraph style** for optional chapter-opening quotes (pack 2) · **auto-hyphenation** with justified text (pack 2's tips doc) · no-indent first paragraphs (both packs). Both faces are Google Fonts — native in Google Docs, our assembly home. Kept against both packs: chapter titles page-break automatically via the style (machine assembly cannot rely on manual breaks). Print-only material from both packs (mirror margins/gutters — pack 1's are better engineered; headers/footers; KDP bleed sizes for all five trims; printing-signature guidance) is archived in the company Drive as the paperback-phase spec. Links to the folder, master Doc, and exports are written to the books row in Supabase. Production never leaves n8n; Vercel is never touched.

## Supabase schema (`factory` schema, shared project)

- *(niche knowledge lives in the shared `registry.niches` — read once at Start, snapshotted, never joined — see the Niche Master Registry doc)*
- **kdp_niche_defaults** — see above (format defaults, loose slug key, no FK).
- **reference_books** — the gold-standard library (see Reference books section): title/author, niche_slug (loose), book_type, reference_profile (jsonb), notes, status.
- **books** — id, niche_name + niche_slug (plain-text snapshot from the registry at Start — no FK; the compiled niche context snapshot lives inside style_contract), site_id, topic, title_suggestion, chosen_title, subtitle, target_words, actual_words, status (state machine above), current_step, style_contract (jsonb), fact_sheet (jsonb), model_tier, error, created_by, created_at, completed_at, kdp_url (set after publish), kdp_select (bool — exclusivity flag), registered_in_aviary (bool).
- **ideas** — the Idea Workbench library, **standalone and long-lived, not tied to any book**: id, niche_slug + niche_name (loose snapshot, no FK), topic, working_title, **user_draft** (the user's box — his own words), **claude_draft** (Claude's box — the current improved version, incl. proposed TOC), **agreed_toc** (jsonb), **differentiation** (text — required before ready), payload (jsonb: subtitle, angle, target reader, rationale, keyword seeds), notes (user's own markdown), research (jsonb — accumulated Claude research findings across sessions), target_words, status (**draft / researching / ready / in_production / produced / parked / deleted**), created_at, updated_at. Most rows never reach production — the library IS the thinking space. Support docs attach at idea level.
- **books** — created only at Stage 2 approval; carries **blueprint** (jsonb — the signed-off, immutable Blueprint snapshot: the engine's sole input), idea_id as provenance, **version** (int — each re-approval of the same idea produces the next version; all versions and their files are retained for comparison), and **run_type** (`sample` / `full` — sample runs produce a 1–2 chapter preview doc, are never publishable, and are flagged as such in the version list).
- **support_docs** — id, idea_id (attached in the Workbench; carried into the book at approval), filename, storage_path, mime, parsed_text_path, parse_status.
- **chapters** — **orchestration record only, NEVER the manuscript**: id, book_id, index, title, goals (jsonb), target_words, actual_words, **drive_file_id** (the chapter's Google Doc), **summary** (~200 words for the rolling context — operational memory, part of the production log, not book content), status (pending/drafting/done/failed), tokens_in/out, cost_usd. The chapter text itself lives only in Drive.
- **book_steps** — the orchestration queue: id, book_id, step_type, index, status (pending/running/done/failed), attempts, started_at, finished_at, error. n8n's single source of truth.
- *(no book_files table — all output lives in Google Drive; the books row stores drive_folder_url, master_doc_url, and the DOCX/metadata links)*
- **kdp_sales** — the monthly-report feedback loop (see KDP Reports): period, book match (ASIN/title), units, KU page reads, royalties, marketplace, imported_at.
- **generation_log** — one row per AI call: book_id, step, prompt_key, prompt_version, model, tokens_in/out, cost_usd, duration. Rolls up to per-book cost (shown on the book page) and monthly Factory spend (joins the company P&L / budget picture alongside Aviary spend).
- **prompt_templates** — key (B1–B8), text, version, updated_at. Same table pattern as the Aviary's; consider one shared `prompt_templates` table with a `system` column ('aviary'/'factory').
- Storage: private `factory` bucket for **input material only** (support-doc uploads + parsed text). All book output lives in Google Drive.

## Prompts & model selection (B-series — prompts are the product)

**THE MODEL RULE, PLAIN (Srini, 2026-07-12):**
1. **Haiku** — the lowest model, to *play* in the design phase: brainstorm, iterate, throw ideas around, cheap by design.
2. **Fable** — to *finalize*: the table of contents and the topic headers each chapter must cover — the guidelines.
3. **Sonnet** — to *write the book*, chapter by chapter, following those guidelines exactly.
(And Opus to *judge* at the KDP Check — never the model that wrote.)

Tiers, not model names (pin exact versions in env vars): **Sonnet-class-or-better for anything a reader reads** (confirmed 2026-07-12), **Haiku-class for summaries and mechanical checks**.

**DECIDED MODEL PLAN (Srini, 2026-07-12) — the rule in his words: "topic metadata from Fable, actual content from Sonnet."** The best model is used for everything that *defines and refines* the book — topics, structure, listing — never for the bulk content. And design iteration is cheaper still (decided 2026-07-12): **Haiku 4.5 is the brainstorming partner in the two boxes** — play around, generate ideas, reiterate as long as you like without watching the meter — and **Fable 5 is the boss, called for the final touch**: blueprint finalization, **writing the TOC from the user's blueprint**, the production outline, the style contract (the machine's reading of that blueprint), and the **metadata pack** (book title/subtitle finalization, description, keywords — the listing that sells it). Beyond the TOC, Fable also writes the **production outline — the blueprint for Sonnet**: the specific topics, key points, and coverage boundaries inside every chapter. All of it is tiny in tokens and maximum in consequence. **Sonnet 5 finishes it off** — every chapter, then polish — pure expansion work, easy and faithful precisely *because* every chapter arrives as a precise worklist: these topics, these areas, this reader. Sonnet never decides what to write, only how well to write it. Haiku 4.5 does summaries; **Opus 4.8 judges** (KDP Check — always a different model than the writer). 

Current pricing (checked 2026-07-12, platform.claude.com): Fable 5 $10/$50 per M tokens · Opus 4.8 $5/$25 · Sonnet 5 $3/$15 (intro $2/$10 through Aug 2026) · Haiku 4.5 $1/$5. **Net ≈ $3–4.50 per 30k-word book** with top-tier intelligence at both the design and judgment ends. Calibration keeps the veto: Sample the same blueprint under candidate drafting models, read blind, adjust per niche via the per-book dropdown. Re-verify lineup/pricing at build time; pin exact model IDs in env vars.

| # | Use case | Model | Notes |
|---|---|---|---|
| B1 | Two-box brainstorming & research iteration (Stage 1 play) | **Haiku 4.5** | play around, generate, reiterate freely — cheap by design so ideation never blows the budget |
| B1F | Blueprint finalization — "the boss comes in": final touch on the converged design + **TOC from the user's blueprint** | **Fable 5 (top tier)** | called once, when the user is ready to move forward — the best guess on topics is worth the best model |
| B2 | Style contract + fact sheet from support docs & niche context (registry) | **Fable 5 (top tier)** | the machine's reading of the Blueprint — the last design artifact; runs once, governs every later call |
| B3 | Production outline — **the blueprint for Sonnet**: per-chapter topic points, key ideas, and coverage boundaries under the agreed TOC, plus word budgets | **Fable 5 (top tier)** | Fable specifies exactly what each chapter must contain; Sonnet only ever expands, never decides |
| B4 | Chapter draft | **Sonnet 5** | "Sonnet finishes it off" — faithful, high-volume execution inside the Blueprint |
| B5 | Chapter summary (rolling context) | Haiku 4.5 | 150–250 words per chapter, facts + threads opened |
| B6 | Continuity & polish | Sonnet 5 *(calibration option: Opus 4.8 pass ≈ +$0.80/book if samples show sentence-level lift)* | targeted edits with reasons, not a rewrite |
| B7 | Metadata pack (title/subtitle finalization, description, 7 keywords, categories, blurb, cover brief) | **Fable 5 (top tier)** | definition work, not content — the listing is what sells the book; tiny tokens, maximum consequence |
| B8 | KDP Check — the Amazon-style pre-flight review | **Opus 4.8** (never the drafting model — an independent judge doesn't share the writer's blind spots; stricter still on YMYL niches) | independent call; mechanical sub-checks (metadata limits, banned terms) run as code, not tokens |

**B4 — Chapter draft (skeleton):**
```
You are writing chapter {i} of {N} of "{TITLE}" for {NICHE} readers.
STYLE CONTRACT (obey completely): {STYLE_CONTRACT}
NICHE CONTEXT (compiled from the Master Registry — parent + sub-niche): {NICHE_CONTEXT}
COMPLIANCE (hard rules): {COMPLIANCE_RULES}
FULL OUTLINE: {OUTLINE}
THE STORY SO FAR (summaries of ch. 1–{i-1}): {ROLLING_SUMMARIES}
REFERENCE STANDARD (craft rules distilled from our benchmark KDP book — match
its structure, pacing, and professionalism; NEVER imitate its actual text):
{REFERENCE_PROFILE}
THIS CHAPTER: title "{CH_TITLE}"; goals: {CH_GOALS}; target {CH_WORDS} words (±10%).
VERIFIED FACTS you may use: {FACT_SHEET_EXCERPT}
Rules: do not repeat prior chapters' content or openings; do not re-introduce the
book; no invented statistics, studies, or testimonials — if a claim isn't in the
fact sheet, write around it; end with a bridge into "{NEXT_CH_TITLE}".
Craft rules (write like a professional author, not a generator): vary sentence
and paragraph rhythm; concrete specifics over generalities; banned stock phrases:
{BANNED_PHRASES}; do not open or close this chapter on the same scaffold as any
prior chapter; examples must feel lived-in, not templated.
Output: clean markdown, ## for the chapter title, ### for sections.
```

## Admin UI — Factory section in `apps/admin`

- **The Dashboard — "the eyes to the whole system" (Srini, 2026-07-12).** One page that watches everything, four lenses:
  - **Pipeline** — every book and its current stage (idea / designing / approved / producing ch. X of N / completed / stalled), live per-chapter progress (Supabase Realtime), failures needing attention. `completed` is the all-good signal; anything else sitting still is the cue to investigate.
  - **Catalog** — everything published and everything ever made: title, niche, version, KDP link, Drive link.
  - **Money** — spend per book (actual vs approval estimate) and **spend vs earn in the same view**: production cost from `generation_log` matched against royalties from the uploaded KDP reports — profit per book, per niche, per sub-niche. Filterable by niche/sub-niche (dropdowns fed from the niche table). The bloodline rule applies here too: always split by niche, never one blended number.
  - **Search** — keyword search across all ideas AND books ("finance for mom") — the before-you-design check that answers "did we already make something like this?" This is the catalog-awareness mechanism: human search, not automated panels.
- **Idea Workbench (Stage 1)** — the library: all ideas filterable by niche/status, full-text search; idea detail page with the **two boxes** (user's draft ↔ Claude's improved version with proposed TOC, iterate to convergence), the user's notes, accumulated research, differentiation field, support-doc attachments, a "what's selling" panel fed by KDP Reports, and lifecycle buttons (save / park / mark ready / delete). Parked ideas are one click from revival.
- **Blueprint view (Stage 2)** — reached via Verify: the agreed design on one screen, with **Approve** or **Back to Workbench**.
- **Production page (Stage 3 start)** — after approval: pick **Sample or Full**, click Run.
- **Book detail (Stage 3)** — status timeline, outline, every chapter readable as it lands, **downloads** (DOCX + metadata), full cost breakdown, **actual cost vs the approval estimate**, error/Resume controls, upload checklist (incl. AI declaration), **Back to Design** (reopens the idea for tweak & regenerate) and a **version list** (v1, v2… with per-version files, settings used, and cost — compare runs side by side), "Register in Aviary" button, KDP URL field.
- **Niche Master Registry** — lives as its own top-level Registry section in `apps/admin` (shared by all Factories), not inside the Factory section — tree view, add/edit/archive, compiled-context preview (see registry doc). KDPFactory adds only a small per-niche KDP-defaults editor (`kdp_niche_defaults`).
- **KDP Reports** — monthly upload of Amazon's sales/royalty files; Winners/Losers per niche; topic/length/price patterns feeding the Workbench.
- **Reference Library** — upload/annotate the gold-standard KDP books; view each one's distilled reference profile; assign per niche/book-type.
- **Prompt Editor** — B1–B8 as editable, versioned rows (shared component with the Aviary's prompt editing when that's built).

## KDP Reports — the feedback loop (added 2026-07-12)

The Workbench must run on evidence, not just intuition — the same Winners/no-shows discipline as the Aviary. KDP has no clean sales API, so the loop is deliberately manual and monthly:

1. Once a month, download the KDP sales/royalty reports from Amazon and **upload the files to KDPFactory Reports** in the admin panel.
2. The import parses them into **`factory.kdp_sales`** (period, ASIN/title matched to our books, units, KU page reads, royalties, marketplace).
3. The imported royalties are **matched back to our books** and land on the Dashboard's Money lens — **spend vs earn in the same report**: production cost per book against its royalties, profit per book/niche/sub-niche — plus the Winners/Losers view per niche (bloodline rule — never one blended number): **🏆 Winners** (units, royalties, trend) and **👻 Losers** (published, promoted, nobody buys), and patterns: which topics, lengths, price points, and sub-niches actually earn.
4. The findings feed **Stage 1**: the Workbench shows "what's selling" alongside idea design, so the next blueprint is shaped by market data — including honest answers on book *length* (much top KDP non-fiction is 15–25k words; let sales data pick the length per niche rather than defaulting long).

Review mining belongs here too: Amazon reviews on our books are free editorial QA — recurring complaints become B4/B6/B8 prompt refinements, recurring praise becomes reference-profile material.

## Integration with the Aviary

When a book is live on KDP: **Register in Aviary** appends its row to the Assets Google Sheet (brand, type=book, name, KDP URL, price, description) — Claude enriches it with promo angles at next sync, and the Launch hook opens a campaign. Optionally automatic on `kdp_url` being set. One machine writes the asset; the other sells it. This is the portfolio flywheel: **KDPFactory → KDP → Aviary → traffic → sales → P&L**, every step already reporting into the same Supabase — and every future `*Factory` (PlannerFactory, PPTFactory) plugs into the exact same hook.

## Cost model (per 30k-word book, Sonnet-class)

Ideation + outline + contract ≈ $0.3 · 15 chapter drafts ≈ $1.5–2.5 (context grows with rolling summaries) · summaries (Haiku) ≈ $0.05 · polish ≈ $0.5–1 · metadata + QA ≈ $0.2 → **≈ $2.5–4.5 per book**, logged exactly in `generation_log`. n8n ≈ 20 executions. Storage: negligible. A 60k-word book roughly doubles the drafting line.

## Risks & watch items

- **Amazon KDP's AI-content policy — decision made (2026-07-12): declare every book as AI-generated, always.** Clean account, zero blockage risk at production scale. The upload checklist on every book's detail page carries the declaration item; the copyright page template reflects it. Verify current policy wording at build time. Amazon also enforces volume limits (historically: max 3 titles/day) and quality bars — publishing cadence should stay deliberate even when the factory can produce faster.
- **Quality is the moat, not volume.** KDP is flooded with low-effort AI books; thin content earns returns, bad reviews, and account risk. The style contract + fact-sheet discipline (no invented statistics), the polish pass, and human proofreading before upload are the defenses. The first 2–3 books **per niche** are a calibration period (like the Aviary's srini.pro pilot): Srini reads each finished book before upload — not to add content expertise, but to catch what the KDP Check missed; every miss becomes a B4/B6/B8 prompt fix. After calibration, the gate is trusted and human review drops to spot-checks.
- **YMYL niches:** Money & Health books get Sonnet-class B8 compliance checks and the strictest niche-profile rules; a compliance FAIL blocks "ready".
- **No invented facts:** B4 is constrained to the fact sheet; anything else must be written as general guidance. This is the anti-hallucination line for non-fiction.
- **Covers stay OUTSIDE the factory (decided 2026-07-12)** — interior + metadata define "done"; the cover is the human's manual step (e.g. created with ChatGPT/Canva), guided by the **cover brief** in the metadata pack. Optional convenience, not part of the Output Contract: a small n8n step after production can request 2–3 AI cover *concepts* (OpenAI image API) and drop them in a Google Drive folder for the user to look at — advisory drafts only, the human always finishes the cover.
- **Children's/low-content books (Kids niche) and fiction** — v2 book types (illustration/layout pipeline; plot-continuity machinery). Don't force them through the non-fiction pipeline.
- **Duplicate titles:** before Start, a cheap check against existing `books` rows (and later, embeddings) so two Money books don't converge on the same topic.

## Build order (when given the go-ahead)

1. **Niche Master Registry first** (its own build order — schema, admin pages, seed the locked 10, write their context blocks); then the Supabase `factory` schema + `kdp_niche_defaults`.
2. Admin: KDP-defaults editor rows for the niches getting books first.
3. Admin: Idea Workbench (ideas library CRUD + B1 ideation/research actions + support-doc attach) and the Approval view — Stage 1 and 2 complete, fast and synchronous, no orchestration yet.
4. n8n KDPFactory Runner (single webhook-triggered workflow) + `book_steps` queue; B2–B5 (contract, outline, drafting loop, summaries) — first full manuscript end-to-end into the book's Drive folder.
5. Google Docs assembly in n8n (Drive folder per book, chapter Docs, master-Doc combine with heading styles, DOCX export) + B6 polish + B7 metadata + B8 KDP Check — first complete publish package in Drive.
6. Book detail page with Realtime progress, cost display, Resume; Factory Dashboard.
7. Pilot: one real book in a Phase 1 niche (Money or Kids), refine B-prompts, verify KDP upload + AI-disclosure flow end to end.
8. "Register in Aviary" hook; prompt editor; then steady production.

## Open items

- ~~Shared portfolio-level niche registry~~ — **RESOLVED 2026-07-12**: the Niche Master Registry (`registry.niches`, own doc) is now the master table all Factories read. Remaining sub-item: eventual `social.brands` → registry consolidation for audience/compliance fields (tracked in the registry doc).
- Word-count ceiling per book for v1 (suggest cap ~80k; beyond that, split volumes).
- Exact KDP AI-disclosure wording/policy — verify at build time.
- **Verify the full KDP Output Contract against Amazon's live docs at build time** (metadata character limits, keyword rules, supported description HTML, EPUB requirements, category system) and seed `kdp_rules` from that verification — the limits written in this doc are directional, Amazon revises them.
- DOCX styling spec (trim size assumptions, fonts, heading styles) — decide when building the assembly endpoint; KDP paperback trim (6"×9" default?) affects nothing until a paperback is attempted (EPUB/DOCX ebook first).
- Whether "Register in Aviary" is a button (v1 suggestion) or automatic on kdp_url.
- Support doc size limits and parse strategy for large PDFs (chunk + distill via B2).
- Per-book model-tier override dropdown (Sonnet default; Opus for flagship titles) — cheap to add, decide during build.
- Archive copy at `ready` (one zip of the exports into a Drive archive folder the workflow never touches again) — recommended, trivial to add; the master Doc is otherwise the only copy of a revenue-earning asset.
- **Publisher plumbing — Srini handles personally, pre-launch:** KDP account, Amazon tax interview, royalty bank account, Author Central pages per pen name, imprint on listings.
- Build-sequencing tip: a one-day spike of the Docs assembly (3 dummy chapters → styled master Doc → DOCX → clean in KDP previewer) right after the registry, before dependent pieces are built on top of it.
- ~~Workbench catalog awareness~~ — **RESOLVED 2026-07-12**: the Dashboard's keyword search across ideas + books is the mechanism (search before you design). Optional cheap extra at build: a don't-overlap line in the Fable TOC prompt listing same-niche titles.

---

## AS-BUILT AMENDMENT — assembly & Drive (2026-07-13)

The book-production pipeline is **built and proven end-to-end.** The *assembly + Drive delivery* diverged from the original design (which imagined Google-Docs assembly running inside n8n, no Vercel). What was actually built and why:

**Why it changed.** The Master Book Template turned out to be a finished, print-ready **DOCX** (embedded EB Garamond + Libre Baskerville, 6×9" trim, smallCaps title page, named Heading1/Heading2 styles) — none of which Google Docs can reproduce. And several delivery mechanisms were tried and rejected: n8n's HTTP node blocks the predefined Google OAuth cred; a Google Apps Script Web App was rejected by Srini (didn't want the pipeline bound to a Gmail login, the "unverified app" auth screen, or Supabase's new `sb_secret_` key which refuses browser-ish callers). Locked principle: **"n8n is the integration tool"** — it orchestrates and does the Google Drive work; it *delegates* the file-building to a service (the same way it delegates writing to Claude), because building a styled `.docx` isn't something n8n's nodes can do.

**As-built architecture.**
1. **Assembly → an admin API route** `POST /api/kdp/assemble` (`apps/admin`, Vercel — already deployed; guarded by `KDP_ASSEMBLE_SECRET`, bypasses the login wall). It reads the book + chapters from Supabase, **fills the template DOCX directly with jszip** (unzip → edit `word/document.xml` by cloning the template's own paragraph skeletons and swapping text → rezip; embedded fonts survive byte-for-byte), and **returns the package as base64/text files** — it stores nothing and touches no Google account.
2. **Google Drive → n8n** (native Drive nodes, n8n's own OAuth to the company account **grandfieldmedia@gmail.com**). n8n calls the endpoint, then get-or-creates the niche folders and uploads each file.

**The package per book (11 files)** in `<Books>/<Parent Niche>/<Sub Niche>/<Book Title>/`:
- `<Title>.docx` — the KDP interior (the template, filled).
- **`<Title>.pdf`** — a **6×9 sellable PDF** (built with pdfkit, embedding the template's fonts) — the digital product for the site. *(This makes the earlier "DOCX only, EPUB later" decision now "DOCX for KDP + PDF for the site.")*
- **`<Title> — Metadata.md`** — the KDP listing sheet from the B7 `books.listing` output (title, subtitle, author, HTML description, 7 keywords, 3 categories, price, series idea, back-cover blurb, cover brief).
- `<Title>.html` — full book HTML (repurposing).
- `NN - <Chapter>.docx` ×N — per-chapter files (fonts stripped, lightweight).

**Note vs the doc above:** production assembly now *does* involve Vercel (the admin route) rather than "no Vercel in production"; book content transits the route as a base64 response but is **not stored** in Supabase or Vercel — it lives only in Google Drive, preserving the "manuscript never in Supabase" rule. The Master Book Template is a DOCX in the company Drive + committed at `apps/admin/public/kdp-book-template.docx`, not a Google Doc under `/templates`.

**Operational how-to:** see `KDPFactory — n8n assemble step.md` for the exact n8n node config, and the `kdpfactory-build` memory for the full gotcha list.
