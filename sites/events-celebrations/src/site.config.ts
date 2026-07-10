import type { SiteConfig } from '@grandfield/shared-ui/types';

// Grandfield Events — single source of site-specific config. Nothing here lives in shared-ui.
export const siteConfig: SiteConfig = {
  id: 'events-celebrations',
  brand: 'Grandfield Events',
  domain: 'grandfieldevents.com',
  url: 'https://grandfieldevents.com',
  tagline: 'Party and event planning templates for stress-free celebrations.',
  description:
    'Grandfield Events makes ready-to-use party planning checklists, budgets, timelines, and invitation templates — everything you need to plan birthdays, weddings, and celebrations without the stress.',
  contactEmail: 'hello@grandfieldevents.com',

  nav: [
    { text: 'Home', href: '/' },
    { text: 'Products', href: '/products' },
    { text: 'Blog', href: '/blog' },
    { text: 'About', href: '/about' },
  ],

  footerColumns: [
    {
      title: 'Templates',
      links: [
        { text: 'All Products', href: '/products' },
        { text: 'Party Planning', href: '/products' },
        { text: 'Checklists', href: '/products' },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: '/about' },
        { text: 'Blog', href: '/blog' },
        { text: 'Contact', href: 'mailto:hello@grandfieldevents.com' },
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
