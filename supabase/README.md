# Supabase — shared commerce database

**One** Supabase project backs all 10 niche sites. Every row carries `site_id`.
Migrations live here (not per-site) because the database is shared.

## Apply a migration

The service/secret key can only do CRUD, not DDL, so schema changes are applied
one of two ways:

**Option A — Dashboard (no extra creds needed):**
1. Supabase Dashboard → your project → **SQL Editor**
2. Paste the contents of `migrations/0001_init.sql`
3. **Run**

**Option B — Supabase CLI (later, for repeatability):**
```bash
supabase link --project-ref ghgqttlmndqijngeyyqy
supabase db push
```

## Current project

- **Dev project ref:** `ghgqttlmndqijngeyyqy`
- Tables: `products`, `orders` — see `migrations/0001_init.sql`
- Private Storage bucket: `product-files` (PDFs, signed-URL access only)
