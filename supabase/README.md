# Supabase — shared database (commerce + Aviary social)

Two schemas live in one Supabase project:

- **`public`** — the commerce data (`products`, `orders`) shared by all 10 niche
  sites. Every row carries `site_id`. See `migrations/0001_init.sql`.
- **`social`** — the **Aviary** social-automation system (brands, channels,
  content_items, post_log, metrics, run_log, health_status, …). Fully isolated
  from `public`. See `migrations/0002_social.sql`.

Migrations live here (not per-site) because the database is shared.

## Projects (dev + prod)

| | Project | Ref | Notes |
|---|---|---|---|
| **PROD** | (live) | `ghgqttlmndqijngeyyqy` (ca-central-1) | Real orders; wired to all live sites + `admin.grandfieldmedia.com`. Both `public` and `social` schemas applied here. |
| **DEV** | `grandfield-media-dev` | `zzrnbtjehkshcpjzulvu` (ap-south-1) | Free-tier workshop. Build/break here, then re-run the same SQL against prod. Never copy `public.orders` (customer PII) into dev. |

## Apply a migration / seed

The service/secret key can only do CRUD, not DDL, so schema changes are applied
via the Dashboard:

1. Supabase Dashboard → **the right project** (dev first, then prod) → **SQL Editor**
2. Paste the file contents (for the social schema use **"Run without RLS"**)
3. **Run**

Files:
- `migrations/0001_init.sql` — commerce (`products`, `orders`, Storage bucket)
- `migrations/0002_social.sql` — the `social` schema (16 tables)
- `seeds/srini-pro.sql` — the pilot brand (srini.pro)
- `seeds/prompts.sql` — P1–P9 prompt templates
- `seeds/run4-config.sql` — the config-driven Run-4 backend (voice/niche/channel + shared prompts)

## Exposing the `social` schema to the API

For the admin panel (and any supabase-js client) to read `social.*`, the schema
must be added under **Settings → Data API → Exposed schemas** (do this in **both**
dev and prod). `public` is exposed by default; `social` is not.

## Storage

- Private bucket `product-files` (commerce PDFs, signed-URL access only).
