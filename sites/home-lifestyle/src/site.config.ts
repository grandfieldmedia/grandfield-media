import type { SiteConfig } from '@grandfield/shared-ui/types';

// Grandfield Life — single source of site-specific config. Nothing here lives in shared-ui.
export const siteConfig: SiteConfig = {
  id: 'home-lifestyle',
  brand: 'Grandfield Life',
  domain: 'grandfieldlife.com',
  url: 'https://grandfieldlife.com',
  tagline: 'Home organization and lifestyle templates for a calmer everyday.',
  description:
    'Grandfield Life makes simple, ready-to-use home planners, meal-planning templates, cleaning schedules, and organization systems that help you run a calmer, more organized home.',
  contactEmail: 'hello@grandfieldlife.com',
  logo: '/logo.png',

  nav: [
    { text: 'Home', href: '/' },
    { text: 'Products', href: '/products' },
    { text: 'Blog', href: '/blog' },
    { text: 'About', href: '/about' },
  ],

  footerColumns: [
    {
      title: 'Planners',
      links: [
        { text: 'All Products', href: '/products' },
        { text: 'Home Planners', href: '/products' },
        { text: 'Meal Planning', href: '/products' },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: '/about' },
        { text: 'Blog', href: '/blog' },
        { text: 'Contact', href: 'mailto:hello@grandfieldlife.com' },
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
    { label: 'RSS', href: '/rss.xml', icon: 'rss' }
  ],

  analytics: {
    posthogKey: import.meta.env.PUBLIC_POSTHOG_KEY,
    posthogHost: import.meta.env.PUBLIC_POSTHOG_HOST,
    metaPixelId: import.meta.env.PUBLIC_META_PIXEL_ID,
  },
};
