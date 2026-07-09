import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  site: 'https://grandfieldmedia.com',
  output: 'static',
  vite: {
    ssr: {
      external: ['svgo']
    }
  }
});
