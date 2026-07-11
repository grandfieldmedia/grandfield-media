import type { SiteConfig } from '@grandfield/shared-ui/types';

// Grandfield Learning — single source of site-specific config. Nothing here lives in shared-ui.
export const siteConfig: SiteConfig = {
  id: 'learning-education',
  brand: 'Grandfield Learning',
  domain: 'grandfieldlearning.com',
  url: 'https://grandfieldlearning.com',
  tagline: 'Study guides and learning resources that make studying stick.',
  description:
    'Grandfield Learning makes practical study-skills workbooks, note-taking templates, and revision planners that help students and lifelong learners study smarter and remember more.',
  contactEmail: 'hello@grandfieldlearning.com',
  logo: '/logo.png',

  nav: [
    { text: 'Home', href: '/' },
    { text: 'Products', href: '/products' },
    { text: 'Blog', href: '/blog' },
    { text: 'About', href: '/about' },
  ],

  footerColumns: [
    {
      title: 'Resources',
      links: [
        { text: 'All Products', href: '/products' },
        { text: 'Study Guides', href: '/products' },
        { text: 'Templates', href: '/products' },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: '/about' },
        { text: 'Blog', href: '/blog' },
        { text: 'Contact', href: 'mailto:hello@grandfieldlearning.com' },
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
