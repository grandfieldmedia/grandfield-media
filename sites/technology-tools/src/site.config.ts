import type { SiteConfig } from '@grandfield/shared-ui/types';

// Grandfield Tech — single source of site-specific config. Nothing here lives in shared-ui.
export const siteConfig: SiteConfig = {
  id: 'technology-tools',
  brand: 'Grandfield Tech',
  domain: 'grandfieldtech.com',
  url: 'https://grandfieldtech.com',
  tagline: 'Digital tools, templates, and prompt packs for a faster workflow.',
  description:
    'Grandfield Tech makes practical digital productivity toolkits, workflow templates, and AI prompt packs that help you work faster and get more out of the tools you already use.',
  contactEmail: 'hello@grandfieldtech.com',
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
      title: 'Tools',
      links: [
        { text: 'All Products', href: '/products' },
        { text: 'Templates', href: '/products' },
        { text: 'Prompt Packs', href: '/products' },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: '/about' },
        { text: 'Blog', href: '/blog' },
        { text: 'Contact', href: 'mailto:hello@grandfieldtech.com' },
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
