# Grandfield Media — Project Overview

**Last Updated:** July 10, 2026  
**Owner:** Srini (srinispaces@gmail.com)  
**Organization:** Grandfield Media

## Mission & Business Model

Grandfield Media is a **digital media company that creates, owns, and sells AI-generated digital assets**. We create, publish, own, and monetize content through AI across multiple formats and niches.

### What We Build
- Books (via Amazon KDP)
- Courses (via Udemy, Teachable, etc.)
- Templates (Canva, PowerPoint, Notion)
- Prompt packs (ChatGPT, Claude, specialized AI tools)
- YouTube channels (faceless, AI-generated content)
- Websites (niche authority sites)
- Newsletters (owned audience channels)
- Apps & Software (micro SaaS, utilities)
- Digital downloads (PDFs, checklists, workbooks)
- Digital tools (online calculators, generators, assessments)

### Portfolio Categories (How We Sell)
1. **Learn** — Courses, books, tutorials, skill-building resources
2. **Get Hired** — Interview prep, certification kits, resume templates, practice questions
3. **Work** — Templates, digital tools, prompt packs, automation systems, workflow products

---

## The 10 Parent Niches (LOCKED)

**Finalized:** July 9, 2026 (revised same day)

These are the foundational categories under which all products and websites operate. Each gets its own branded website and content pipeline.

1. **Business & Entrepreneurship** — Small business templates, startup guides, business planning tools
2. **Career & Professional Development** — Job search prep, skill building, professional growth
3. **Learning & Education** — Study guides, learning resources, educational courses
4. **Home & Lifestyle** — Home organization, lifestyle templates, DIY guides
5. **Technology & Digital Tools** — Tech tutorials, digital product resources, tool guides
6. **Money & Finance** — Budgeting templates, financial education, trackers (scoped away from regulated advice)
7. **Relationships & Family** — Family planning, communication guides, family resources
8. **Health & Wellness** — Fitness planners, wellness journals, health education (scoped away from medical claims)
9. **Events & Celebrations** — Party planning, holiday guides, event templates, corporate events
10. **Kids & Children's Education** — Activity sheets, coloring pages, educational workbooks

### Selection Criteria (Why These 10)
✓ **AI-generation ease** — Text/template/design-based, no physical testing needed  
✓ **Proven marketplace demand** — Validated on Etsy, Gumroad, Teachers Pay Teachers, KDP, Udemy  
✓ **Faceless YouTube viability** — Works as video content (no on-camera presence required)  
✓ **Low legal/regulatory risk** — Avoided YMYL (Your Money or Your Life) issues  
✓ **10-year durability** — Structure makes sense long-term, not just trend-chasing  
✓ **Depth & scalability** — Support thousands of products via sub-niche × product-type × audience combinations  

### Notable Decisions

**Replaced:** Travel & Adventure was originally in the locked 10 but scored weakest across all tests (hardest faceless-YouTube fit, weakest demand, most discretionary spending, highest upkeep). **Replaced with Kids & Children's Education** — beats it on every axis.

**Risk-Scoped Niches:**
- **Money & Finance** → Scope to budgeting/education; avoid regulated investment/tax advice
- **Health & Wellness** → Scope to fitness/wellness; avoid medical claims/diet advice

---

## Technical Architecture

### Tech Stack
- **Framework:** Astro 4.0.0 (static site generation)
- **Styling:** Tailwind CSS 3.4.0 (utility-first CSS)
- **Language:** TypeScript (strict mode)
- **Package Manager:** pnpm 11.10.0+ (monorepo with workspaces)
- **Deployment:** Vercel (per-site independent deployment)
- **Version Control:** Git + GitHub

> **Commerce niche sites (the 10 monetized niches) use a newer stack:** Astro 6 +
> Tailwind 4 (`@tailwindcss/vite`) + `@astrojs/vercel` (server output), on an
> AstroWind-derived `packages/shared-ui`. See
> `Grandfield Media — Tech Stack & Reuse Architecture.md` for the full plan.
> The Astro 4 / Tailwind 3 stack above still applies to `grandfieldmedia` and
> `srini-pro`, which are excluded from the commerce data model.

### Monorepo Structure
```
grandfield-media/
├── sites/                          # Individual niche websites
│   ├── grandfieldmedia/            # Main brand site
│   ├── business-entrepreneurship/
│   ├── career-professional/
│   ├── events-celebrations/
│   ├── health-wellness/
│   ├── home-lifestyle/
│   ├── kids-childrens-education/
│   ├── learning-education/
│   ├── money-finance/
│   ├── relationships-family/
│   ├── technology-digital-tools/
│   └── [more sites as needed]
├── packages/                       # Shared utilities & components
│   ├── shared-ui/                 # Reusable Astro components
│   ├── shared-utils/              # Utility functions
│   └── [other shared packages]
├── .github/workflows/             # CI/CD (GitHub Actions)
├── package.json                   # Root workspace config
├── pnpm-workspace.yaml           # Workspace definition
├── pnpm-lock.yaml                # Dependency lock
├── .cursorrules                  # Cursor IDE rules
└── CLAUDE.md                     # This file
```

### Each Site Structure
```
sites/[niche-name]/
├── src/
│   ├── components/               # Reusable Astro components
│   ├── layouts/                  # Page layouts
│   ├── pages/                    # Route definitions (file-based routing)
│   ├── styles/                   # Global styles
│   ├── lib/                      # Utilities, helpers, types
│   └── assets/                   # Images, icons
├── public/                       # Static assets
├── astro.config.mjs              # Astro configuration
├── tailwind.config.js            # Tailwind configuration
├── tsconfig.json                 # TypeScript config (strict + @/* aliases)
└── package.json                  # Site-specific dependencies
```

---

## Deployment Strategy

### Per-Site Independent Deployment

Each niche site is a **separate Vercel project** with its own domain and deployment pipeline.

**Example Setup:**
- `grandfieldmedia.com` → `sites/grandfieldmedia`
- `business-entrepreneurship.com` → `sites/business-entrepreneurship`
- `career-professional.com` → `sites/career-professional`
- (etc. for each niche)

### Vercel Configuration

**Build Command (per site):**
```bash
pnpm --filter [site-name] run build
```

**Output Directory:**
```
sites/[site-name]/dist
```

**Environment Variables:**
- Public vars: `PUBLIC_*` prefix
- Secrets: Stored in Vercel project dashboard
- Access in code: `import.meta.env.PUBLIC_*`

---

## Development Workflow

### Local Setup
```bash
# Install dependencies
pnpm install

# Start development for a specific site
cd sites/[site-name]
pnpm run dev

# Or from root
pnpm --filter [site-name] run dev
```

### Essential Commands
```bash
# Development
pnpm --filter [site-name] run dev      # Start dev server
pnpm --filter [site-name] run build    # Build for production
pnpm --filter [site-name] run preview  # Preview production build

# Management
pnpm install                           # Install all deps
pnpm --filter [site-name] add pkg      # Add dependency to site
pnpm update                            # Update dependencies
pnpm store prune                       # Clean cache

# Utilities
tsc --noEmit                           # Type check
```

### Git Workflow

**Branch Strategy:**
- `main` — Production-ready code
- `feature/description` — New features
- `fix/description` — Bug fixes
- `refactor/description` — Code improvements
- `docs/description` — Documentation

**Commit Format (Conventional Commits):**
```
type(scope): description

Examples:
- feat(business-entrepreneurship): add new hero component
- fix(career-professional): resolve mobile nav alignment
- refactor(shared-ui): extract button styles to Tailwind
- docs: update deployment checklist
```

**Before Committing:**
1. Run type check: `tsc --noEmit`
2. Build locally: `pnpm --filter [site] run build`
3. Test preview: `pnpm --filter [site] run preview`

---

## Code Standards & Conventions

### Naming Conventions
- **Components:** `PascalCase.astro` (e.g., `Button.astro`, `HeroSection.astro`)
- **Files/folders:** `kebab-case` (e.g., `src/components/nav-header/`)
- **Functions/utils:** `camelCase` (e.g., `formatDate()`, `getPostData()`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`, `MAX_ITEMS`)
- **Types/interfaces:** `PascalCase` (e.g., `type Post`, `interface Props`)

### Component Best Practices
- Use TypeScript interfaces for all component props
- Scope CSS with `<style scoped>` in components
- Use `@apply` for repeated Tailwind combinations
- Keep components focused and reusable
- Import from `@/` for internal paths (maps to `src/`)

### Code Organization
- `src/pages/` — One `.astro` file per route
- `src/components/` — Reusable UI components
- `src/layouts/` — Page wrapper layouts
- `src/lib/` — Utilities, helpers, constants, types
- `src/styles/` — Global styles only
- `src/assets/` — Images, icons, media

---

## Performance & Optimization

### Build & Bundle
- **Zero JavaScript by default** — Astro ships static HTML; keep JS minimal
- **Image optimization** — Use Astro's `<Image />` component
- **CSS efficiency** — Tailwind auto-purges unused styles
- **Static generation** — Pre-render pages at build time

### Caching (Vercel)
- Static assets (`.js`, `.css`, `.woff2`): Cache indefinitely
- HTML pages: Default 1-hour cache (configurable)
- Use cache headers in `vercel.json` for fine-tuning

### Monitoring
- **Vercel Analytics** — Core Web Vitals, performance metrics
- **Lighthouse scores** — Monitor SEO and performance
- **Build times** — Profile locally: `pnpm --filter [site] run build`

---

## Key Decisions & Rationale

### Why Monorepo (pnpm workspaces)?
- **Code reuse** — Shared components and utilities across all sites
- **Consistent standards** — Same TypeScript, Tailwind, Astro config
- **Easier maintenance** — Update all sites simultaneously if needed
- **Single lock file** — Dependency management at scale

### Why Astro?
- **Static generation** — Fast, SEO-friendly, zero JS overhead
- **Content-focused** — Perfect for marketing sites, blogs, product pages
- **Islands architecture** — Only hydrate interactive parts
- **Minimal learning curve** — HTML/CSS/JS fundamentals

### Why Per-Site Vercel Deployment?
- **Independent scaling** — Each site can have its own traffic patterns
- **Isolated deployments** — Bug in one site doesn't affect others
- **Separate analytics** — Track performance per niche
- **Independent domains** — Each niche gets branded presence

### Risk Scoping in Money & Finance / Health & Wellness
- Avoid regulated advice (investment, tax, medical)
- Focus on education, templates, tools instead
- Reduces legal risk while maintaining market demand

---

## Product Development Pipeline

### Content Types (Per Niche)
1. **Short-form** — Blog posts, checklists, quick guides (2-5 pages)
2. **Medium-form** — Workbooks, template packs, mini-courses (10-50 pages)
3. **Long-form** — Full courses, comprehensive books, complete systems (100+ pages)

### Distribution Channels
- **Amazon KDP** — Books
- **Udemy/Teachable** — Courses
- **Etsy** — Templates, printables, digital downloads
- **Gumroad** — Prompt packs, tools, downloads
- **YouTube** — Faceless channels (read-alouds, tutorials, animations)
- **Own websites** — Content hubs, SEO traffic, affiliate/ad revenue

### Sub-Niches (Examples)
- Business & Entrepreneurship → Freelancing, SaaS, e-commerce, Amazon FBA
- Career & Professional → Interview prep, resume writing, skill certification
- Health & Wellness → Fitness, mental health, nutrition (non-medical)
- Kids & Children's → By age group (0-5, 5-10, 10+) × by subject (math, reading, science)

---

## Important Files & Resources

### Project Configuration
- **`.cursorrules`** — Cursor IDE context and coding standards
- **`pnpm-workspace.yaml`** — Workspace definition
- **`package.json`** — Root dependencies and scripts
- **`pnpm-lock.yaml`** — Locked dependency versions

### Per-Site Config
- **`astro.config.mjs`** — Astro build and integration settings
- **`tailwind.config.js`** — Tailwind CSS customization
- **`tsconfig.json`** — TypeScript settings

### Documentation
- **`CLAUDE.md`** — This file (project context for Claude)
- **`.github/workflows/`** — CI/CD automation (if configured)
- Individual site README files (if created)

---

## Future Roadmap Considerations

### Planned (Not Yet Started)
- [ ] Design system / shared component library (in `packages/shared-ui/`)
- [ ] Shared utilities library (in `packages/shared-utils/`)
- [ ] CI/CD pipelines (GitHub Actions)
- [ ] Automated testing (Vitest, Playwright)
- [ ] SEO optimization template (meta tags, structured data)
- [ ] Analytics integration (Vercel Analytics, Google Analytics)

### Monetization Features
- [ ] Email capture forms (ConvertKit, Substack integration)
- [ ] Payment integration (Stripe, Gumroad embeds)
- [ ] Affiliate links (Amazon, CJ, ShareASale)
- [ ] Ad network integration (AdSense, Mediavine)
- [ ] Membership/subscription tiers

### Content Scaling
- [ ] Prompt template library for AI content generation
- [ ] Content calendar and publishing workflow
- [ ] Multi-language support (future expansion)
- [ ] Video hosting (self-hosted or YouTube embedding)

---

## Team & Collaboration

**Current:** Solo project (Srini)

### If Expanding
- **Content creators** — Write initial content per niche
- **Designer** — Brand identity, templates, graphics
- **Developer** — Maintenance, new features, deployments
- **Marketing/SEO specialist** — Traffic growth, monetization optimization

---

## Links & Resources

### Documentation
- Astro Docs: https://docs.astro.build
- Tailwind CSS: https://tailwindcss.com/docs
- pnpm Workspaces: https://pnpm.io/workspaces
- Vercel Astro Guide: https://vercel.com/docs/frameworks/astro

### Platforms & Marketplaces
- Amazon KDP: https://kdp.amazon.com
- Udemy: https://www.udemy.com/teaching/
- Etsy: https://www.etsy.com
- Gumroad: https://gumroad.com
- YouTube Studio: https://studio.youtube.com

### AI Content Tools
- ChatGPT: https://chat.openai.com
- Claude: https://claude.ai
- Midjourney: https://midjourney.com
- Canva: https://canva.com

---

## Notes for Future Sessions

### What to Ask About
- Current progress on each niche site
- Which sites are deployed to Vercel yet?
- Any shared components or utilities started?
- Content pipeline status (how many products per niche?)
- Traffic/revenue metrics per site

### Quick Wins to Implement
1. Add root `pnpm run dev` script that lists all available sites
2. Create `packages/shared-ui/` with common components
3. Set up GitHub Actions for automated testing/linting
4. Add SEO optimization template to each site
5. Set up Vercel Analytics for each site

### Performance Quick Wins
1. Optimize images in assets/ with Astro `<Image />`
2. Add sitemap.xml generation
3. Add robots.txt
4. Implement Open Graph tags for social sharing
5. Add schema.org structured data

---

**This document is the source of truth for Grandfield Media's project structure, conventions, and strategy. Update it when significant decisions change.**
