import type { SiteConfig } from '@grandfield/shared-ui/types';

// Grandfield Family — single source of site-specific config. Nothing here lives in shared-ui.
export const siteConfig: SiteConfig = {
  id: 'relationships-family',
  brand: 'Grandfield Family',
  domain: 'grandfieldfamily.com',
  url: 'https://grandfieldfamily.com',
  tagline: 'Family planning and communication templates for closer connection.',
  description:
    'Grandfield Family makes practical family organizers, communication guides, chore and routine charts, and connection activities that help busy families stay organized and close.',
  contactEmail: 'hello@grandfieldfamily.com',
  logo: '/logo.png',

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
        { text: 'Family Organizers', href: '/products' },
        { text: 'Routine Charts', href: '/products' },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: '/about' },
        { text: 'Blog', href: '/blog' },
        { text: 'Contact', href: 'mailto:hello@grandfieldfamily.com' },
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
