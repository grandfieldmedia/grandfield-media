import type { SiteConfig } from '@grandfield/shared-ui/types';

// Grandfield Wellness — single source of site-specific config. Nothing here lives in shared-ui.
export const siteConfig: SiteConfig = {
  id: 'health-wellness',
  brand: 'Grandfield Wellness',
  domain: 'grandfieldwellness.com',
  url: 'https://grandfieldwellness.com',
  tagline: 'Wellness journals and fitness planners for healthier habits.',
  description:
    'Grandfield Wellness makes simple, ready-to-use fitness planners, wellness journals, and habit trackers to help you build healthier routines — practical tools for everyday wellbeing, not medical advice.',
  contactEmail: 'hello@grandfieldwellness.com',
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
        { text: 'Fitness Planners', href: '/products' },
        { text: 'Wellness Journals', href: '/products' },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: '/about' },
        { text: 'Blog', href: '/blog' },
        { text: 'Contact', href: 'mailto:hello@grandfieldwellness.com' },
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
