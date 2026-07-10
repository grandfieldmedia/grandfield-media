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

// Grandfield Media — shared admin panel for all 10 niche sites.
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
    cacheDir: join(tmpdir(), 'vite-gf-admin'),
  },
});
