import { defineConfig } from 'astro/config';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import mdx from '@astrojs/mdx';

// Load the monorepo-root .env.local into process.env for local dev (server API
// routes read Supabase/Stripe/Resend keys). In production Vercel injects them.
loadEnv({ path: fileURLToPath(new URL('../../.env.local', import.meta.url)) });

// Grandfield Wellness — commerce niche site (Astro 7 + Tailwind 4 + Vercel adapter).
export default defineConfig({
  site: 'https://grandfieldwellness.com',
  output: 'server',
  adapter: vercel(),
  integrations: [sitemap(), icon(), mdx()],
  vite: {
    plugins: [tailwindcss()],
    // Keep Vite's cache outside the Dropbox-synced tree (avoids EBUSY on Windows).
    cacheDir: join(tmpdir(), 'vite-health-wellness'),
  },
});
