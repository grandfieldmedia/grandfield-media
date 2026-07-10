import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  site: 'https://srini.pro',
  output: 'static',
  vite: {
    ssr: {
      external: ['svgo']
    }
  }
});
