import { defineConfig } from 'astro/config';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import mdx from '@astrojs/mdx';

// Grandfield Money — commerce niche site (Astro 7 + Tailwind 4 + Vercel adapter).
export default defineConfig({
  site: 'https://grandfieldmoney.com',
  output: 'server',
  adapter: vercel(),
  integrations: [sitemap(), icon(), mdx()],
  vite: {
    plugins: [tailwindcss()],
    // Keep Vite's cache outside the Dropbox-synced tree (avoids EBUSY on Windows).
    cacheDir: join(tmpdir(), 'vite-money-finance'),
  },
});
