/**
 * SiteConfig — the single object that drives every shared-ui component.
 * Each niche site provides its own `site.config.ts`; NOTHING in shared-ui is
 * hardcoded to a specific brand, so all 10 sites reuse these components as-is.
 */

export interface NavLink {
  text: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export type SocialIcon = 'x' | 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'rss';

export interface SocialLink {
  label: string;
  href: string;
  icon: SocialIcon;
}

export interface SiteAnalytics {
  posthogKey?: string;
  posthogHost?: string;
  metaPixelId?: string;
}

export interface SiteConfig {
  /** Matches the site_id used on every Supabase row, e.g. 'money-finance'. */
  id: string;
  brand: string;
  domain: string;
  /** Absolute site URL, e.g. 'https://grandfieldmoney.com'. */
  url: string;
  tagline: string;
  /** Default meta description; individual pages can override. */
  description: string;
  contactEmail: string;
  nav: NavLink[];
  footerColumns: FooterColumn[];
  legalLinks: NavLink[];
  social: SocialLink[];
  analytics?: SiteAnalytics;
  /** Path (in /public) to logo + favicon assets. */
  logo?: string;
  favicon?: string;
  /** Legal operator behind the site, e.g. 'Grandfield Media™'. Shown in the footer when set. */
  operator?: string;
  /** Operator's website, e.g. 'https://grandfieldmedia.com'. */
  operatorUrl?: string;
}

/** Per-page SEO/meta overrides accepted by PageLayout. */
export interface PageMeta {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

/** A product summary as rendered on cards / promos (mirrors the Supabase row). */
export interface ProductSummary {
  name: string;
  slug: string;
  description: string | null;
  price: number; // cents
  image?: string | null;
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Testimonial {
  name: string;
  role?: string;
  quote: string;
  avatar?: string;
}

export interface CtaAction {
  text: string;
  href: string;
  primary?: boolean;
}
