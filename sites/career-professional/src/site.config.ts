import type { SiteConfig } from '@grandfield/shared-ui/types';

/**
 * Grandfield Careers — the single source of site-specific config.
 * Spinning up another niche site = copy this file + change the values.
 * Nothing here lives inside shared-ui.
 */
export const siteConfig: SiteConfig = {
  id: 'career-professional',
  brand: 'Grandfield Careers',
  domain: 'grandfieldcareers.com',
  url: 'https://grandfieldcareers.com',
  tagline: 'Job-ready resume, interview, and career templates that get you hired.',
  description:
    'Grandfield Careers makes practical, ready-to-use resume templates, interview prep kits, and career-growth guides — clear, professional tools that help you land the job.',
  contactEmail: 'hello@grandfieldcareers.com',

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
        { text: 'Resume Templates', href: '/products' },
        { text: 'Interview Prep', href: '/products' },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: '/about' },
        { text: 'Blog', href: '/blog' },
        { text: 'Contact', href: 'mailto:hello@grandfieldcareers.com' },
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
    { label: 'RSS', href: '/rss.xml', icon: 'rss' },
  ],

  analytics: {
    posthogKey: import.meta.env.PUBLIC_POSTHOG_KEY,
    posthogHost: import.meta.env.PUBLIC_POSTHOG_HOST,
    metaPixelId: import.meta.env.PUBLIC_META_PIXEL_ID,
  },
};
