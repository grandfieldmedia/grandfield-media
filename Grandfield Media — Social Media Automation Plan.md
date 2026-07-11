# Grandfield Aviary — Social Media Automation Plan

**Full name:** Grandfield Aviary — the Social Media Automation System
**Short name (daily use):** **Aviary**

*The Aviary: the machine that releases our post-birds across every platform, bands each one (UTM), and reads their reports when they fly home. Grandfield Media's touchless social media system. In conversation: "check the Aviary," "the Aviary report," "release the birds," "Aviary is OFF for Career until we fix the voice."*

**Date:** 2026-07-11
**Status:** Planned — not built. Decisions below confirmed with Srini on 2026-07-11.
**Stack (confirmed):** Postiz Cloud + n8n Cloud + Claude API + OpenAI API + Supabase.

## The whole machine in ten lines (read this, skim the rest)

1. **AI is the social media content creator; Srini is not.** Humans provide links and switches; AI writes, illustrates, posts — 3 posts/day/account across all brands and platforms.
2. **One Google Sheet, three tabs, per-row ON/OFF, never delete:** Assets (the library — "here's the link, bring people here"), Promotions (push this hard daily until flipped OFF), Custom Posts (Srini's own words, published verbatim).
3. **Five n8n runs, one lane each:** Run 1 Assets rotation · Run 2 Promotions push · Run 3 Custom verbatim · Run 4 AI Entertainer (no sheet, no links — mood, motivation, shared pain; AI decides) · Run 5 Health & Ledger. Plus a launch webhook: new product → auto-campaign.
4. **Three universal rules, no exceptions:** everything reported (every post logged with its lane) · everything can be turned off (master / website / channel / row) · research → create → QA before publish (structurally enforced; in Custom, the human is the QA).
5. **Freshness is engineered:** priority-weighted asset rotation with cooldowns, never-repeat angles (auto-replenished), topic cool-holder (embeddings, ~35 days), image pools rotated, image-first copy so text always matches the picture.
6. **Budget discipline:** two Claude calls per post (generate + QA), images tiered (template → pool → AI, vision-checked), ~$20–40/mo AI at Phase 1. Auto-breakers: budget cap, dead subscriptions, failing channels.
7. **Prompts are the product:** P1–P8 stored as editable data, versioned. Refining prompts is Srini's main creative job.
8. **Every post is a banded bird:** UTM-tagged to the exact post; PostHog tracks the after-click through to purchase and return visits.
9. **The report that matters:** per niche (niche is the bloodline — never one blended number): Winners / Slow performers / No-shows → refines prompts, images, and *which assets to build next*. Plus SMM ROI per niche and a day-wise Company P&L (profit or loss, unmissable).
10. **Admin panel = watch + control:** dashboard with health panel and lane breakdown, calendar, post log, asset coverage, switches, spend meters. The Sheet steers content; admin steers scope and shows everything.

## Purpose

**Role definition: AI is the social media content creator. Srini is not.** Srini's entire job is: drop links and switches in a Google Sheet, refine prompts when output can improve, watch the dashboard, and — only when he personally chooses to — write a Custom post in his own voice. Every other word, image, angle, and posting decision across every brand, every platform, every day belongs to the machine.

One automation system that publishes daily, on-brand social content across the entire portfolio — all 10 niche brands, srini.pro, and any future brand, tool, or social account — with zero manual posting **and zero manual content writing**. The only human input in the whole system is: (1) register an asset once in Supabase when it's created, and (2) set each brand's voice profile once. From there, AI generates every post — sometimes spinning content from asset information, sometimes from external idea sources (RSS, quotes, trends), sometimes purely from its own generation. Fully automatic from day one (no human review queue), 3 posts per day per account (morning / afternoon / evening slots staggered to cover US, Europe, and India/Asia audiences), with every product promoted daily across the portfolio in a rotation sequence that prevents the same product from over-appearing on the same platform.

## Confirmed decisions

- **Platforms:** Facebook + Instagram + Pinterest as the core trio for every niche brand; LinkedIn added for Career, Business & Entrepreneurship, Money & Finance, and srini.pro; YouTube (Shorts) added per-brand as video capability comes online.
- **Hosting:** Cloud versions of both — no servers to maintain. n8n Cloud for orchestration, Postiz Cloud for publishing.
- **Approval:** Fully automatic. No human review. An automated AI QA gate (see Workflow 3) is the only checkpoint before scheduling.
- **Cadence:** 3 posts/day/account — one slot each targeting Americas, Europe, and India/Asia prime times.
- **Zero manual writing:** no post is ever written by hand. Assets are registered once; the automation generates all copy and creative from asset data + idea sources + pure AI generation.
- **Product rotation:** products are promoted daily across all platforms, but sequenced per channel (round-robin + cooldown) so the same product never floods the same platform.
- **Monitoring:** a new **Social section inside admin.grandfieldmedia.com** (the existing shared `apps/admin` panel) shows everything the automation is doing.
- **Sales-weighted priority:** assets that sell well get a higher `priority_score`, so the AI promotes them more often — but the per-platform cooling period still always applies. Bestsellers surface more, nothing ever spams.
- **AI freestyle days:** a share of slots (and occasionally whole days) are pure AI — its own idea, its own image, its own angle, no asset and no feed. This is deliberate: the "AI flavor" that keeps the mix from feeling formulaic.
- **Kill switches, not approvals:** since no human reviews posts, the human control is the OFF switch — one master switch and one per brand/website in the admin panel, plus an automatic trip when the monthly API budget cap is hit or a subscription/auth failure is detected.
- **Niche is the bloodline — never report a single blended number.** Every metric in every report and dashboard view — ROI, winners, spend, clicks, conversions, health — is **split by niche first**; the portfolio total is a secondary footer line, never the headline. One tool, one admin, one machine — but ten distinct businesses, each with its own audience psychology, its own winners, its own trend line. A blended average hides a thriving niche and a dying one inside a comfortable-looking number; niche-by-niche is how problems and opportunities stay visible.
- **Three universal rules, no exceptions:** *everything gets reported* (every post from every run lands in `post_log` and the admin dashboard — including custom human posts), *everything can be turned off* (every run respects the master and per-website switches — including the Custom Lane), and *research → create → QA before publish* (governance: no AI post reaches a platform unchecked; in the Custom Lane the human authoring the post IS the research/create/QA).
- **Keep it simple:** **5 n8n workflows, one lane each** (Assets / Promotions / Custom / AI Entertainer / Health) plus a tiny launch webhook. No workflow sprawl.
- **The Custom Lane:** a manual override lane — Srini writes a post in his own words (experienced advice, opinions, stories), and the machine publishes it **as-is, verbatim, no AI rewriting** — full control back to the human whenever wanted, alongside the automation, never instead of it.
- **Subscriptions:** paid plans already in place for n8n, Claude, OpenAI, and Postiz.

## Channel matrix

| Brand group | FB | IG | Pinterest | LinkedIn | YouTube Shorts | Channels |
|---|---|---|---|---|---|---|
| 10 niche brands (core) | ✓ | ✓ | ✓ | — | — | 30 |
| Career, Business, Money (add LinkedIn) | | | | ✓ | | +3 |
| srini.pro (LinkedIn, X/IG, YouTube) | | ✓ | — | ✓ | ✓ | +3–4 |
| YouTube Shorts (phased in per brand) | | | | | ✓ | +up to 10 |
| **Full build-out** | | | | | | **~36–47** |

**Phase 1 launch set (mirrors the niche rollout plan):** Kids Education, Money & Finance, Career (FB+IG+Pinterest each = 9), Money+Career LinkedIn (+2), srini.pro (+3) → **~14 channels, ~42 posts/day, ~1,260 posts/month.**

## Verified platform facts (checked 2026-07-11)

- **Postiz Cloud** supports 30+ networks including Facebook, Instagram, Pinterest, LinkedIn, YouTube, TikTok, X, and Threads. Multiple Facebook pages can be connected; each counts as one channel.
- **Postiz public API** (`https://api.postiz.com/public/v1`): create/schedule posts, upload media, list connected channels. Auth via API key. Rate limit ~100 requests/hour on cloud, but **multiple posts can be batched into a single request** — so daily batch scheduling is well within limits. API and webhooks are included on all plans.
- **Postiz pricing:** Standard $29/mo (5 channels, 400 posts/mo — too small), **Team $39/mo (10 channels, unlimited posts)**, **Pro $49/mo (30 channels, unlimited posts, 300 AI images + 30 AI videos/mo)**, **Ultimate $99/mo (100 channels, unlimited posts, 500 AI images + 60 AI videos/mo)**. Phase 1 needs **Pro ($49)**; full build-out needs **Ultimate ($99)**. Standard is ruled out by the 400 posts/mo cap alone (Phase 1 already generates ~1,260/mo).
- **Postiz has a native n8n Custom Node** plus MCP/agent tooling — n8n → Postiz is a first-class integration, not custom glue.
- **n8n Cloud pricing:** Starter €20/mo (2,500 executions, unlimited active workflows), Pro €50/mo (10,000 executions). One workflow run = one execution regardless of steps, so batching brands inside a workflow keeps counts low. Estimated usage ~40–80 executions/day (~1,200–2,400/mo) → **Starter is enough initially**; move to Pro if event-driven workflows multiply.

## Architecture

```
┌─────────────────────────────┐     ┌─────────────────────────────────────────┐
│  GOOGLE SHEET (Srini owns)   │     │       SUPABASE (social schema)          │
│  Tab 1: Assets    (per-row   │     │  brands · channels · assets ·           │
│  Tab 2: Promotions  ON/OFF   │     │  active_promotions · content_items ·    │
│  Tab 3: Custom Posts  each)  │     │  post_log · run_log · health_status ·   │
└──────────────┬──────────────┘     │  metrics · automation_controls          │
               │ synced every run    └────────▲───────────────────┬───────────┘
               │                              │ reads/writes      │ webhook:
               ▼                              │                   ▼ new product
┌──────────────────────────────────────────────────────────────────────┐
│                              n8n CLOUD                                │
│  Run 1: ASSETS LANE       (daily — Assets tab → steady rotation,      │
│         priority-weighted, cooldown-gated, fresh angles)              │
│  Run 2: PROMOTIONS LANE   (daily, first — Promotions tab → hard       │
│         push 1–3/day until flipped OFF, never-repeat angles)          │
│  Run 3: CUSTOM LANE       (2h — Custom Posts tab → Postiz verbatim,   │
│         no AI, no checks)                                             │
│  Run 4: AI ENTERTAINER    (daily — no sheet: own research + evergreen │
│         + pure freestyle, keeps each niche warm with something new)   │
│  Run 5: HEALTH & LEDGER   (daily — check every part → report broken   │
│         things → metrics → priorities → budget breaker)               │
│  + Launch hook (webhook: new product → adds Sheet rows, zero setup)   │
└──────┬──────────────────────────────────────────────────┬────────────┘
       │ Claude API (all language: copy, QA,              │ Postiz node /
       │   scoring, enrichment)                           │ public API
       │ OpenAI API (images + embeddings)                 ▼
       ▼                                     ┌───────────────────────────┐
  [ AI APIs ]                                │       POSTIZ CLOUD         │
                                             │  FB · IG · Pinterest ·     │
┌─────────────────────────────┐              │  LinkedIn · YouTube        │
│  ADMIN PANEL (Social section │◄─ reads ─── │  (each account = 1 channel)│
│  admin.grandfieldmedia.com)  │   Supabase  └───────────────────────────┘
│  dashboard · reports ·       │
│  switches (master/site/chan) │
└─────────────────────────────┘
```

**Division of labor:** the Google Sheet is the human control surface (what to promote, what to push, what to say — per-row ON/OFF everywhere). Supabase is the machine's memory (working copies, rotation state, logs, health, switches — everything reported). n8n is the conductor (four runs, schedules, retries, branching). Claude API handles all language; OpenAI API handles images + embeddings. Postiz owns the actual platform connections, media hosting, and publishing — we never touch Facebook/Pinterest/LinkedIn APIs directly. The admin panel reads Supabase for all reporting and holds the scope-level switches.

**Relationship to the commerce stack:** lives in the **same shared Supabase project** as the 10 niche sites but in its own `social` schema. Unlike the commerce data model, srini.pro and grandfieldmedia.com ARE included here — the `brands` registry is portfolio-wide and is deliberately broader than the commerce `site_id` list (brands can map to a `site_id` when one exists).

## Supabase schema (`social` schema)

**Registry tables (human-maintained, written once):**

- **brands** — id, name, slug, site_id (nullable link to commerce), site_url, voice_profile (text: tone, vocabulary, persona), compliance_rules (text: e.g. Money & Finance YMYL framing), hashtag_sets, timezone_targets, status (active/paused). *Adding a future brand = one row.*
- **channels** — id, brand_id, platform, postiz_integration_id, cadence_per_day (default 3), slot_times (jsonb), active. *Adding a new social account = connect in Postiz, insert one row.*
- **assets** — a machine mirror of the **Assets Google Sheet** (see "Assets database" section below — the Sheet is the human source of truth; this table is what the automation actually operates on, synced from the Sheet at the start of every daily run). Columns: id (stable, generated on first sync), brand_id, asset_type, name, slug, url, price_cents, one_liner, description, key_benefits (jsonb), target_audience, pain_points_solved (jsonb), promo_angles (jsonb — AI-generated at first sync), media (jsonb), **priority_score** (1–10, auto-updated nightly from sales + engagement, sheet override wins), status (live/paused/retired — driven by the Sheet's Promote? column and row presence).
- **automation_controls** — the kill switches. One `global` row + one row per brand/website: enabled (bool), reason (text — "fixing issue", "budget", "subscription", "no content yet"), updated_at. Every run checks this table first; global off = nothing posts anywhere, website off = that brand's channels go silent. **Every website starts OFF by default** — it's flipped ON from admin only when it actually has products/content worth promoting, so the other 7+ niches sit dark until their turn in the rollout. Flipping a switch in admin is instant — no deploy, no n8n change.
- **idea_sources** — external inspiration feeds per brand (see "Idea sources" section below). id, brand_id (null = portfolio-wide), source_type (rss, quotes_api, subreddit, trends, holidays_api, on_this_day, static_bank), name, url_or_config (jsonb), fetch_interval, last_fetched_at, active, notes.
- **content_pillars** — id, brand_id, name (tip, product_promo, inspired_by_source, engagement_question, seasonal, myth_buster, quote_card, relatable_humor…), weight, prompt_template. Weights drive the daily mix so feeds don't become pure promotion (~60% value / 25% promo / 15% engagement-entertainment).

**Machine-maintained tables (written by the automation):**

- **inspiration_items** — fetched from idea_sources by Run 4 (AI Entertainer). id, source_id, brand_id, title, summary, source_url, fetched_at, used_at (null = fresh), score. AI reads these as *inspiration and commentary triggers only* — it never copies feed content, it writes an original take.
- **asset_promotion_state** — one row per (asset_id × channel_id): last_promoted_at, promotion_count, last_angle_used, angle_history (jsonb), next_eligible_at. This table IS the anti-repetition mechanism (see "Product promotion rotation").
- **active_promotions** — machine mirror of the Promotions tab: asset_id, posts_per_day, platforms, started_at, status. While a row is active, that asset overrides normal rotation on its brand's channels (see "The Promotions tab").
- **content_items** — id, brand_id, pillar_id, asset_id (nullable), inspiration_item_id (nullable), topic, **topic_embedding (pgvector — powers the topic cool holder)**, copy_by_platform (jsonb — FB, IG, Pinterest, LinkedIn variants from one generation call), media_type, media_ref, status (planned → generated → qa_passed / qa_failed → scheduled → published → failed), recycle_eligible, last_used_at.
- **post_log** — id, content_item_id, channel_id, postiz_post_id, **lane (run1_assets / run2_promotions / run3_custom / run4_entertainer — every post is stamped with which run produced it, no exceptions)**, slot (morning/afternoon/evening), scheduled_at (UTC), published_at, status, qa_verdict, error.
- **metrics** — post_log_id, impressions, likes, comments, shares, clicks, fetched_at. (Feeds pillar weights over time: do more of what works.)
- **run_log** — one row per workflow run: started_at, finished_at, posts_planned/generated/scheduled/skipped, claude_tokens, openai_images, estimated_cost_usd, errors (jsonb). Aggregated monthly against the budget cap; the budget circuit-breaker and the admin spend meter both read from here.
- **health_status** — one row per checked component (Postiz key, each channel, Sheet, Supabase, Claude, OpenAI, each idea feed, each run's schedule): status (ok/warn/broken), detail, checked_at. Written by Run 5's health check; the admin Dashboard's green/red system panel reads it directly.

## Assets database — a Google Sheet is the source of truth

**The philosophy of an entry: a destination, not a brief.** A row in the Assets or Promotions tab is you telling the machine one thing — *"this is the link; bring people here."* Everything else — what to say, what angle, what image, when, on which platform — is the machine's job. Concretely, every promo post is built around driving traffic to the row's URL, delivered per platform convention: inline link on Facebook and LinkedIn, the pin's destination URL on Pinterest, "link in bio" on Instagram (the bio link kept pointed at the brand's catalog page). And every link carries **auto-appended UTM parameters** (`utm_source=platform, utm_medium=social-auto, utm_campaign=asset-slug, utm_content=angle, utm_term=post_id` — the post_id means every single site visit traces back to the exact post that caused it) — so PostHog on the niche sites shows exactly which platform, asset, and angle brought each visitor, and Run 5 can feed real click/conversion data back into priority scores. "Bring the user here" isn't just the intent — it's measured per post.

The human-facing asset registry is **one Google Sheet in Srini's Google Drive** ("Grandfield Media — Assets"). Adding an asset to the promotion machine = adding a row. Removing it = flipping its ON/OFF column to OFF. **Sheet-wide rule: every row in every tab has an ON/OFF switch, and rows are never deleted** — flipping OFF keeps the entry, its Asset ID, and its history intact, and re-activating later is just flipping it back ON (e.g. re-running last year's holiday promotion). No admin form, no SQL, editable from any device, and always visible at a glance. Every promotable thing lives here — PDF templates, books, courses, prompt packs, apps, tools, newsletters, YouTube channels, the websites themselves, srini.pro assets — deliberately broader than the commerce `products` table.

**Columns you fill (per row, ~2 minutes):**

| Column | Example |
|---|---|
| Brand | Grandfield Money |
| Type | pdf_template |
| Name | Monthly Budget Planner |
| URL | grandfieldmoney.com/products/budget-planner |
| Price | $29 |
| Description | 2–4 plain sentences on what it is and who it's for |
| Promote? | ON / OFF — the per-asset switch (flip OFF instead of deleting) |
| Priority override | blank = automatic; 1–10 to force |

**One machine-written column:** Asset ID (stable key, written on first sync — don't edit). That's it — the Sheet is input-only. **All reporting lives in Supabase and the admin dashboard**, not in the Sheet: the Sheet is for deciding *what* to promote; the dashboard is for seeing *what happened*.

### The Promotions tab — the "push this hard right now" list

Same spreadsheet, second tab. The Assets tab is the library in steady rotation; the **Promotions tab is the boost list** — any row with Promote? = ON gets pushed **every day, on every one of its brand's platforms, until you flip Promote? to OFF** (no cooldown gate). Ending a launch push is one cell edit. This is for launches, sales pushes, seasonal pushes.

| Column | Example |
|---|---|
| Asset ID / Name | the course being pushed |
| Promote? | ON / OFF — flip OFF to stop the push, never delete (same switch name as the Assets tab) |
| Posts per day | 1–3 (per platform) |
| Platforms | all / or specific |
| Started | 2026-07-11 |
| Notes (optional) | "launch week — lean on early-bird urgency" |

**Freshness is the hard rule:** the same product every day never means the same post. Each promo post must use a **new angle, new hook, new question** — the machine tracks angle history per (asset × channel) and never repeats until the pool is exhausted; when the 6–10 original angles run low, Claude auto-generates a fresh batch (new questions, objection-handlers, use-case stories, social-proof frames, urgency variants — informed by which angles earned engagement so far). On top of that, the topic cool holder checks each new post's *copy* against everything recent, so even post #40 about the same course is provably different content. Promoted daily ≠ repetitive.

**Cadence guidance:** "Posts per day = 3" makes every slot on that platform a promo — fine for a 2–3 day launch spike, corrosive beyond that (platforms throttle accounts that only sell). The recommended sustained setting is **2/day (2 promo + 1 value post)**, dropping to 1/day after launch week. The machine allows 3 but the digest will nag if it runs more than 3 days.

**How launches flow (Launch hook + this tab):** a new product shipping auto-appends a row here, ON (default: 3/day for 3 days, then 2/day for 4 days). You extend, tune, or flip it OFF whenever you like — or add a row manually anytime for a product that already exists. OFF returns the asset to normal rotation in the Assets tab, and the row stays as a record of the campaign, ready to flip ON again next season. One mechanism, machine-started or human-started.

**How it syncs:** every Daily Machine run reads the Sheet via n8n's native Google Sheets node and upserts into Supabase `assets`. New row → Claude enriches it (generates 6–10 `promo_angles` — e.g. for a budget planner: "new-month fresh start," "paycheck-to-paycheck relief," "couples money fights" — plus benefits/audience framing from your description) and it joins the rotation the same day. Edited row → updates flow through. Promote? = OFF → asset retired from rotation immediately, row and history kept. Supabase remains the machine's operating store (rotation state, cooldowns, logs, all reporting joins) — the Sheet is the steering wheel, not the engine. Run 2 also auto-appends a row to the Sheet when a new commerce product ships, so even launches involve zero data entry.

Each promo post uses a different angle than the last one used on that channel — so even the 15th promotion of the same product reads fresh.

## Product promotion rotation (no product spams any platform)

Every channel's daily plan includes exactly **one promo slot** (the other two slots are value/entertainment — this ratio protects reach, since platforms suppress accounts that only sell). The planner picks which asset fills each channel's promo slot with this rule, reading `asset_promotion_state`:

1. Eligible = live assets of that brand where `next_eligible_at` ≤ today for THIS channel. **The cooldown gate comes first, always — priority never overrides it.**
2. Among eligible assets, pick by **weighted random on `priority_score`** — a bestseller (score 9) gets picked roughly 3× as often as a slow mover (score 3), but every live asset still cycles through. New launches get a temporary boost (first 14 days); after that, the score is earned nightly from actual sales + engagement data.
3. After scheduling: set `next_eligible_at = now + cooldown`. Cooldown = max(4 days, catalog_size / promo_slots_per_day on that channel) — so with 1 product the same product appears at most every 4 days per platform with a rotating angle, and with 10 products each one naturally appears ~every 10 days per platform.
4. Rotate `promo_angles`: never reuse the angle used in that asset's previous promotion on that channel.
5. Cross-platform offset: the same asset is deliberately scheduled on *different days* per platform where possible, so a follower of the brand on FB + IG doesn't see identical promos the same day.

Net effect: **every product is being promoted somewhere every day**, bestsellers get proportionally more airtime, and yet any single (product × platform) pairing stays days apart with a different angle each time — promoted more ≠ spammed.

## Idea sources — keeping audiences warm per niche

Run 4 (AI Entertainer) pulls these into `inspiration_items`; across the lanes the machine mixes four content modes: **asset-driven** (Runs 1–2, promo slots), **source-inspired** (Run 4 — original take on a trend/quote/date), **evergreen** (Run 4 — AI tip from the brand's domain), and **AI freestyle** (Run 4 — pure invention, no asset, no feed, just the niche prompt and brand voice). Feeds are never copied — headline/summary in, original branded take out.

**Portfolio-wide sources (all brands):**

- Nager.Date or Calendarific — public holidays + observances (free APIs) → seasonal hooks ("World Savings Day," "Teacher Appreciation Week")
- Wikipedia "On This Day" API — free, reliable daily hooks
- ZenQuotes / API Ninjas Quotes — quote APIs for branded quote-card posts (rendered on the brand template, not generic images)
- Google Trends (via RSS/n8n community nodes) — trending-topic awareness per region

**Per-niche (Phase 1) — RSS feeds and communities to draw inspiration from:**

- *Kids & Children's Education:* We Are Teachers RSS, Edutopia RSS, PBS Parents, r/Parenting + r/Mommit (top posts weekly RSS) → relatable-parenting angles, activity ideas, school-calendar moments
- *Money & Finance:* The Penny Hoarder RSS, NerdWallet blog RSS, r/personalfinance top-weekly → money tips, saving challenges, budgeting conversation starters (always re-framed through the YMYL-safe "organizational tools" lens)
- *Career & Professional Development:* Harvard Business Review RSS, The Muse RSS, Indeed Career Guide, r/careerguidance + r/jobs top-weekly → interview tips, workplace humor, career-move conversation starters
- *srini.pro:* TechCrunch AI RSS, The Rundown AI, Hacker News front page RSS → AI/builder commentary in Srini's voice

**Memes / entertainment:** avoid scraping third-party meme images (copyright + brand risk, and a real hazard for the Meta ad accounts). Instead the `relatable_humor` pillar has Claude write original relatable text-humor and renders it on branded templates — same warmth, zero copyright exposure. Imgflip's template API is an optional later experiment for classic formats, gated per-brand.

Each source is one row in `idea_sources` — adding a feed for a future niche is data entry, not development. As Phase 2/3 niches activate, their feeds get added the same way (e.g. Apartment Therapy RSS for Home & Lifestyle, r/weddingplanning for Events).

## Built for change — the company will outlive its niches and platforms

Companies change shape; the machine must absorb that without surgery. **Every growth or death event below is a data operation — rows, switches, config — never a code rebuild:**

| Company event | What it takes in the machine |
|---|---|
| **New niche launches** | One `brands` row (voice profile, compliance, pillars) + connect its accounts in Postiz + `channels` rows + idea-source rows + flip its website switch ON. Hours, not weeks — the lanes, prompts, QA, and reporting are shared and immediately apply. |
| **New tool/app/product ships** | Nothing. The launch webhook auto-registers it and campaigns for it. |
| **New social platform matters** (whatever comes after these) | If Postiz supports it (30+ networks today, growing): connect it, add `channels` rows, add its platform conventions to the P2 prompt block. The lanes don't know or care which platforms exist — they read the channels table. |
| **A platform becomes obsolete or hostile** | Flip its channels OFF (history preserved), later mark retired. No orphaned code — there was never platform-specific code, only rows. |
| **A niche dies** | Website switch OFF → all its channels silent same day. Assets stay archived in the Sheet (OFF), history stays queryable, costs stop. If it revives, flip it back. The other nine niches never notice. |
| **A niche explodes** | Raise its cadence, budget share, and channel count — per-brand settings. Scale one without touching nine. |
| **Postiz/n8n/model vendors change** | Each is a swappable layer: publishing is behind Postiz's API surface, prompts are data (P1–P8 rows), models are pinned env vars. Painful ≠ impossible: the Supabase truth (brands, assets, history, learnings) survives any vendor swap intact. |

The invariant: **the machine's knowledge — brands, assets, angles, what worked, what died — lives in Supabase and the Sheet, never inside any vendor.** Tools are limbs; the memory is the company's.

## Defense in depth — an OFF switch at every level

The non-negotiable property of a touchless machine: **when something is not right, it can be stopped at exactly the level where it's wrong, without stopping anything healthy.** Six levels, top to bottom:

| Level | Switch | Example trigger |
|---|---|---|
| 1. Master | admin Controls (global row) | anything systemic — auto-trips on budget cap or AI subscription/key failure |
| 2. Website/brand | admin Controls (per-brand row) | no new content yet, compliance concern, fixing brand voice |
| 3. Channel (platform × brand) | admin Controls (`channels.active`) | LinkedIn rejecting posts, Instagram token expired, one platform acting up — the other platforms keep posting |
| 4. Single asset | Sheet → Assets tab, **that row's** Promote? OFF | this entry looks wrong, this product being reworked, bad reception |
| 5. Single promotion push | Sheet → Promotions tab, **that row's** Promote? OFF | this launch push done or misfiring |
| 6. Single custom post | Sheet → Custom Posts tab, **that row's** ON/OFF | drafted but not ready |

Levels 1–3 live in the admin panel and stop whole scopes (everything / a website / one platform of one website). Levels 4–6 live in the Google Sheet and are **always per line entry** — each row carries its own switch, so you stop exactly one asset, one push, or one post without touching its neighbors. There is no tab-level switch in the Sheet, deliberately: the Sheet controls individual entries; scopes are stopped from admin.

**Auto-OFF (the machine protects itself without waiting for a human):**

- **AI subscription/key dies** (Claude, OpenAI, Postiz auth probe fails) → master auto-OFF + immediate alert. Nothing posts on a broken pipeline.
- **Budget cap hit** → master auto-OFF + alert.
- **A channel fails repeatedly** (e.g. LinkedIn rejects 3 consecutive posts, expired token, API errors) → Run 5 auto-flips **just that channel** OFF, alerts, everything else continues. No more silent weeks of a dead channel.
- **Sheet sync produces something suspicious** (row missing required fields, unparseable price, unknown brand) → that row is skipped and flagged in the digest — never guessed at. A bad entry can't poison the pipeline; you correct the row and the next sync picks it up.

**Fixing a bad entry** is the same motion everywhere: flip the row OFF (or just correct it), next run picks up the truth. Nothing needs support tickets, deploys, or touching n8n.

Every switch state and every auto-OFF event is visible in the admin Dashboard (who/what flipped it, when, why) — so "is anything turned off right now, and why?" always has a one-glance answer.

## Admin panel — Social section (admin.grandfieldmedia.com)

The existing shared `apps/admin` panel (same Supabase Auth email-whitelist login, same shared Supabase project) gains a **Social** section — this is precisely why the social schema lives in the same Supabase project as commerce. No new app, no new login. Pages:

- **Social Dashboard** — today at a glance: a **green/red system health panel** (from `health_status`: every service, every channel connection, the Sheet, every feed — broken things named specifically), posts scheduled / published / failed **per brand, per platform, and per lane** (a Run 1/2/3/4 breakdown row: how many asset promos, hard-push promos, custom posts, and entertainer posts went out today), QA-gate pass/fail counts, next 24h queue, month-to-date API spend vs budget. Red banner if any run hasn't fired on schedule or the budget breaker has tripped.
- **Calendar** — week/month grid of scheduled + published posts, **each carrying a colored lane badge (Run 1 Assets / Run 2 Promotion / Run 3 Custom / Run 4 Entertainer)**, filterable by brand/platform/lane/pillar; click any post to see final copy, media, angle used, QA verdict, and its Postiz/platform link.
- **Post Log** — searchable history from `post_log` + `content_items`: what was posted where and when, **by which run**, status, errors, retries. Filter to one lane in one click ("show me everything Run 4 posted this week for Grandfield Money").
- **Asset Coverage** — the rotation, made visible: every asset × platform with last-promoted date, promotion count, angle history, next-eligible date, plus Sheet-sync status (last successful sync, rows added/retired). Instantly answers "is anything being over- or under-promoted?" Stale assets (not promoted anywhere in 14+ days) get flagged. (The Google Sheet shows the per-asset summary; this page shows the full per-platform detail.)
- **Idea Sources Health** — each feed's last successful fetch, item counts, error state; toggle sources on/off.
- **Controls** — the switchboard: **master ON/OFF**, one switch per brand/website, and one per channel (platform × brand — turn off just LinkedIn for one brand while it misbehaves). Writes to `automation_controls`/`channels`, takes effect on the next run; flip while fixing an issue, when API budget runs hot, on any subscription problem, or simply because a website has no content to promote yet (new websites start OFF). Shows every auto-OFF event with its reason. Plus: an **API budget meter** (month-to-date spend from `run_log` vs the cap, with the auto-trip threshold visible), per-asset priority_score override, force-regenerate on a flagged item, and pillar weight editing.
- **Company P&L (management view)** — the flip side of all the per-niche detail: **is this company making or losing money?** One page, owner's eyes only:
  - **Revenue** — every Stripe order across all niche sites (the commerce schema already captures this), shown **day-wise** (daily revenue chart with 7/30-day trend), monthly total, and month-vs-last-month.
  - **Costs** — a simple `company_costs` table Srini maintains (name, amount, monthly/annual/one-time, category): Vercel Pro, Postiz, n8n, domains, any tool subscriptions — plus **auto-fed variable costs** (Claude/OpenAI actuals from `run_log`, and Meta ad spend via API once ads run).
  - **The verdict line** — revenue − costs = **PROFIT or LOSS**, big and unmissable, daily and monthly, with the trend ("profitable 3 weeks running" / "loss narrowing"). This is the number the whole company rolls up to.
  - Below the company line, the bloodline rule still applies: the same P&L split per niche, so you see *which* niches fund the company and which are still investments.
  - Day-wise granularity matters here for cause-and-effect: revenue spikes line up against launches, promotions, and ad pushes on the same axis — "did that launch actually move the company number?"
- **Performance / Winners** (once metrics accrue) — the find-the-winning-one page, joining `post_log` (which post, lane, angle, slot, platform) with PostHog attribution (visits, conversions, revenue, region, returning visitors — traceable to the exact post via `utm_term=post_id`). *"We leave our post-birds outside to fly. They need to come back and report to us: what kind of bird do people out there like, and what kind do they not care about."* — the operating philosophy of this report. Every post is released, every post returns with news, and no bird flies without a band on its leg (the post_id UTM).

  **THE most important report in the machine** — the one that improves the input strategy. Every post lands in one of three tiers, per niche:
  - **🏆 Winners** — clicked, converted, brought people back. Shown with full copy, angle, image, asset type.
  - **🐢 Slow performers** — some traction, below the niche's own median (never judged against other niches). The "almost" pile — often one fix away.
  - **👻 No-shows** — posted many times, nobody clicked, nobody saw, nobody cared. Named without mercy: "generic motivational quotes on Facebook for Career: 22 posts, 0 clicks." Silence is data.

  **What the tiers teach — the report exists to refine three inputs:**
  1. **Prompt strategy** — winners' copy patterns vs no-shows' copy patterns, per niche ("questions outperform statements 3:1 in Kids; long captions die on IG for Money") → concrete P2–P5 edits, versioned so next week's report grades the refinement.
  2. **Image strategy** — which image tier/style wins per niche (mockup vs template card vs AI illustration; bright vs calm) → edits to brand style blocks and template variants.
  3. **Asset generation strategy** — the deepest one: patterns in *what kind of asset* earns clicks. "Checklist-style PDFs always get clicked; long ebook-style guides never do" is not a posting insight, it's a **product roadmap instruction** — build more of the clicked kind. The report surfaces asset-type patterns (by asset_type + price band + topic) exactly for this.

  Each tier entry carries its diagnosis and action: slow performer with clicks-but-no-conversions → fix the sales page; engagement-but-no-clicks → weak CTA, refine the prompt; a winner on one platform only → multiply it to the others; a converting asset with a thin image pool → add images. No-show patterns → stop generating that content type in that niche (retire the pillar or angle family) and let the machine reallocate slots to what works.
  - **Post leaderboard** — top posts by visits → purchases, with copy and angle shown, so winners teach the prompts.
  - **Channel KPI** — per platform per brand: clicks, conversion rate, revenue, and **returning-customer rate** (the "which channel brings customers back to us" number).
  - **Time × region heatmap** — which slot converts best for which region on which platform; findings feed back into each channel's slot times.
  - **Angle & asset rankings** — what converts (not just what gets liked), feeding priority scores and angle-pool weighting.

- **The One Report** (weekly — top of the digest email AND a pinned card on the dashboard). Headlined by **SMM ROI — as a per-niche table, never one blended number**: each niche's attributed revenue (PostHog → Stripe orders carrying our UTMs) against its share of SMM cost, with its own week-over-week trend — e.g. *"Money 11.2×↑ · Kids 6.4×→ · Career 2.1×↓ · srini.pro n/a"* — and the portfolio total as a footer line. Career trending down is a finding; a healthy blended average would have buried it. The three lists below are likewise **grouped by niche**: each niche gets its own employees-of-the-month, its own asset rankings — because a winner in Kids teaches you nothing about Money. **This report never lists what was posted — the Calendar does that. It only lists what *worked*: what brought traffic, what brought money, what brought people back.** Below the ROI line, one page, three lists, each an instruction about where to invest attention:
  1. **🏆 Employees of the Month — the posts that earned their salary.** The handful of posts (out of hundreds) that produced real results: most traffic delivered, most conversions, most returning visitors — each shown with its full copy, angle, image, platform, and slot, plus what it earned. These are the templates to study: refine the prompts toward what they do right, promote their assets harder, and let their style influence next month's generation. Every other post was just doing its shift; these are the ones that get the plaque.
  2. **Assets that work best — invest here.** Ranked by revenue and conversion rate from social traffic. These deserve more images in their pool, more angles, maybe a Promotions-tab push — and they hint at what your *next* product should look like.
  3. **Assets with the most clicks.** Ranked by raw click volume — deliberately shown *separately* from list 2, because the gap between them is the insight: **high clicks + low conversions = the post is doing its job but the sales page isn't** (fix the page, not the post); **high conversions + low clicks = a proven seller starved of traffic** (raise its priority, push it in the Promotions tab). The mismatches are flagged automatically with which of the two fixes applies.

  Built by Run 5 from `post_log` × PostHog attribution. This is the report that turns the machine's volume into decisions: what to perfect, what to scale, what to fix.

## n8n workflows — five runs, one lane each

One n8n instance, five workflows. The mental model is dead simple: **one run per lane** — Runs 1–3 each read one tab of the Google Sheet, Run 4 needs no sheet at all (pure AI), Run 5 watches everything. Every run starts the same way (check switches) and ends the same way (write `post_log` + `run_log`) — the two universal rules are plumbing, not per-run features.

**Shared plumbing (every run passes through this):**
- **Switch check first.** Read `automation_controls` (plain Supabase query — n8n pulls flags at run time; admin and n8n never talk directly, the table is the meeting point): global off → stop; website off → skip that brand AND delete its still-pending scheduled posts from Postiz (the switch stops the queue, not just future planning); channel off → skip that platform. Budget cap hit or a failed Postiz/Claude/OpenAI auth probe → auto-flip master off, alert, stop. Admin switches also fire an instant webhook for immediate effect.
- **Slot coordination.** Each channel has 3 slots/day. The runs execute in a fixed morning sequence — **Run 2 (promotions claim first) → Run 1 (assets take a promo slot where free) → Run 4 (AI fills the rest)** — each reading what earlier runs already claimed in `content_items`, so lanes never collide or exceed the 3/day cadence.
- **Report always.** Every published post from every lane lands in `post_log` (tagged by lane); every run logs tokens/cost/outcomes to `run_log`.

**Run 1 — Assets Lane** (cron, daily). *Reads the Assets tab.* Syncs the tab into Supabase (enrich new rows via Claude, apply edits, retire OFF rows, write back Asset IDs). On each channel where no promotion already claimed the promo slot: picks one asset via the priority-weighted rotation (cooldown-gated, never-repeat angle), generates all platform variants in the brand voice (asset data + assigned angle), renders/attaches media (asset mockups or branded template), QA-gates it, schedules into Postiz. The steady heartbeat: every live asset keeps getting promoted somewhere, forever, with fresh angles.

**Run 2 — Promotions Lane** (cron, daily, runs first). *Reads the Promotions tab.* Syncs into `active_promotions`. Every row with Promote? = ON claims its configured 1–3 slots/day on its brand's platforms — no cooldown gate, but the never-repeat-angle rule is absolute (Claude auto-generates a fresh angle batch when the pool runs low, weighted by what earned engagement). Generates, QA-gates, schedules. The hard-push lane: launches, sales, seasonal pushes — until the row is flipped OFF.

**Run 3 — Custom Lane** (cron, every 2 hours). *Reads the Custom Posts tab.* **No AI. No QA. No content checks.** Picks up ON rows and posts them to Postiz *verbatim* — exactly as Srini wrote them — marks each "posted ✓" so nothing double-posts. Rows stay as posting history. It still checks the switches and still writes `post_log` (tagged custom) — nothing escapes the two universal rules — but nothing touches the words. The human lane: experienced advice, opinions, stories, in your voice.

**Run 4 — AI Entertainer** (cron, daily, runs after 1 & 2). *No sheet — this is the lane where AI is on its own, and AI is the decider.* Its job: **entertain the niche audience with something they might like** — set the mood, give motivation, share the pain ("that budgeting week when everything breaks at once"), make them smile or feel understood. **Never a link back to our websites. No CTA, no products, no traffic job — this lane only gives, never asks.** That asymmetry is deliberate: the promo lanes can bring people to the links precisely because the entertainer has made the account worth following. It fills all slots the promo lanes didn't claim (typically 2 of 3 per channel). It works from nothing but the brand's niche prompt (voice_profile + content pillars) and mixes three modes: **its own research** — refresh `idea_sources` (RSS, quotes, holidays, trends) into the inspiration pool and write an *original take* on something current (never copying, reference in / new content out); **evergreen** — a tip or insight from the niche's domain knowledge; and **pure freestyle, no reference at all** — AI invents a fresh idea, question, or relatable moment for the niche from scratch, generates its own image concept, adds its own flavor. Every candidate passes the topic cool holder (embedding check vs ~35 days of history) so "something new" is enforced, not hoped. QA-gated, scheduled. This is the lane that makes the accounts feel alive rather than like a catalog.

**Run 5 — Health & Ledger** (cron, daily, offset from the others). Watches everything — full detail below.

**Launch hook** (not a lane — a tiny webhook helper): new product row in the commerce schema → auto-appends its row to the Assets tab (Claude enriches: angles, benefits) AND a launch row to the Promotions tab (default: 3/day for 3 days, then 2/day for 4 days). Runs 1 and 2 do the rest on their next cycle. **Shipping anything new triggers its own campaign with zero setup**; the human tunes or flips the rows OFF via the Sheet. New blog posts get a lighter single-burst version.

## Publishing governance — research → create → QA, no exceptions

The third universal rule (alongside *everything reported* and *everything can be turned off*): **no post publishes without passing research → create → QA check.** This is governance, not a nice-to-have — in a machine with no human approval step, the pipeline itself is the approval.

| Lane | Research | Create | QA before publish |
|---|---|---|---|
| Run 1 Assets | asset data + image caption + angle history (what's been said, what the image shows) | copy from the asset's enriched fuel, fresh angle | Claude critic (P6) + vision check on first image use |
| Run 2 Promotions | same as Run 1 + engagement-weighted angle pool | copy on the assigned push angle | same as Run 1 — the hard-push lane never skips QA |
| Run 4 Entertainer | inspiration pool scoring (P7) / niche domain / cool-holder check for freshness | original take, evergreen tip, or freestyle | Claude critic (P6) + vision QA on every generated image |
| Run 3 Custom | **the human is all three** — Srini researched it, wrote it, and approved it by flipping the row ON | — | — (machine publishes verbatim; adding AI checks here would defeat the lane's purpose) |

Enforcement is structural, not procedural: in n8n, the Postiz publish node is *only reachable* through the QA node — there is no workflow path that schedules an unchecked AI post. A QA failure never auto-publishes: one rewrite attempt, then skip + flag in the digest. The `post_log` records each post's QA verdict, so the governance trail ("every published post passed its checks, here's the record") is queryable in admin at any time.

## The per-post pipeline — right AI tool at every stage

Every single post moves through the same five stages, each using the cheapest tool that does the job well:

| Stage | Tool | Why this tool |
|---|---|---|
| 1. Research / idea | Inspiration pool (RSS/quotes/holidays — free) + a **cheap fast Claude model** (Haiku-class) to score relevance and pick topics | Scoring hundreds of feed items daily needs speed and pennies, not brilliance |
| 2. Generate copy | **Strong Claude model** (Sonnet-class), one call per topic → all platform variants in the brand voice | The only stage where quality is the product — spend the good tokens here |
| 3. Generate image | Tiered: **branded template render** (HTML→PNG, free) for tips/quotes → **asset mockups** (already made) for promos → **OpenAI image API** only for freestyle/hero posts | Most posts don't need generative images; reserving image AI for ~20–30% of posts keeps cost and weirdness down |
| 4. QA + submit | Cheap Claude critic pass → **Postiz API** (batched) | Mechanical checking + scheduling — no creativity needed |
| 5. **Cool holder** | **OpenAI embeddings + pgvector in Supabase** | The machine's memory — see below |

**The topic cool holder:** when a post is scheduled, its topic is embedded (OpenAI embeddings, fractions of a cent) and stored in Supabase (pgvector column on `content_items`). Before any new topic is planned, it's checked by cosine similarity against everything that brand posted in the cooling window (**~35 days per brand per platform**). Too similar → rejected and replanned, or deliberately re-angled (same theme, provably different take). This is stronger than exact-match dedup — it catches "5 budgeting mistakes to avoid" vs "avoid these 5 money mistakes," which string comparison would miss. Assets have their own separate cooldown (`asset_promotion_state`); the cool holder covers *every* topic, promo or not. After the window expires, good topics naturally become reusable — which is exactly the evergreen recycling mechanism.

The division of labor between the two AI providers is deliberate: **Claude = everything language** (topic scoring, copy, QA critic, asset enrichment), **OpenAI = images + embeddings**. One provider down ≠ machine down: no images → text/template posts still flow; no embeddings → falls back to exact-match dedup for the day.

## Run 5 — Health & Ledger (the watcher)

Two jobs: check the machine, and learn from the results.

*System health check — walks the whole setup and reports anything broken:*
- **Postiz**: API key valid, and **every connected channel individually** — expired Instagram tokens, disconnected Facebook pages, revoked LinkedIn permissions are the most common silent failure in social automation; each channel gets a live status.
- **Google Sheet**: reachable, expected columns present (catches an accidentally deleted/renamed column before it corrupts a sync), last sync succeeded.
- **Supabase, Claude, OpenAI**: reachable, keys valid, quota/subscription healthy.
- **Idea sources**: each feed's last successful fetch (dead RSS URLs flagged).
- **Runs themselves**: did Runs 1–4 each fire on schedule? (dead-man check on `run_log`.)
- **Post reconciliation**: scheduled vs actually-published in Postiz — retries failures, flags anything stuck.

Everything lands in a `health_status` table (component, status, detail, checked_at) → the admin Dashboard renders it as a green/red system panel, and anything red goes into the digest (or an immediate alert for critical items like "all channels for a live brand are dead").

*Ledger — learn and guard:*
- Pulls engagement metrics into `metrics`.
- **Recomputes every asset's `priority_score`** from sales (commerce orders) + engagement.
- Totals month-to-date API spend vs the budget cap — trips the master breaker if close/over.
- **Subscription quota meter — all four paid services, not just AI tokens:**
  - **Postiz:** channels connected vs plan limit (e.g. 14/30 on Pro — warns when adding the next brand's channels would exceed the plan, i.e. "time to upgrade to Ultimate"), posts published this month (from our own `post_log` — sanity vs plan terms), and API request pacing vs the 100/hr limit.
  - **n8n:** executions used this month vs plan quota (2,500 on Starter) — warns at 80%.
  - **Claude / OpenAI:** month-to-date estimated spend vs the budget cap (the breaker input).
  - All rendered as four usage bars on the admin Dashboard, each with plan name, used/limit, and a projected end-of-month figure based on the current daily rate — so "will we hit a limit this month?" is answered before it happens, and upgrades are planned instead of discovered.
  - Topped by **total SMM spend this month** — subscriptions (Postiz + n8n flat fees) + AI usage (Claude + OpenAI month-to-date) — with cost-per-post beside it, **and the same spend split per niche underneath** (AI usage attributed by posts generated per niche; flat subscription fees split by channel count). One glance says "≈$112 this month, ~8¢ a post — Money $31, Kids $28, Career $26, srini.pro $14…" so each niche's cost line can meet its own revenue line in The One Report.
- Sends the daily/weekly digest: published counts per brand, failures, health summary, top/bottom performers, spend + quota projections.


## Prompts & model selection per use case

Model names change; tiers don't. The rule: **cheap-fast tier** (Haiku-class) for scoring and checking, **quality tier** (Sonnet-class) for anything a customer reads. Check the current model list at docs.claude.com when building and pin exact versions in n8n env vars so upgrades are deliberate.

**Budget discipline — this is social promotion, not a research lab.** The per-post AI spend is exactly **two Claude calls** (one generate — all platform variants in a single call — plus one cheap QA) and, for a minority of posts, one image operation. Nothing else. Scoring is batched (one call for the whole day's feed items), captioning happens once per image ever, and embeddings cost fractions of a cent. At ~1,300 posts/month that's on the order of $20–40 of AI — the model tiers and call counts above are chosen so quality comes from prompt sharpness, not from stacking extra AI passes.

**Prompts are the product — treat them as living assets.** All prompts (P1–P8) are stored as **data in Supabase** (`prompt_templates`: key, text, version, updated_at), not hardcoded in n8n — so refining a prompt is editing a row, no redeploy, effective next run. This is the operator's real ongoing job: watch the output and the weekly digest (QA failure reasons, low-engagement pillars/angles), sharpen the prompt, bump the version. The `run_log` records which prompt version produced each batch, so "did the new prompt improve things?" is answerable from data. Expect the first two weeks of the srini.pro pilot to be mostly prompt refinement — that's the system working as designed, not a problem.

| # | Use case (where) | Model | Why |
|---|---|---|---|
| P1 | Asset enrichment — angles, benefits (Run 1 sync, Launch hook) | **Sonnet-class** | Runs once per asset; angle quality drives months of posts |
| P2 | Promo post generation (Runs 1 & 2) | **Sonnet-class** | Customer-facing selling copy — the core product |
| P3 | Source-inspired post (Run 4) | **Sonnet-class** | Original take on current material, must not parrot the source |
| P4 | Evergreen tip post (Run 4) | **Sonnet-class** | Customer-facing |
| P5 | Freestyle post (Run 4) | **Sonnet-class** | Pure invention needs the strongest creative model |
| P6 | QA critic gate (Runs 1, 2, 4) | **Haiku-class**; **Sonnet-class for YMYL brands** (Money, later Health) | Rubric-checking is cheap-model work; compliance judgment gets the better model |
| P7 | Inspiration relevance scoring (Run 4) | **Haiku-class** | Hundreds of feed items daily; pennies matter |
| P8 | Images (all lanes) | **OpenAI image API** (current gpt-image model) | Freestyle/hero images only — template renders cover the rest |
| P9 | Topic embeddings — cool holder (Runs 1, 2, 4) | **OpenAI text-embedding-3-small** | Fractions of a cent; small model is plenty for similarity |

All generation prompts share two injected blocks stored per brand in Supabase: `{VOICE_PROFILE}` (tone, persona, vocabulary, audience) and `{COMPLIANCE_RULES}` (e.g. Money & Finance: organizational/tracking tools, never financial advice or guaranteed outcomes). All prompts demand **JSON only** so n8n parses reliably.

**P1 — Asset enrichment** (new Sheet row → generative fuel):
```
You are the marketing strategist for {BRAND}, a {NICHE} brand. {VOICE_PROFILE}
New asset: {NAME} — {TYPE}, {PRICE}. Description: {DESCRIPTION}. URL: {URL}.
Generate JSON: {"key_benefits":[5-7 concrete outcomes the buyer gets],
"target_audience":"one precise sentence","pain_points_solved":[3-5],
"promo_angles":[8-10 distinct marketing angles — each an object
{"name":"short label","hook":"the emotional/practical entry point",
"example_opening":"a first line a post could use"}. Angles must be genuinely
different from each other: mix pain-relief, aspiration, curiosity/question,
seasonal/timing, social-proof, myth-busting, and objection-handling types]}
{COMPLIANCE_RULES}. JSON only.
```

**P2 — Promo post** (Runs 1 & 2; one call → all platform variants):
```
You write social posts for {BRAND}. {VOICE_PROFILE}
Product: {NAME}, {PRICE}, {URL}. Benefits: {KEY_BENEFITS}. Audience: {TARGET_AUDIENCE}.
Today's angle (use THIS angle only): {ANGLE_NAME} — {ANGLE_HOOK}.
The image already chosen for this post shows: {IMAGE_CAPTION}. Your copy must be
consistent with what is visible in it — never describe features or pages it doesn't show.
Angles already used recently on this channel (do NOT echo their framing): {RECENT_ANGLES}.
Write one post per platform, native to each:
- facebook: 40-80 words, conversational, ends with soft CTA + link
- instagram: 30-60 word caption, line breaks, 8-12 niche hashtags, "link in bio"
- pinterest: {"title": <=90 chars keyword-rich, "description": 100-200 chars with CTA}
- linkedin: 60-120 words, value-first professional framing, link at end
Sell by being useful, not hype. No fake urgency, no invented testimonials, no
guaranteed outcomes. {COMPLIANCE_RULES}
JSON only: {"facebook":"...","instagram":"...","pinterest":{...},"linkedin":"...",
"image_suggestion":"template|mockup|generate: <one-line concept>"}
```

**P3 — Source-inspired post** (Run 4):
```
You write for {BRAND} ({NICHE}). {VOICE_PROFILE}
Inspiration (for the IDEA only — copying its wording is failure):
title: {ITEM_TITLE}; summary: {ITEM_SUMMARY}.
Write an ORIGINAL post giving {BRAND}'s own take, tip, or question sparked by this
— relevant to {TARGET_AUDIENCE}'s daily life. Do not mention or link the source.
No products, no selling, NO LINKS of any kind — this post only entertains.
Platform variants + JSON format as in P2 (minus link conventions).
```

**P4 — Evergreen tip** (Run 4):
```
You write for {BRAND} ({NICHE}). {VOICE_PROFILE}
Topic for today: {TOPIC} (from pillar: {PILLAR_NAME}).
Write one genuinely useful, specific, immediately-actionable tip post — the kind a
reader saves or shares. Concrete numbers/steps beat generalities. No products, no
selling, NO LINKS. {COMPLIANCE_RULES} Platform variants + JSON format as in P2
(minus link conventions).
```

**P5 — Freestyle** (Run 4 — the no-reference lane):
```
You are the voice of {BRAND} ({NICHE}). {VOICE_PROFILE}
No topic is assigned. Invent ONE fresh post idea that would entertain or delight
{TARGET_AUDIENCE} today: a relatable moment, a surprising observation, a playful
question, a mini-story, gentle humor from inside their world, a shared pain made
lighter ("we've all been there"), or a genuine bit of motivation for their situation.
Recently covered (must be clearly different): {RECENT_TOPICS}.
Rules: original, warm, specific to the niche (not generic motivation-poster fluff),
no products, no selling, NO LINKS, no copied formats. The post's only job is that
the reader feels something — amused, understood, or encouraged. {COMPLIANCE_RULES}
JSON: platform variants as in P2 + {"idea_label":"3-6 word topic label",
"image_concept":"one-line visual idea for this post"}
```

**P6 — QA critic** (independent call — never the model grading its own output in the same conversation):
```
You are a strict content reviewer for {BRAND}. Judge this post package: {POST_JSON}
Score PASS/FAIL on each: (1) brand voice matches: {VOICE_PROFILE_SUMMARY};
(2) factually sane, no invented stats/testimonials/claims;
(3) compliance: {COMPLIANCE_RULES} — for Money & Finance any wording implying
financial advice, returns, or guaranteed outcomes = FAIL;
(4) platform constraints: lengths, hashtag counts, no broken placeholders like {NAME};
(5) would a real {NICHE} follower find this worth their feed?
JSON only: {"verdict":"pass|fail","failures":[{"check":n,"reason":"...",
"suggested_fix":"..."}]}
```

**P7 — Inspiration relevance scoring** (batched, cheap):
```
Brand: {BRAND} ({NICHE}), audience: {TARGET_AUDIENCE}.
Score each item 0-10 for "could spark an engaging original post for this audience
this week" (timely +, evergreen-adaptable +, off-niche -, politics/tragedy/medical/
legal advice = 0). Items: {ITEMS_JSON}
JSON only: [{"id":"...","score":n,"post_seed":"one-line idea if score>=6"}]
```

**P8 — Image generation** (OpenAI, only when P2/P5 returns `generate:`). Structured like the copy prompts — subject, composition, style, constraints — with the style block written **once per brand** and stored alongside the voice profile, so every generated image is on-brand by default and refining a brand's image look is one row edit:
```
Subject: {IMAGE_CONCEPT — the one-line concept from P2/P5, e.g. "a small potted
plant growing out of a piggy bank, morning light"}.
Composition: single clear subject, centered or rule-of-thirds, generous negative
space for feed legibility, uncluttered background.
Style ({BRAND} style block, stored per brand): {BRAND_STYLE — e.g. "warm flat
illustration, soft shadows, palette {BRAND_COLORS}, friendly and calm, editorial
quality"}.
Constraints: absolutely no words, letters, or numbers anywhere in the image;
no logos or watermarks; no human faces or real-person likeness; nothing distorted,
uncanny, or busy. One idea per image.
```
(Square 1080×1080 for FB/IG/LinkedIn; 1000×1500 vertical for Pinterest. Text belongs on the branded template overlay, not in generated pixels — AI-generated text renders badly and can't be brand-controlled.)

## Images — where they live, how they stay fresh, how we trust them

**Where they live:** one Google Drive folder per brand, one subfolder per asset (e.g. `GM Images/grandfield-money/budget-planner/`) holding 3–10 images (mockups, lifestyle shots, crops). The Sheet row carries the **folder link** (not a single image). No platform ever sees a Drive link: n8n downloads the file and uploads the binary to Postiz `/upload`; Postiz attaches it natively per platform (LinkedIn included) and handles per-platform specs. Custom Posts tab: a direct link to one image (or folder) works the same way.

**Three image tiers, safest first — and the risky tier is the smallest:**

1. **Branded template render** (most posts — tips, quotes, questions): HTML→PNG with brand colors/fonts. Deterministic, zero AI risk — and *always fresh anyway*, because the text on the card changes with every post across several rotating background/layout variants per brand. Two sizes: 1080×1080 (FB/IG/LinkedIn) and 1000×1500 vertical (Pinterest).
2. **Asset image pool** (promo posts): rotate through the asset's Drive folder exactly like angles rotate — a different image than last time on that channel; optionally re-composited onto a template background with the angle headline, so even a repeated mockup reads as a new creative. Never "the featured image from the URL, forever" — that sameness is what kills feeds.

   **Matching library images to AI copy — image first, copy second.** The mismatch risk runs both ways: not just "AI generated a wrong image," but "AI wrote copy that doesn't match our library image" (copy talks about the couples-budget angle, mockup shows the savings tracker page). Solved in three parts:
   - **Auto-captioning at sync:** when an asset's image folder first syncs (and whenever new files appear), a one-time vision call describes each image ("flat-lay mockup of the monthly overview page, coral cover visible, no people") — stored in `assets.media`. The machine now *knows* what every image in the pool shows.
   - **Image-first planning:** the planner picks the image from the pool *before* copy is written, and P2 receives the chosen image's caption: *"the attached image shows: {IMAGE_CAPTION} — write copy consistent with what is visible."* Copy matches image by construction, not by luck. Angle selection also prefers angles compatible with the chosen image (captions and angles are matched by the planner).
   - **Vision QA, spent where it matters:** the match is already guaranteed by construction (caption → copy), so the vision recheck runs only where real risk lives — **always on AI-generated images**, and on a library pairing only the *first time* a given image is used. Repeat pairings of known-good images skip it. Maximum trust, minimum calls.
3. **AI-generated** (freestyle/hero only, ~20–30% of posts): trusted only because it's constrained and checked — see below.

**Trusting automated image generation — the machine looks before it posts:**
- **Constrained generation (P8):** no text in the image, no faces/likeness, brand palette and style locked. Garbled text and uncanny faces are the two big AI-image failure modes; both are banned outright. Any text belongs on the template overlay, where it's brand-controlled.
- **Vision QA gate:** every generated image goes to a cheap multimodal Claude call *together with the post copy*: "Does the image match this post's content? On-brand style? Any text artifacts, extra limbs, weird or off-putting elements?" JSON verdict. Fail → one regeneration → fail again → **fall back to the branded template**. No generated image is ever published unseen.
- **Post-copy match is explicit:** the vision check receives the actual post text, so "image doesn't match content" is a named failure, not luck.
- The vision verdicts land in `post_log`, so the admin Calendar shows which image tier every post used and any image that fell back — pattern visibility if a brand's image generation keeps failing.

**Cost note:** tiers 1–2 are free per post. Tier 3 costs one OpenAI generation + a sub-cent vision check on ~a quarter of posts — inside the existing budget envelope and metered by the same budget breaker.

## PostHog's role — the after-click half of measurement

PostHog (already on every niche site for the commerce funnel) is the only component that sees what happens **after** a social click. Platform metrics stop at likes/impressions; PostHog picks up at the UTM-tagged landing and follows through to purchase: visit → sales page → checkout → thank-you. Because every promo link carries `utm_source` (platform), `utm_campaign` (asset), `utm_content` (angle), it answers the questions engagement data can't: which *platform* sends buyers (not just clickers), which *angle* converts (prompt-refinement gold), and real **revenue per post/lane** to sit beside the cost-per-post indicator.

**Closed loop:** Run 5 pulls per-campaign visit/conversion counts from the PostHog API daily into `metrics`, so `priority_score` is fed by actual sales attribution — the machine promotes more of what *converts*, not just what gets liked. Zero extra site work: it's the same PostHog install, just consistent UTMs (which the scheduler appends automatically) plus one daily API pull.

Boundaries: the Entertainer lane is invisible to PostHog by design (no links — its value shows as follower growth and better promo reach), and on-platform metrics (impressions/likes) still come from Postiz/platform analytics. Together they're the full picture: Postiz = on-platform, PostHog = on-site.

## Content strategy notes

- **One generation, many platforms:** each topic is written once by Claude with per-platform variants in a single call — cheapest and keeps messaging coherent.
- **Evergreen recycling:** high-performing `content_items` become `recycle_eligible` and can re-enter the planner after 60–90 days with a fresh rewrite — the library compounds, generation cost per post falls over time.
- **YouTube Shorts is the exception to full cadence.** Text+image automation scales to 3/day easily; video does not. Start Shorts at low cadence using Postiz's included AI videos (30/mo on Pro, 60/mo on Ultimate) or template-driven video (e.g. Remotion) later. Don't let video block the text/image rollout.
- **Pre-launch value:** social can start *before* the niche sites launch — warming FB/IG audiences directly lowers future ad costs and seeds Pixel data. Social automation doesn't need to wait for the site build.

## Cost estimate (monthly)

| Item | Phase 1 (~14 channels) | Full build-out (~40+ channels) |
|---|---|---|
| Postiz Cloud | Pro $49 | Ultimate $99 |
| n8n Cloud | Starter €20 (~$22) | Starter/Pro €20–50 |
| Claude API (copy + QA, ~1,300–4,500 posts/mo) | ~$10–30 | ~$30–90 |
| OpenAI API (images for non-template posts) | ~$10–40 | ~$30–100 |
| **Total** | **~$90–140/mo** | **~$180–340/mo** |

## Build order

1. Supabase `social` schema (all tables above) + seed the Phase 1 brands (Kids, Money, Career, srini.pro) with voice profiles, compliance rules, pillars, and idea_sources rows.
2. Create the **Assets Google Sheet** in Google Drive (columns above), connect Google Sheets to n8n, and add the first rows (srini.pro itself, the sites, the first Money product when named).
3. Create the social accounts that don't exist yet; connect all Phase 1 accounts in Postiz (Pro plan); record `postiz_integration_id`s in `channels`.
4. **Run 1 (Assets Lane) + Run 4 (AI Entertainer)** end to end — switches → sync/ideas → plan → generate → QA → schedule → ledger — **manual-trigger test on srini.pro only** (lowest-risk pilot brand), then cron them and let srini.pro run fully automatic for ~1 week; inspect output quality.
5. Admin panel Social section — Dashboard, Controls (switches + budget meter), Calendar, Post Log, Asset Coverage first (Idea Sources Health and Performance can follow) — so the OFF switch and monitoring exist BEFORE the niche brands go live.
6. Roll on the three Phase 1 niche brands.
7. **Run 2 (Promotions Lane)** + **Run 3 (Custom Lane** — the simplest workflow, two nodes**)**; **Run 5 (Health & Ledger)** with priority-score updates + digest; **Launch hook** wired to the commerce schema — ready before the first product ships.
8. Expand brands/platforms per the niche rollout phases; upgrade Postiz to Ultimate when channel count passes 30.

## Risks & watch items

- **Full-auto + YMYL:** Money (and later Health) copy publishing unreviewed is the highest-risk surface — the compliance_rules + QA gate must be strict from day one. If anything slips, the per-brand switch turns that website's channels off instantly while it's fixed.
- **Platform trust:** brand-new FB/IG/Pinterest accounts jumping straight to 3 automated posts/day can look spammy to platform algorithms. Consider a 1/day warm-up week per new account (planner supports per-channel cadence).
- **Meta account health:** the same Meta Business assets run your ads later — social automation bans would hurt the ad side. Postiz uses official APIs (fine), but content quality is the real protection.
- **Duplicate content across brands:** 10 niches sharing one generator can converge on samey posts. Dedup embeddings are within-brand; add a cross-brand spot-check to the weekly digest.
- **n8n execution creep:** keep brands batched inside workflows (not one execution per brand) to stay on Starter.

## Open items

- Exact posting slot times per platform/timezone (start with sensible defaults, tune from metrics after 2–4 weeks).
- Confirm/expand the per-niche idea-source list (feeds above are starting recommendations — verify each RSS URL is live when building Run 4).
- Set the monthly API budget cap number (the breaker needs a value — e.g. $150/mo to start).
- AI freestyle share (starting at ~20–30% of value slots — tune by feel and engagement).
- Promo cooldown tuning (4-day floor is a starting default; adjust from engagement data).
- Admin Social section placement in `apps/admin` nav + whether Performance page waits for the metrics table to accrue data.
- Which brands get YouTube channels first, and video pipeline choice (Postiz AI videos vs Remotion templates vs external tool).
- srini.pro platform set confirmation (assumed LinkedIn + Instagram + YouTube; X optional).
- Template card design per brand (needs each brand's logo/colors — Grandfield Money's exist already).
- Whether X/Threads get added as cheap incremental channels (text-only, near-zero extra generation cost).
