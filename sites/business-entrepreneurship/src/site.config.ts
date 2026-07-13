import type { SiteConfig } from '@grandfield/shared-ui/types';

// Grandfield Business — single source of site-specific config. Nothing here lives in shared-ui.
export const siteConfig: SiteConfig = {
  id: 'business-entrepreneurship',
  brand: 'Grandfield Business',
  domain: 'grandfieldbusiness.com',
  url: 'https://grandfieldbusiness.com',
  tagline: 'Startup and small-business templates that get you moving.',
  description:
    'Grandfield Business makes practical, ready-to-use business plan templates, pitch decks, and operations tools — everything a founder needs to start and run a small business without the guesswork.',
  contactEmail: 'hello@grandfieldbusiness.com',
  logo: '/logo.png',
  operator: 'Grandfield Media™',
  operatorUrl: 'https://grandfieldmedia.com',

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
        { text: 'Business Plans', href: '/products' },
        { text: 'Pitch Decks', href: '/products' },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: '/about' },
        { text: 'Blog', href: '/blog' },
        { text: 'Contact', href: 'mailto:hello@grandfieldbusiness.com' },
      ],
    },
  ],

  legalLinks: [
    { text: 'Privacy', href: '/legal/privacy' },
    { text: 'Terms', href: '/legal/terms' },
    { text: 'Refund Policy', href: '/legal/refund-policy' },
  ],

  social: [
    { label: 'LinkedIn', href: '#', icon: 'linkedin' },
    { label: 'Facebook', href: '#', icon: 'facebook' },
    { label: 'RSS', href: '/rss.xml', icon: 'rss' }
  ],

  analytics: {
    posthogKey: import.meta.env.PUBLIC_POSTHOG_KEY,
    posthogHost: import.meta.env.PUBLIC_POSTHOG_HOST,
    metaPixelId: import.meta.env.PUBLIC_META_PIXEL_ID,
  },
};
