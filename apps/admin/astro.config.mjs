import { defineConfig } from 'astro/config';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// Load the monorepo-root .env.local into process.env for local dev.
// (In production, Vercel injects these env vars at runtime.)
loadEnv({ path: fileURLToPath(new URL('../../.env.local', import.meta.url)) });

// Per-app override for local dev: apps/admin/.env.local wins if present
// (e.g. to point the admin at the DEV database). Gitignored, so it's absent in
// production — a no-op on Vercel, where env vars are injected at runtime.
loadEnv({ path: fileURLToPath(new URL('./.env.local', import.meta.url)), override: true });

// Grandfield Media — shared admin panel for all 10 niche sites.
export default defineConfig({
  output: 'server',
  // Bundle pdfkit's built-in font metrics (.afm) into the serverless function —
  // pdfkit reads Helvetica.afm at construction, so it must ship or PDF gen 500s.
  adapter: vercel({ includeFiles: ['node_modules/pdfkit/js/data/*.afm'] }),
  vite: {
    plugins: [tailwindcss()],
    cacheDir: join(tmpdir(), 'vite-gf-admin'),
  },
});
