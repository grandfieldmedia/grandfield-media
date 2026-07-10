# Grandfield Media — Tech Stack & Reuse Architecture

**Decided:** 2026-07-10
**Status:** Full planning complete. Nothing built yet — awaiting explicit go-ahead. This doc has everything needed to start.

## Guiding principle
Always design for reuse across all 10 niche sites, not just the one being built. Prefer shared, prop/config-driven components over copy-paste-and-edit. A theme or boilerplate is only adopted if it's actually verified (by reading its code) to separate content from structure — not assumed from marketing pages.

## Scope of this architecture
Applies to the 10 commerce niche sites only (money-finance, career-professional, learning-education, home-lifestyle, technology-tools, relationships-family, health-wellness, events-celebrations, kids-education, business-entrepreneurship). **Grandfieldmedia.com (main company site) and srini-pro are explicitly excluded** — not part of this data model, not connected to the shared Supabase project or the admin panel.

## Money & Finance — brand specifics (first site to build)
- **Brand name:** Grandfield Money (not just "Money & Finance")
- **Domain:** grandfieldmoney.com (purchased)
- **Logo/favicon:** provided — dark wordmark "Grandfield Money" with a gold circular accent forming part of the "o," paired with a 3x3 rounded-square grid icon (cream/gold on dark navy) used as both the logo mark and the favicon/app icon.
- **First product:** a budgeting/planning PDF template (~$29, exact name/price TBD when content is written).

## Final stack (per niche site)
- **Framework:** Astro only (server output, `@astrojs/vercel` adapter) — no Next.js. Astro's own API endpoints handle checkout session creation, the Stripe webhook, and download-token verification.
- **Frontend base:** AstroWind (github.com/onwidget/astrowind) — free, MIT licensed, verified via direct code inspection to be genuinely prop-driven (its own demo reuses the same Hero/Features/Pricing/Testimonials/FAQ/CallToAction widgets across 4 different site types with different content).
- **Database/Storage:** Supabase — **one shared Supabase project across all 10 niche sites** (not one per niche). Every row in `products` and `orders` carries a `site_id`. Chosen specifically to support one unified admin panel without querying 10 separate databases; also sidesteps Supabase's free-tier cap of 2 active projects.
- **Payments:** Stripe (one-time checkout, not subscription).
- **Email:** Resend — transactional only: order confirmation + download link, and the same email re-sent via a self-serve "resend my download link" page. No newsletter/marketing sequences now (possible later via Resend's broadcast feature, but needs an explicit opt-in checkbox added at checkout at that time).
- **Analytics/Tracking:** PostHog (funnel visibility) + Meta Pixel/Conversions API (Facebook ad optimization — PostHog does not substitute for this). Google Analytics and Typekit/Adobe Fonts explicitly dropped.
- **SEO:** Google Search Console (submit sitemap, monitor indexing/rankings). AstroWind provides sitemap generation and Open Graph tags; add per-page meta descriptions, canonical URLs, and schema.org structured data for product pages.
- **Hosting:** Vercel Pro (Hobby plan explicitly forbids commercial use per Vercel's own ToS — confirm this applies to the 2 existing live sites too).
- **Code:** GitHub monorepo (grandfieldmedia/grandfield-media), pnpm workspaces.
- **Open/unresolved:** cookie consent mechanism (PostHog + Meta Pixel both set tracking cookies — relevant if ad traffic can reach GDPR regions).

## Complete feature list (Money & Finance, replicated per niche later)
**Public site:**
- Homepage = brand hub, not a product pitch: broad niche value prop, a product catalog grid, blog highlights, aggregated testimonials.
- One dedicated sales page per PDF, built from a shared `ProductSalesLayout` (hero, benefits, testimonials, FAQ, price/buy). Uses the **same site-wide navigation and footer** as every other page — not a stripped nav-less landing page (deliberate trade-off: consistency/trust over CRO-style distraction removal). Tracking (PostHog + Meta Pixel) built into the template itself.
- Blog (categories, tags, RSS) for SEO/organic traffic, with an embeddable `ProductPromo` widget droppable into any post to funnel readers to a specific product's sales page.
- Legal pages: privacy, terms, refund policy.
- Thank-you page after Stripe checkout completes.
- Self-serve "resend my download link" page — only recovery path since there's no customer account/dashboard.
- No customer login anywhere. Flow: Stripe checkout → webhook creates order → Resend sends download email → customer clicks link → token verified → PDF downloaded. Transaction ends there.

**Admin (one shared app for all 10 niches, not per-site):**
- Login gated by email whitelist via Supabase Auth. Only login in the entire system.
- Reports/Dashboard: total orders, revenue, refund rate — filterable by date range and by niche (all 10 or drill into one). Breakdown by niche and by product. Refund stats. Recent-activity feed (orders/refunds/downloads across all niches).
- Orders list + order detail (email, product, amount, status, timestamps).
- Refund button (Stripe API + updates order) and resend-download-email button, per order.

## Folder structure
```
grandfield-media/
├── packages/
│   ├── shared-ui/              → AstroWind-derived widgets (Hero, Features, Pricing,
│   │                              Testimonials, FAQs, CallToAction, ProductCard,
│   │                              ProductPromo, BlogHighlights), theme via Tailwind
│   │                              config not hardcoded styles; layouts (PageLayout,
│   │                              ProductSalesLayout, AdminLayout)
│   └── shared-backend/          → stripe.ts, supabase.ts, resend.ts, tokens.ts,
│                                   admin-auth.ts — used by niche sites AND apps/admin
│
├── apps/
│   └── admin/                   → the one shared admin panel (see above)
│
├── sites/
│   └── money-finance/            (brand: Grandfield Money, domain: grandfieldmoney.com)
│       └── src/
│           ├── pages/
│           │   ├── index.astro                 → brand hub/catalog
│           │   ├── products/[slug].astro       → per-PDF sales page
│           │   ├── blog/                        → posts, categories, tags, RSS
│           │   ├── thank-you.astro
│           │   ├── resend-link.astro
│           │   ├── legal/{privacy,terms,refund-policy}.astro
│           │   └── api/
│           │       ├── checkout.ts
│           │       ├── webhooks/stripe.ts       (verify signature + idempotency check)
│           │       ├── download/[token].ts
│           │       └── resend-link.ts
│           ├── content/{products,posts}/
│           └── middleware.ts
│
├── pnpm-workspace.yaml
└── package.json
```
Every future niche site follows the identical shape under `sites/`, importing the same shared packages, with its own content/theme. No `/admin` inside individual niche sites — it's all in `apps/admin`.

## Database schema (Supabase, one shared project)
- **products**: id, site_id, name, slug, description, price (cents), storage_path, created_at
- **orders**: id, site_id, email, product_id, stripe_session_id, amount, status (pending/completed/refunded/failed), download_token, downloaded (bool), downloaded_at, refund_status, refund_reason, refund_notes, created_at, expires_at
- Private Storage bucket for PDFs, accessed via signed URLs.
- Admin whitelist: env var or table of approved emails for `apps/admin` login.

## Environment variables needed
Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PUBLIC_STRIPE_PUBLIC_KEY`.
Supabase: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
Resend: `RESEND_API_KEY`.
PostHog: `PUBLIC_POSTHOG_KEY`.
Meta: Pixel ID + Conversions API access token.
Admin: `ADMIN_EMAILS` whitelist.
Separate dev/prod values for all of the above.

## Build order (when given the go-ahead)
1. `packages/shared-backend` — Stripe/Supabase/Resend/token helpers.
2. Supabase schema — products, orders tables, Storage bucket, RLS.
3. Core API routes — checkout, webhook (with signature verification + idempotency), download-token verification.
4. `packages/shared-ui` — widgets pulled from AstroWind, refactored to theme via config.
5. `apps/admin` — login, dashboard/reports, orders, refund + resend-email actions.
6. `sites/money-finance` frontend — homepage, first product's sales page, blog, legal pages, thank-you page, resend-link page.
7. Tracking — PostHog events, Meta Pixel + Conversions API.
8. Legal page content, Resend domain verification, Search Console setup.
9. Test end-to-end in Stripe test mode, then deploy.

## Reuse mechanism (why this scales to 10 sites without diverging)
Fixing or extending something happens once in `packages/shared-ui` or `packages/shared-backend`; each site (and `apps/admin`) picks up the change on its own next deploy — not all simultaneously, since each niche site is still its own independent Vercel deployment even though the code is shared. This avoids both the "copy-paste and slowly diverge" problem (seen in themes with hardcoded copy) and the "one shared runtime, one bug takes down all 10" problem.

## Future scaling (courses, SaaS tools)
- **Courses:** natural extension of the same stack. Sales flow unchanged (AstroWind page, Stripe checkout, Supabase order); add real customer accounts via Supabase Auth, plus courses/lessons/enrollments/progress tables. Video hosting (Mux, Cloudflare Stream, etc.) is a new infra decision to make when a real course product is built — Supabase Storage isn't built for video streaming.
- **SaaS tools** (e.g. a subscription utility with real per-user app data): treat as its own project, not folded into a niche site's codebase. Underlying services (Supabase Auth/Postgres, Stripe subscriptions, Resend, PostHog) carry over. Framework choice decided deliberately when that project is real, with the same code-level verification rigor used today — not assumed in advance.

## Rejected / discarded after evaluation (do not re-litigate without new evidence)
- **ShipFast (Marc-Lou-Org/ship-fast-ts):** MongoDB + Mongoose + NextAuth core, incompatible with the Supabase standard. Not used for any niche site or admin app — final, regardless of refund outcome. Refund requested; if approved, take it. If not, keep the license in reserve *only* for a possible future one-off subscription SaaS tool where its design intent actually fits — an isolated exception, never a niche-site default.
- **Alfred (Lexington-Themes/alfred):** Paid Astro SaaS theme. Marketing copy hardcoded in component files, not props/content-collection driven, in the sections that matter. Foundation was fine but AstroWind provides an equivalent for free, verified better-architected. Refund requested.
- **dzlau/stripe-supabase-saas-template:** No products/orders schema (single user+plan model), fits subscriptions not one-time purchases.
- **KolbySisk/next-supabase-stripe-starter:** Better code quality (proper webhook signature verification) but requires login before checkout; one-time-payment webhook branch is a no-op stub. Good reference for the webhook pattern, not adoptable as a base.
- **Lexington Sanity CMS variant:** Opt-in, documented scope doesn't guarantee covering hero/feature/CTA sections, adds a whole CMS as new infra for uncertain benefit.

## Still open / pending action items
- Create `develop` branch + connect Vercel project (root dir `sites/money-finance`, `main` → production, `develop` → preview) — instructions given, waiting on user to run them or ask for browser-driven setup.
- Build our own webhook idempotency handling (no reference implementation found did this correctly).
- Decide on cookie consent mechanism.
- Verify Resend sending domain (SPF/DKIM).
- Confirm Vercel plan on the 2 existing live sites (Hobby forbids commercial use).
- Set up Google Search Console once the site is live.
- Add uploaded logo/favicon assets to the codebase once building starts.
- ShipFast refund: pending response. Alfred refund: pending response.
- Confirm first product name/price/content before building its sales page.