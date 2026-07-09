# Grandfield Media Verification Website

A professional single-page Astro website for Grandfield Media. Designed for verification purposes with banks, payment processors, trademark offices, and other official entities.

## Features

- **Professional Design**: Clean, modern interface with light theme and gold accents
- **SEO Optimized**: Full meta tags, Open Graph, Twitter Cards, and JSON-LD schema markup
- **Mobile Responsive**: Fully responsive design for all devices
- **Company Information**: Clear presentation of Grandfield Media's business model
- **Contact Section**: Email, social links, and contact form
- **Verification Ready**: Trust-building elements and official company schema
- **Fast Loading**: Static site generation with Astro

## Structure

```
grandfieldmedia/
├── src/
│   └── pages/
│       └── index.astro          # Single-page website
├── public/                       # Static assets (place logo/images here)
├── package.json                  # Dependencies
├── astro.config.mjs             # Astro configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## Setup

1. Install dependencies:
```bash
pnpm install
# or npm install
```

2. Start development server:
```bash
pnpm dev
# or npm run dev
```

3. Build for production:
```bash
pnpm build
# or npm run build
```

4. Preview production build:
```bash
pnpm preview
# or npm run preview
```

## Customization

### Update Company Information
Edit the metadata and content in `src/pages/index.astro`:
- Meta title and description
- Hero section headline/subheadline
- Contact email
- Social media URLs
- Schema markup data

### Styling
- Colors are customized in `tailwind.config.js`
- Gold theme accent colors are defined in the config
- Dark slate colors for "What We Do" section

### Logo
Add your SVG logo to the `public/` folder and update the reference in `index.astro`

### Contact Form
The form uses Formspree. To activate:
1. Go to https://formspree.io
2. Create a form and get your form ID
3. Replace `YOUR_FORM_ID` in `action="https://formspree.io/f/YOUR_FORM_ID"`

## Deployment

### Netlify
1. Push code to GitHub
2. Connect repository to Netlify
3. Set build command to `pnpm build` or `npm run build`
4. Set publish directory to `dist`

### Vercel
1. Push code to GitHub
2. Import project to Vercel
3. Vercel auto-detects Astro and configures build settings
4. Deploy

### Traditional Hosting
1. Run `pnpm build`
2. Upload contents of `dist/` folder to your web server

## Verification & Trust

This website includes:
- Company schema (JSON-LD) for search engines and verification systems
- Email contact information
- Social media profiles
- Professional design and layout
- Clear business description
- Trust-building UI elements

## SEO

The page includes:
- Optimized meta tags
- Open Graph for social sharing
- Twitter Card support
- Canonical URL
- Proper heading hierarchy
- Mobile viewport optimization
- Fast loading performance

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Internet Explorer is not supported

## License

Created for Grandfield Media - All rights reserved.
