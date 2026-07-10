import type { APIRoute } from 'astro';

const SITE = 'https://srini.pro';

// Auto-discover every page (.astro / .html) under src/pages.
const pageModules = import.meta.glob('./**/*.{astro,html}');

function toRoute(filePath: string): string {
  let p = filePath.replace(/^\.\//, '').replace(/\.(astro|html)$/, '');
  if (p === 'index' || p.endsWith('/index')) {
    p = p.slice(0, -'index'.length);
  }
  p = p.replace(/\/$/, '');
  return '/' + p;
}

export const GET: APIRoute = () => {
  const routes = Array.from(
    new Set(Object.keys(pageModules).map(toRoute))
  ).sort();

  const urls = routes
    .map((r) => {
      const loc = new URL(r, SITE).href;
      const priority = r === '/' ? '1.0' : '0.8';
      return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
