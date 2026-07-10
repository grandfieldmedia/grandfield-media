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

// Load the monorepo-root .env.local into process.env for local dev.
loadEnv({ path: fileURLToPath(new URL('../../.env.local', import.meta.url)) });

// Grandfield Careers — commerce niche site (Astro 7 + Tailwind 4 + Vercel adapter).
export default defineConfig({
  site: 'https://grandfieldcareers.com',
  output: 'server',
  adapter: vercel(),
  integrations: [sitemap(), icon(), mdx()],
  vite: {
    plugins: [tailwindcss()],
    cacheDir: join(tmpdir(), 'vite-career-professional'),
  },
});
