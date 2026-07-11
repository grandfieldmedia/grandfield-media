import type { SiteConfig } from '@grandfield/shared-ui/types';

/**
 * Grandfield Kids — the single source of site-specific config.
 * Spinning up another niche site = copy this file + change the values.
 * Nothing here lives inside shared-ui.
 */
export const siteConfig: SiteConfig = {
  id: 'kids-education',
  brand: 'Grandfield Kids',
  domain: 'grandfieldkids.com',
  url: 'https://grandfieldkids.com',
  tagline: 'Printable activities, coloring pages & workbooks kids actually enjoy.',
  description:
    'Grandfield Kids makes fun, ready-to-print activity sheets, coloring pages, and educational workbooks for ages 3–10 — screen-free learning that keeps kids engaged.',
  contactEmail: 'hello@grandfieldkids.com',
  logo: '/logo.png',

  nav: [
    { text: 'Home', href: '/' },
    { text: 'Products', href: '/products' },
    { text: 'Blog', href: '/blog' },
    { text: 'About', href: '/about' },
  ],

  footerColumns: [
    {
      title: 'Printables',
      links: [
        { text: 'All Products', href: '/products' },
        { text: 'Activity Packs', href: '/products' },
        { text: 'Coloring Pages', href: '/products' },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: '/about' },
        { text: 'Blog', href: '/blog' },
        { text: 'Contact', href: 'mailto:hello@grandfieldkids.com' },
      ],
    },
  ],

  legalLinks: [
    { text: 'Privacy', href: '/legal/privacy' },
    { text: 'Terms', href: '/legal/terms' },
    { text: 'Refund Policy', href: '/legal/refund-policy' },
  ],

  social: [
    { label: 'Instagram', href: '#', icon: 'instagram' },
    { label: 'Facebook', href: '#', icon: 'facebook' },
    { label: 'RSS', href: '/rss.xml', icon: 'rss' },
  ],

  analytics: {
    posthogKey: import.meta.env.PUBLIC_POSTHOG_KEY,
    posthogHost: import.meta.env.PUBLIC_POSTHOG_HOST,
    metaPixelId: import.meta.env.PUBLIC_META_PIXEL_ID,
  },
};
