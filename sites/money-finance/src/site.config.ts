import type { SiteConfig } from '@grandfield/shared-ui/types';

/**
 * Grandfield Money — the single source of site-specific config.
 * Spinning up another niche site = copy this file + change the values.
 * Nothing here lives inside shared-ui.
 */
export const siteConfig: SiteConfig = {
  id: 'money-finance',
  brand: 'Grandfield Money',
  domain: 'grandfieldmoney.com',
  url: 'https://grandfieldmoney.com',
  tagline: 'Practical budgeting & money templates that actually get used.',
  description:
    'Grandfield Money makes simple, ready-to-use budgeting and planning templates, trackers, and money-education guides — no jargon, no financial advice, just tools that help you take control of your money.',
  contactEmail: 'hello@grandfieldmoney.com',
  logo: '/logo.png',

  nav: [
    { text: 'Home', href: '/' },
    { text: 'Products', href: '/products' },
    { text: 'Blog', href: '/blog' },
    { text: 'About', href: '/about' },
  ],

  footerColumns: [
    {
      title: 'Products',
      links: [
        { text: 'All Products', href: '/products' },
        { text: 'Budgeting Templates', href: '/products' },
        { text: 'Trackers', href: '/products' },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: '/about' },
        { text: 'Blog', href: '/blog' },
        { text: 'Contact', href: 'mailto:hello@grandfieldmoney.com' },
      ],
    },
  ],

  legalLinks: [
    { text: 'Privacy', href: '/legal/privacy' },
    { text: 'Terms', href: '/legal/terms' },
    { text: 'Refund Policy', href: '/legal/refund-policy' },
  ],

  social: [
    { label: 'Facebook', href: '#', icon: 'facebook' },
    { label: 'Instagram', href: '#', icon: 'instagram' },
    { label: 'RSS', href: '/rss.xml', icon: 'rss' },
  ],

  analytics: {
    posthogKey: import.meta.env.PUBLIC_POSTHOG_KEY,
    posthogHost: import.meta.env.PUBLIC_POSTHOG_HOST,
    metaPixelId: import.meta.env.PUBLIC_META_PIXEL_ID,
  },
};
