# PurposeBound Strategies Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the PurposeBound Strategies marketing website — a static Astro site with a lead magnet funnel, all design tokens in a single config file, and content structured for future Decap CMS integration.

**Architecture:** Astro 5 with Content Collections for all editable content (blog posts, testimonials, services). All design tokens live in `theme.config.ts`. Components import from theme config — no hardcoded colors, fonts, or content. Pages use one of three layouts: `Page.astro` (with nav/footer), `Bare.astro` (conversion pages — no exits), or `Base.astro` (HTML shell only). CSS custom properties are defined in `src/styles/global.css` and referenced by Tailwind via CSS variable syntax. All forms handled by Netlify Forms (no backend).

**Tech Stack:** Astro 5, Tailwind CSS 3 (`@astrojs/tailwind`), TypeScript, Netlify (hosting + forms), Playwright (E2E tests), Vitest (unit tests), Calendly (embed)

**Spec:** `docs/superpowers/specs/2026-03-24-purposebound-website-design.md`

---

## File Map

```
purposebound-strategies/
├── astro.config.mjs              # Astro config: tailwind, sitemap integrations
├── tailwind.config.mjs           # Tailwind theme: extends colors via CSS vars
├── tsconfig.json                 # TypeScript config
├── netlify.toml                  # Netlify: forms, redirects, headers
├── .gitignore
├── theme.config.ts               # Single source of truth: colors, fonts, content tokens
├── public/
│   ├── logo-placeholder.svg      # Placeholder until real logo delivered
│   └── favicon.svg
├── src/
│   ├── styles/
│   │   └── global.css            # CSS custom properties from theme.config.ts values
│   ├── content/
│   │   ├── config.ts             # Zod collection schemas
│   │   ├── blog/                 # (empty at launch — directory only)
│   │   ├── testimonials/
│   │   │   └── featured.json     # One placeholder testimonial entry
│   │   └── services/
│   │       ├── coaching.json     # 1:1 coaching offering
│   │       └── consulting.json   # Team consulting offering
│   ├── layouts/
│   │   ├── Base.astro            # HTML shell: head, meta, global CSS, fonts
│   │   ├── Page.astro            # Full page: Base + Nav + Footer
│   │   └── Bare.astro            # Conversion page: Base only, no nav/footer
│   ├── components/
│   │   ├── Nav.astro             # Global nav: logo, links, CTA button
│   │   ├── Footer.astro          # Global footer: logo, minimal nav
│   │   ├── SectionLabel.astro    # Reusable uppercase burgundy section label
│   │   ├── QuoteBlock.astro      # Gold left-border pull quote with optional link
│   │   ├── Hero.astro            # Homepage hero: split layout, photo slot
│   │   ├── MetricsBar.astro      # 3-metric gold numbers bar (dark bg)
│   │   ├── HowItWorks.astro      # 3-step numbered process (dark bg)
│   │   ├── CredibilityBar.astro  # "As Featured In" strip (light bg)
│   │   ├── LeadMagnetForm.astro  # Netlify Forms email capture
│   │   ├── Testimonial.astro     # Single testimonial display
│   │   └── ServiceCard.astro     # Service offering card with CTA
│   └── pages/
│       ├── index.astro           # Homepage: all sections assembled
│       ├── about.astro           # What I Believe: faith → philosophy → story
│       ├── services.astro        # Services: two ServiceCard components
│       ├── start.astro           # Lead magnet landing (Bare layout)
│       ├── thank-you.astro       # Post-submission confirmation (Bare layout)
│       ├── contact.astro         # Calendly embed + FAQ
│       └── blog/
│           └── index.astro       # Blog: empty state + grid ready to populate
├── tests/
│   └── e2e/
│       └── site.spec.ts          # Playwright: key user flows
└── playwright.config.ts          # Playwright config
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `astro.config.mjs`
- Create: `package.json`
- Create: `tailwind.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `playwright.config.ts`

- [ ] **Step 1: Initialize Astro project in existing directory**

```bash
cd /Users/haydenhaines/Projects/ClaudeProjects/purposebound-strategies
npm create astro@latest . -- --template minimal --install --no-git --typescript strict
```

When prompted: choose minimal template, install deps, TypeScript strict mode. Say yes to all defaults.

- [ ] **Step 2: Add Tailwind and Sitemap integrations**

```bash
npx astro add tailwind --yes
npx astro add sitemap --yes
```

- [ ] **Step 3: Install Playwright and Vitest**

```bash
npm install --save-dev @playwright/test vitest
npx playwright install chromium
```

- [ ] **Step 4: Verify astro.config.mjs includes both integrations**

`astro.config.mjs` should look like:
```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://purposeboundstrategies.com', // update when domain is set
  integrations: [tailwind(), sitemap()],
});
```

- [ ] **Step 5: Create playwright.config.ts**

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:4321',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 6: Add test script to package.json**

Add to `scripts` in package.json:
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

- [ ] **Step 7: Create .gitignore**

```
node_modules/
dist/
.astro/
.env
.env.*
!.env.example
.netlify/
playwright-report/
test-results/
```

- [ ] **Step 8: Create src/styles/ directory and empty global.css**

```bash
mkdir -p src/styles && touch src/styles/global.css
```

- [ ] **Step 9: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts at `http://localhost:4321` with no errors.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: scaffold Astro 5 project with Tailwind, Playwright"
```

---

## Task 2: Theme Config & Tailwind Integration

**Files:**
- Create: `theme.config.ts`
- Modify: `tailwind.config.mjs`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Create theme.config.ts**

This is the single source of truth. No component should hardcode any of these values.

```typescript
// theme.config.ts
// NOTE: CSS custom properties in src/styles/global.css must stay in sync with brand.colors.
// If you change a color here, update global.css to match.

export const theme = {
  site: {
    name: 'PurposeBound Strategies',
    tagline: 'Build a Business That Honors Something Greater.',
    description:
      'Sales coaching and management consulting for leaders who build with integrity.',
    url: 'https://purposeboundstrategies.com', // DEBT: update when domain is confirmed
  },
  founder: {
    name: '[Founder Name]', // replace when confirmed
    title: 'Founder, PurposeBound Strategies',
    photo: '/images/founder.jpg', // replace when headshot is delivered
    email: 'hello@purposeboundstrategies.com', // replace with real email
  },
  brand: {
    logo: '/logo-placeholder.svg', // replace when logo is delivered
    // Palette: "Stained Glass" — deep structural colors + single gold accent per section.
    // Gold is used ONCE per section as the moment the light catches. Not a pattern, a highlight.
    colors: {
      deep: '#2c1018',      // dark backgrounds, nav, footer
      rich: '#3d1520',      // hero, dark sections
      accent: '#c9a84c',    // gold — CTAs, labels, the light
      cream: '#f7f5f0',     // light backgrounds, body sections
      burgundy: '#6b1e2e',  // section labels, links, borders
      muted: '#d9c4b8',     // body text on dark backgrounds
      text: '#2c1018',      // body text on light backgrounds
    },
    fonts: {
      heading: ['Georgia', '"Times New Roman"', 'serif'],
      body: ['Georgia', '"Times New Roman"', 'serif'],
    },
  },
  metrics: [
    { value: '[X]+', label: 'Leaders Coached' },
    { value: '[X]%', label: 'Report Stronger Team Culture' },
    { value: '[X] Yrs', label: 'Sales Leadership Experience' },
  ],
  nav: [
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Blog', href: '/blog' },
  ],
  calendly: {
    url: 'https://calendly.com/[handle]/discovery', // DEBT: update with real Calendly URL
  },
  email: {
    // DEBT: add webhook URL when email provider is chosen (ConvertKit or MailerLite)
    webhookUrl: '',
  },
  social: {
    linkedin: '', // add when available
    twitter: '',  // add when available
  },
  credibility: [
    { name: '[Publication or Conference]', url: '' },
    { name: '[Certification]', url: '' },
    { name: '[Podcast or Media]', url: '' },
  ],
  leadMagnet: {
    title: 'The 5 Pillars of a Christ-Centered Sales Culture',
    description:
      'A practical framework for sales leaders who want to build something that lasts.',
    bullets: [
      'The biblical foundation for ethical selling',
      'How to build a team culture rooted in integrity',
      'Practical tools for coaching that forms character',
      'A framework for accountability that motivates rather than pressures',
      'How to measure success beyond the scoreboard',
    ],
  },
} as const;

export type Theme = typeof theme;
```

- [ ] **Step 2: Write unit test for theme config shape**

Create `tests/theme.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { theme } from '../theme.config';

describe('theme.config', () => {
  it('has all required color tokens', () => {
    const required = ['deep', 'rich', 'accent', 'cream', 'burgundy', 'muted', 'text'];
    required.forEach((key) => {
      expect(theme.brand.colors[key as keyof typeof theme.brand.colors]).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it('has exactly 3 metrics', () => {
    expect(theme.metrics).toHaveLength(3);
  });

  it('has a leadMagnet title', () => {
    expect(theme.leadMagnet.title.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Run unit test (expect pass)**

```bash
npx vitest run tests/theme.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 4: Update src/styles/global.css**

Sync values from `theme.config.ts` brand.colors. Add comment warning to keep in sync.

```css
/* src/styles/global.css */
/*
  COLOR VALUES: Keep in sync with theme.config.ts → brand.colors.
  If you change a color in theme.config.ts, update the matching var here.
*/
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-deep:     #2c1018;
  --color-rich:     #3d1520;
  --color-accent:   #c9a84c;
  --color-cream:    #f7f5f0;
  --color-burgundy: #6b1e2e;
  --color-muted:    #d9c4b8;
  --color-text:     #2c1018;
}

html {
  font-family: Georgia, 'Times New Roman', serif;
  color: var(--color-text);
  background-color: var(--color-cream);
}
```

- [ ] **Step 5: Update tailwind.config.mjs to use CSS variables**

```js
// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        deep:     'var(--color-deep)',
        rich:     'var(--color-rich)',
        accent:   'var(--color-accent)',
        cream:    'var(--color-cream)',
        burgundy: 'var(--color-burgundy)',
        muted:    'var(--color-muted)',
        'pb-text': 'var(--color-text)',
      },
      fontFamily: {
        heading: ['Georgia', '"Times New Roman"', 'serif'],
        body:    ['Georgia', '"Times New Roman"', 'serif'],
      },
      letterSpacing: {
        widest: '0.2em',
      },
    },
  },
  plugins: [],
};
```

Note: `text` is reserved by Tailwind so the color token is named `pb-text` (PurposeBound text).

- [ ] **Step 6: Create logo placeholder SVG**

```bash
mkdir -p public
```

Create `public/logo-placeholder.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="32" viewBox="0 0 140 32">
  <rect width="28" height="28" x="2" y="2" rx="2" fill="#c9a84c" opacity="0.3" stroke="#c9a84c" stroke-width="1"/>
  <text x="38" y="22" font-family="Georgia, serif" font-size="14" font-weight="700" fill="#f7f5f0" letter-spacing="0.05em">PURPOSEBOUND</text>
</svg>
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add theme.config.ts, global CSS, Tailwind color tokens"
```

---

## Task 3: Content Collections

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/testimonials/featured.json`
- Create: `src/content/services/coaching.json`
- Create: `src/content/services/consulting.json`

- [ ] **Step 1: Write failing test for collection schemas**

Create `tests/collections.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';

// We test that our seed data files are valid JSON matching the expected shape.
// This mirrors what Astro's Zod validation does at build time.

import featured from '../src/content/testimonials/featured.json';
import coaching from '../src/content/services/coaching.json';
import consulting from '../src/content/services/consulting.json';

describe('testimonial seed data', () => {
  it('has required fields', () => {
    expect(featured).toHaveProperty('name');
    expect(featured).toHaveProperty('title');
    expect(featured).toHaveProperty('company');
    expect(featured).toHaveProperty('quote');
    expect(featured).toHaveProperty('featured');
  });
});

describe('service seed data', () => {
  it('coaching has required fields', () => {
    expect(coaching).toHaveProperty('title');
    expect(coaching).toHaveProperty('description');
    expect(coaching).toHaveProperty('includes');
    expect(Array.isArray(coaching.includes)).toBe(true);
    expect(coaching).toHaveProperty('order');
  });

  it('consulting has limited flag', () => {
    expect(consulting).toHaveProperty('limited');
    expect(consulting.limited).toBe(true);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL (files don't exist yet)**

```bash
npx vitest run tests/collections.test.ts
```

Expected: FAIL — cannot find modules.

- [ ] **Step 3: Create src/content/config.ts**

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default('Founder'),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const testimonials = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    title: z.string(),
    company: z.string(),
    quote: z.string(),
    result: z.string().optional(), // specific metric or observable change — make this concrete
    featured: z.boolean().default(false),
  }),
});

const services = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    description: z.string(),
    whoItIsFor: z.string(),
    includes: z.array(z.string()),
    cta: z.string().default("Let's Talk"),
    limited: z.boolean().default(false), // true = show "Currently accepting limited engagements"
    order: z.number(),
  }),
});

export const collections = { blog, testimonials, services };
```

- [ ] **Step 4: Create seed data files**

`src/content/testimonials/featured.json`:
```json
{
  "name": "[Client Name]",
  "title": "[Title]",
  "company": "[Company]",
  "quote": "[Specific result quote — e.g., 'In 90 days our close rate went from X% to Y% — but more importantly, my team actually wants to come to work.']",
  "result": "[Quantified outcome — e.g., 'Close rate increased 28% in 90 days']",
  "featured": true
}
```

`src/content/services/coaching.json`:
```json
{
  "title": "1:1 Coaching",
  "tagline": "For Sales Leaders",
  "description": "Monthly coaching engagements for managers and leaders building Christ-honoring sales teams. We work on the fundamentals: pipeline, culture, coaching your reps, and leading with conviction.",
  "whoItIsFor": "Sales managers and small business owners leading teams of 3–30 people who want to build something they're proud of.",
  "includes": [
    "Monthly 1:1 coaching sessions",
    "Accountability between sessions",
    "Frameworks for team coaching and culture",
    "Practical tools for difficult conversations",
    "A coaching approach grounded in Scripture and proven practice"
  ],
  "cta": "Let's Talk",
  "limited": false,
  "order": 1
}
```

`src/content/services/consulting.json`:
```json
{
  "title": "Consulting",
  "tagline": "For Organizations",
  "description": "Team-level engagements to reshape sales culture, process, and leadership from the inside out. We work with your leadership team to diagnose what's broken and build something that lasts.",
  "whoItIsFor": "Organizations whose sales culture doesn't match their values — or who want to build one that does from the start.",
  "includes": [
    "Sales culture diagnostic",
    "Leadership team coaching",
    "Process and pipeline redesign",
    "Manager coaching and development",
    "Ongoing consulting retainer (optional)"
  ],
  "cta": "Inquire About Consulting",
  "limited": true,
  "order": 2
}
```

- [ ] **Step 5: Add vitest config so it can resolve JSON imports**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
```

- [ ] **Step 6: Run tests — expect PASS**

```bash
npx vitest run tests/
```

Expected: all 6 tests pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: content collections schemas and seed data"
```

---

## Task 4: Layouts

**Files:**
- Create: `src/layouts/Base.astro`
- Create: `src/layouts/Page.astro`
- Create: `src/layouts/Bare.astro`

- [ ] **Step 1: Create Base.astro**

The HTML shell. All pages use this. Handles head, meta, global CSS, fonts.

```astro
---
// src/layouts/Base.astro
import { theme } from '../../theme.config';

interface Props {
  title?: string;
  description?: string;
}

const {
  title = theme.site.name,
  description = theme.site.description,
} = Astro.props;

const pageTitle = title === theme.site.name
  ? theme.site.name
  : `${title} | ${theme.site.name}`;
---
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{pageTitle}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="sitemap" href="/sitemap-index.xml" />
    <!-- Preload Georgia — it's a system font, no external load needed -->
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Create Page.astro**

Full page layout — imports Nav and Footer. Most pages use this.

```astro
---
// src/layouts/Page.astro
import Base from './Base.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title?: string;
  description?: string;
}

const { title, description } = Astro.props;
---
<Base title={title} description={description}>
  <Nav />
  <main>
    <slot />
  </main>
  <Footer />
</Base>
```

- [ ] **Step 3: Create Bare.astro**

Conversion page layout — no nav, no footer. Used for `/start` and `/thank-you`. Zero exit paths.

```astro
---
// src/layouts/Bare.astro
// Conversion pages: no nav, no footer.
// The only action available is the conversion action.
import Base from './Base.astro';
import '../styles/global.css';

interface Props {
  title?: string;
  description?: string;
}

const { title, description } = Astro.props;
---
<Base title={title} description={description}>
  <main>
    <slot />
  </main>
</Base>
```

- [ ] **Step 4: Verify build still passes**

```bash
npm run build
```

Expected: build completes without errors. (Pages will be empty until created.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Base, Page, and Bare layouts"
```

---

## Task 5: Shared Components

**Files:**
- Create: `src/components/Nav.astro`
- Create: `src/components/Footer.astro`
- Create: `src/components/SectionLabel.astro`
- Create: `src/components/QuoteBlock.astro`

- [ ] **Step 1: Create SectionLabel.astro**

Reusable across all pages. The burgundy uppercase label above each section heading.

```astro
---
// src/components/SectionLabel.astro
interface Props {
  text: string;
}
const { text } = Astro.props;
---
<p class="text-burgundy text-[10px] uppercase tracking-[0.25em] font-bold mb-3">
  {text}
</p>
```

- [ ] **Step 2: Create QuoteBlock.astro**

Gold left-border pull quote used in the "What I Believe" taste section and on the /about page.

```astro
---
// src/components/QuoteBlock.astro
interface Props {
  quote: string;
  linkText?: string;
  linkHref?: string;
}
const { quote, linkText, linkHref } = Astro.props;
---
<blockquote class="border-l-4 border-accent pl-6 py-2">
  <p class="text-pb-text text-lg font-bold leading-relaxed italic mb-3">
    "{quote}"
  </p>
  {linkText && linkHref && (
    <a href={linkHref} class="text-burgundy text-xs uppercase tracking-widest hover:text-accent transition-colors">
      → {linkText}
    </a>
  )}
</blockquote>
```

- [ ] **Step 3: Create Nav.astro**

```astro
---
// src/components/Nav.astro
import { theme } from '../../theme.config';
---
<nav class="bg-deep px-8 py-4 flex justify-between items-center">
  <a href="/" class="flex items-center gap-3">
    <img src={theme.brand.logo} alt={theme.site.name} height="28" class="h-7" />
    <span class="text-cream text-xs font-bold uppercase tracking-[0.15em]">
      {theme.site.name}
    </span>
  </a>
  <div class="flex items-center gap-6">
    {theme.nav.map((item) => (
      <a href={item.href} class="text-accent text-[11px] uppercase tracking-wider hover:text-cream transition-colors">
        {item.label}
      </a>
    ))}
    <a
      href="/contact"
      class="bg-accent text-deep text-[10px] font-bold uppercase tracking-wider px-4 py-2 hover:brightness-110 transition-all"
    >
      Book a Call
    </a>
  </div>
</nav>
```

- [ ] **Step 4: Create Footer.astro**

```astro
---
// src/components/Footer.astro
import { theme } from '../../theme.config';

const year = new Date().getFullYear();
---
<footer class="bg-deep px-8 py-6 flex justify-between items-center">
  <span class="text-accent text-xs font-bold uppercase tracking-wider">
    {theme.site.name}
  </span>
  <nav class="flex items-center gap-6" aria-label="Footer navigation">
    <span class="text-muted text-[10px]">© {year}</span>
    {theme.nav.map((item) => (
      <a href={item.href} class="text-muted text-[10px] hover:text-cream transition-colors">
        {item.label}
      </a>
    ))}
    <a href="/contact" class="text-muted text-[10px] hover:text-cream transition-colors">
      Contact
    </a>
  </nav>
</footer>
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Nav, Footer, SectionLabel, QuoteBlock components"
```

---

## Task 6: Homepage Section Components

**Files:**
- Create: `src/components/Hero.astro`
- Create: `src/components/MetricsBar.astro`
- Create: `src/components/HowItWorks.astro`
- Create: `src/components/CredibilityBar.astro`
- Create: `src/components/Testimonial.astro`

- [ ] **Step 1: Create Hero.astro**

Split layout: headline/CTAs left, founder photo placeholder right. Dark rich background with gold-bordered bottom.

```astro
---
// src/components/Hero.astro
import { theme } from '../../theme.config';
---
<section class="bg-rich border-b-[3px] border-accent flex items-stretch min-h-[320px]">
  <!-- Left: copy + CTAs -->
  <div class="flex-1 px-10 py-12 flex flex-col justify-center">
    <p class="text-accent text-[10px] uppercase tracking-[0.3em] mb-4">
      Sales Coaching · Management Consulting
    </p>
    <h1 class="text-cream font-heading text-4xl font-bold leading-tight mb-3">
      Build a Business That<br />
      Honors <span class="text-accent">Something Greater.</span>
    </h1>
    <p class="text-muted text-sm leading-relaxed max-w-md mb-8">
      Coaching and consulting for sales leaders ready to build teams, cultures,
      and revenue engines that reflect who they are — and Who they serve.
    </p>
    <div class="flex gap-3">
      <a
        href="/start"
        class="bg-accent text-deep text-[11px] font-bold uppercase tracking-wider px-6 py-3 hover:brightness-110 transition-all"
      >
        Get the Free Guide
      </a>
      <a
        href="/contact"
        class="border border-cream text-cream text-[11px] uppercase tracking-wider px-6 py-3 hover:bg-cream hover:text-deep transition-all"
      >
        Book a Discovery Call
      </a>
    </div>
  </div>

  <!-- Right: founder photo slot -->
  <div class="w-56 bg-deep flex flex-col items-center justify-end px-5 pt-5">
    <div class="w-40 h-52 bg-rich rounded-t-lg border-2 border-burgundy border-b-0 flex items-center justify-center">
      <div class="text-center text-muted">
        <!-- Replace src with real headshot path from theme.config.ts when available -->
        <div class="text-4xl mb-2">👤</div>
        <p class="text-[9px] uppercase tracking-widest text-muted/60">
          {theme.founder.name !== '[Founder Name]' ? theme.founder.name : 'Founder Photo'}
        </p>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Create MetricsBar.astro**

```astro
---
// src/components/MetricsBar.astro
import { theme } from '../../theme.config';
---
<div class="bg-deep px-8 py-4 flex justify-center items-center gap-14">
  {theme.metrics.map((metric, i) => (
    <>
      {i > 0 && <div class="w-px h-7 bg-burgundy" />}
      <div class="text-center">
        <div class="text-accent text-xl font-bold">{metric.value}</div>
        <div class="text-muted text-[9px] uppercase tracking-widest mt-0.5">
          {metric.label}
        </div>
      </div>
    </>
  ))}
</div>
```

- [ ] **Step 3: Create HowItWorks.astro**

```astro
---
// src/components/HowItWorks.astro
import SectionLabel from './SectionLabel.astro';

const steps = [
  {
    title: 'Discovery Call',
    body: 'We talk honestly about where you are, where you want to go, and whether we\'re the right fit for each other.',
  },
  {
    title: 'Build Your Plan',
    body: 'A coaching engagement designed around your team, your culture, and the specific results you need to see.',
  },
  {
    title: 'Lead with Purpose',
    body: 'Ongoing accountability, frameworks, and coaching that build a sales culture you\'d be proud to stand behind.',
  },
];
---
<section class="bg-rich px-10 py-14">
  <div class="text-center mb-10">
    <SectionLabel text="How It Works" />
  </div>
  <div class="flex items-start justify-center gap-6 max-w-3xl mx-auto">
    {steps.map((step, i) => (
      <>
        {i > 0 && (
          <div class="text-burgundy text-2xl mt-4 flex-shrink-0">→</div>
        )}
        <div class="flex-1 text-center max-w-[200px]">
          <div class="w-9 h-9 bg-accent rounded-full flex items-center justify-center mx-auto mb-3 text-deep font-bold text-sm">
            {i + 1}
          </div>
          <h3 class="text-cream font-bold text-sm mb-2">{step.title}</h3>
          <p class="text-muted text-xs leading-relaxed">{step.body}</p>
        </div>
      </>
    ))}
  </div>
</section>
```

- [ ] **Step 4: Create CredibilityBar.astro**

```astro
---
// src/components/CredibilityBar.astro
import { theme } from '../../theme.config';
---
{theme.credibility.length > 0 && (
  <div class="bg-cream border-y border-muted/30 px-8 py-4 flex justify-center items-center gap-10 flex-wrap">
    <span class="text-muted text-[9px] uppercase tracking-[0.2em]">As Featured In</span>
    {theme.credibility.map((item) => (
      item.url
        ? <a href={item.url} class="text-muted text-xs hover:text-burgundy transition-colors">{item.name}</a>
        : <span class="text-muted text-xs">{item.name}</span>
    ))}
  </div>
)}
```

- [ ] **Step 5: Create Testimonial.astro**

```astro
---
// src/components/Testimonial.astro
interface Props {
  name: string;
  title: string;
  company: string;
  quote: string;
  result?: string;
}
const { name, title, company, quote, result } = Astro.props;
---
<section class="bg-cream px-10 py-14 text-center">
  <div class="text-burgundy text-4xl mb-4 font-heading">"</div>
  <blockquote class="text-pb-text text-base font-semibold leading-relaxed max-w-xl mx-auto italic mb-4">
    {quote}
  </blockquote>
  {result && (
    <p class="text-accent text-xs font-bold uppercase tracking-wider mb-4">{result}</p>
  )}
  <p class="text-muted text-[11px] uppercase tracking-wider">
    — {name}, {title}, {company}
  </p>
</section>
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Hero, MetricsBar, HowItWorks, CredibilityBar, Testimonial components"
```

---

## Task 7: Lead Magnet Form Component

**Files:**
- Create: `src/components/LeadMagnetForm.astro`

- [ ] **Step 1: Create LeadMagnetForm.astro**

Netlify Forms requires: `data-netlify="true"`, a hidden `form-name` input matching the `name` attribute, and a `method="POST"`. The `action` redirects to `/thank-you` on success.

```astro
---
// src/components/LeadMagnetForm.astro
// Netlify Forms: Netlify detects data-netlify="true" during build and wires up the form handler.
// No backend needed. Submission redirects to /thank-you.
import { theme } from '../../theme.config';

interface Props {
  formName?: string; // must match the hidden form-name input
  buttonText?: string;
}

const {
  formName = 'lead-magnet',
  buttonText = 'Get It Free',
} = Astro.props;
---
<form
  name={formName}
  method="POST"
  action="/thank-you"
  data-netlify="true"
  netlify-honeypot="bot-field"
  class="flex gap-2 justify-center max-w-md mx-auto"
>
  <!-- Netlify requires a hidden form-name field when using data-netlify -->
  <input type="hidden" name="form-name" value={formName} />
  <!-- Honeypot field: bots fill it, humans don't -->
  <p class="hidden" aria-hidden="true">
    <label>Don't fill this out: <input name="bot-field" /></label>
  </p>
  <input
    type="email"
    name="email"
    required
    placeholder="Your email address"
    class="flex-1 px-4 py-3 bg-cream text-pb-text text-sm placeholder:text-muted/70 border-none outline-none focus:ring-2 focus:ring-accent"
    aria-label="Email address"
  />
  <button
    type="submit"
    class="bg-accent text-deep text-[11px] font-bold uppercase tracking-wider px-5 py-3 whitespace-nowrap hover:brightness-110 transition-all"
  >
    {buttonText}
  </button>
</form>
<p class="text-center text-muted text-[10px] mt-3 tracking-wide">
  No spam, ever. Unsubscribe anytime.
</p>
```

- [ ] **Step 2: Write E2E test asserting form has correct Netlify attributes**

Create `tests/e2e/site.spec.ts` (start with this one test):
```typescript
import { test, expect } from '@playwright/test';

test.describe('Lead Magnet Form', () => {
  test('form on /start has correct Netlify attributes', async ({ page }) => {
    await page.goto('/start');
    const form = page.locator('form[name="lead-magnet"]');
    await expect(form).toHaveAttribute('data-netlify', 'true');
    await expect(form).toHaveAttribute('method', 'POST');
    await expect(form).toHaveAttribute('action', '/thank-you');
    // hidden form-name input is required by Netlify
    const hiddenInput = form.locator('input[name="form-name"]');
    await expect(hiddenInput).toHaveAttribute('value', 'lead-magnet');
  });

  test('email input is required', async ({ page }) => {
    await page.goto('/start');
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required');
  });
});
```

Note: this test will fail until `/start` page is created in Task 11. Keep the test — it will pass then.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: LeadMagnetForm component with Netlify Forms integration"
```

---

## Task 8: Homepage

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Create index.astro assembling all sections**

```astro
---
// src/pages/index.astro
import Page from '../layouts/Page.astro';
import SectionLabel from '../components/SectionLabel.astro';
import Hero from '../components/Hero.astro';
import MetricsBar from '../components/MetricsBar.astro';
import HowItWorks from '../components/HowItWorks.astro';
import CredibilityBar from '../components/CredibilityBar.astro';
import QuoteBlock from '../components/QuoteBlock.astro';
import LeadMagnetForm from '../components/LeadMagnetForm.astro';
import Testimonial from '../components/Testimonial.astro';
import { theme } from '../../theme.config';
import { getCollection } from 'astro:content';

const testimonialEntries = await getCollection('testimonials', ({ data }) => data.featured);
const featured = testimonialEntries[0]?.data;
---
<Page title="Sales Coaching & Consulting | Grounded in Faith">

  <Hero />
  <MetricsBar />

  <!-- Who I Work With -->
  <section class="bg-cream px-10 py-12 text-center border-b border-muted/20">
    <SectionLabel text="Who I Work With" />
    <h2 class="text-pb-text text-2xl font-bold mb-3 max-w-xl mx-auto leading-snug">
      Sales managers and small business owners building a team for the first time — who want to do it right from the start.
    </h2>
    <p class="text-muted text-sm leading-relaxed max-w-lg mx-auto">
      If you're leading a sales team of 3–30 people and feel the tension between hitting your numbers and building something you're proud of, you're exactly who this is for.
    </p>
  </section>

  <!-- The Problem -->
  <section class="bg-cream px-10 py-12 text-center max-w-2xl mx-auto">
    <SectionLabel text="The Problem" />
    <h2 class="text-pb-text text-2xl font-bold leading-snug mb-4">
      Most sales cultures are built on pressure, performance anxiety, and short-term thinking.
    </h2>
    <p class="text-pb-text/70 text-sm leading-relaxed">
      You know there's a better way — one built on integrity, genuine relationship, and results that compound. You just need someone who's built it before and knows how to get there.
    </p>
  </section>

  <HowItWorks />
  <CredibilityBar />

  <!-- What I Believe (taste) -->
  <section class="px-10 py-12 max-w-2xl mx-auto">
    <SectionLabel text="What I Believe" />
    <QuoteBlock
      quote="A sales organization is a discipleship environment. The question isn't whether you're forming your team — it's what you're forming them into."
      linkText="Read the full statement"
      linkHref="/about"
    />
  </section>

  <!-- Lead Magnet CTA -->
  <section class="bg-rich border-t-[3px] border-accent px-10 py-14 text-center">
    <SectionLabel text="Free Resource" />
    <h2 class="text-cream text-2xl font-bold mb-3">{theme.leadMagnet.title}</h2>
    <p class="text-muted text-sm mb-8 max-w-md mx-auto">{theme.leadMagnet.description}</p>
    <LeadMagnetForm />
  </section>

  <!-- Testimonial -->
  {featured && (
    <Testimonial
      name={featured.name}
      title={featured.title}
      company={featured.company}
      quote={featured.quote}
      result={featured.result}
    />
  )}

</Page>
```

- [ ] **Step 2: Add homepage E2E tests**

Append to `tests/e2e/site.spec.ts`:
```typescript
test.describe('Homepage', () => {
  test('loads and shows headline', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Something Greater');
  });

  test('primary CTA links to /start', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: /Get the Free Guide/i });
    await expect(cta).toHaveAttribute('href', '/start');
  });

  test('secondary CTA links to /contact', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: /Book a Discovery Call/i });
    await expect(cta).toHaveAttribute('href', '/contact');
  });

  test('nav has correct links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /About/i }).first()).toHaveAttribute('href', '/about');
    await expect(page.getByRole('link', { name: /Services/i }).first()).toHaveAttribute('href', '/services');
  });

  test('"What I Believe" section links to /about', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: /Read the full statement/i });
    await expect(link).toHaveAttribute('href', '/about');
  });
});
```

- [ ] **Step 3: Start dev server and verify homepage looks correct**

```bash
npm run dev
```

Open `http://localhost:4321` and visually verify all sections render: Hero → MetricsBar → Who I Work With → Problem → HowItWorks → CredibilityBar → What I Believe → Lead Magnet form → Footer.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: homepage with all sections assembled"
```

---

## Task 9: About Page

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: Create about.astro**

Three sections in order: Faith Statement → Coaching Philosophy → Founder Story.

```astro
---
// src/pages/about.astro
import Page from '../layouts/Page.astro';
import SectionLabel from '../components/SectionLabel.astro';
import QuoteBlock from '../components/QuoteBlock.astro';
import { theme } from '../../theme.config';
---
<Page
  title="What I Believe"
  description="The faith and philosophy behind PurposeBound Strategies."
>

  <!-- Page Hero -->
  <section class="bg-rich border-b-[3px] border-accent px-10 py-16 text-center">
    <SectionLabel text="About" />
    <h1 class="text-cream text-4xl font-bold mb-4">What I Believe</h1>
    <p class="text-muted text-sm max-w-md mx-auto leading-relaxed">
      The foundation isn't a philosophy. It's a Person — and everything flows from there.
    </p>
  </section>

  <!-- Section 1: Faith Statement -->
  <section class="bg-cream px-10 py-14 max-w-2xl mx-auto">
    <SectionLabel text="The Foundation" />
    <h2 class="text-pb-text text-2xl font-bold mb-6">
      I believe business is a calling, not just a career.
    </h2>
    <!-- PLACEHOLDER: Replace with full faith statement copy from founder.
         This section should address:
         - What he believes about God and vocation
         - The biblical basis for ethical, excellent work
         - What it means to honor Christ in a commercial context
         - How the "interior to exterior" principle applies to a business -->
    <div class="space-y-4 text-pb-text/80 text-sm leading-relaxed">
      <p>[Founder's faith statement — the scriptural and theological foundation for his work. This leads the page because the faith is not supplemental; it is the source.]</p>
      <p>[Relevant Scripture and how it shapes his understanding of sales, leadership, and business.]</p>
      <p>[What it means, practically, to build a business that honors Christ — from the inside out.]</p>
    </div>
  </section>

  <!-- Section 2: Coaching Philosophy -->
  <section class="bg-rich px-10 py-14">
    <div class="max-w-2xl mx-auto">
      <SectionLabel text="How This Shapes My Work" />
      <h2 class="text-cream text-2xl font-bold mb-6">
        A sales team is a culture. Culture forms people. People serve customers.
      </h2>
      <div class="space-y-4 text-muted text-sm leading-relaxed mb-8">
        <p>[How the faith foundation translates into coaching philosophy — what he actually does differently and why.]</p>
        <p>[His approach to accountability, performance, culture, and leadership development — grounded in conviction, not just technique.]</p>
      </div>
      <QuoteBlock
        quote="A sales organization is a discipleship environment. The question isn't whether you're forming your team — it's what you're forming them into."
      />
    </div>
  </section>

  <!-- Section 3: Founder Story -->
  <section class="bg-cream px-10 py-14 max-w-2xl mx-auto">
    <SectionLabel text="My Story" />
    <h2 class="text-pb-text text-2xl font-bold mb-6">
      {theme.founder.name !== '[Founder Name]' ? theme.founder.name : 'The Founder'}
    </h2>
    <div class="space-y-4 text-pb-text/80 text-sm leading-relaxed mb-10">
      <p>[Founder's background: sales career, leadership roles, formative experiences.]</p>
      <p>[The moment or season where faith and vocation came together — why he started PurposeBound.]</p>
      <p>[Who he is today and what drives him to do this work.]</p>
    </div>
    <a
      href="/contact"
      class="inline-block bg-accent text-deep text-[11px] font-bold uppercase tracking-wider px-6 py-3 hover:brightness-110 transition-all"
    >
      Book a Discovery Call
    </a>
  </section>

</Page>
```

- [ ] **Step 2: Add E2E test**

Append to `tests/e2e/site.spec.ts`:
```typescript
test.describe('/about page', () => {
  test('loads and shows title', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toContainText('What I Believe');
  });

  test('has a discovery call CTA', async ({ page }) => {
    await page.goto('/about');
    const cta = page.getByRole('link', { name: /Book a Discovery Call/i });
    await expect(cta).toHaveAttribute('href', '/contact');
  });
});
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: /about page — What I Believe with three sections"
```

---

## Task 10: Services Page

**Files:**
- Create: `src/components/ServiceCard.astro`
- Create: `src/pages/services.astro`

- [ ] **Step 1: Create ServiceCard.astro**

```astro
---
// src/components/ServiceCard.astro
interface Props {
  title: string;
  tagline: string;
  description: string;
  whoItIsFor: string;
  includes: string[];
  cta: string;
  limited: boolean;
}

const { title, tagline, description, whoItIsFor, includes, cta, limited } = Astro.props;
---
<div class="bg-deep p-8 flex flex-col">
  <div class="mb-6">
    <p class="text-accent text-[10px] uppercase tracking-[0.25em] mb-2">{tagline}</p>
    <h2 class="text-cream text-2xl font-bold mb-4">{title}</h2>
    <p class="text-muted text-sm leading-relaxed mb-4">{description}</p>
    <p class="text-muted/70 text-xs leading-relaxed italic">{whoItIsFor}</p>
  </div>

  <div class="mb-8 flex-1">
    <p class="text-accent text-[10px] uppercase tracking-widest mb-3">What's Included</p>
    <ul class="space-y-2">
      {includes.map((item) => (
        <li class="text-muted text-sm flex gap-2">
          <span class="text-accent mt-0.5 flex-shrink-0">→</span>
          {item}
        </li>
      ))}
    </ul>
  </div>

  {limited && (
    <p class="text-accent/80 text-[10px] uppercase tracking-widest mb-4 italic">
      Currently accepting limited engagements
    </p>
  )}

  <a
    href="/contact"
    class="inline-block bg-accent text-deep text-[11px] font-bold uppercase tracking-wider px-6 py-3 text-center hover:brightness-110 transition-all self-start"
  >
    {cta}
  </a>
</div>
```

- [ ] **Step 2: Create services.astro**

```astro
---
// src/pages/services.astro
import Page from '../layouts/Page.astro';
import SectionLabel from '../components/SectionLabel.astro';
import ServiceCard from '../components/ServiceCard.astro';
import { getCollection } from 'astro:content';

const services = await getCollection('services');
// Sort by order field so coaching (1) appears before consulting (2)
const sorted = services.sort((a, b) => a.data.order - b.data.order);
---
<Page
  title="Services"
  description="1:1 sales coaching and organizational consulting — grounded in Christian values."
>

  <section class="bg-rich border-b-[3px] border-accent px-10 py-16 text-center">
    <SectionLabel text="Services" />
    <h1 class="text-cream text-4xl font-bold mb-4">How We Work Together</h1>
    <p class="text-muted text-sm max-w-md mx-auto leading-relaxed">
      Every engagement is designed around your team and your context.
      No rigid programs — real work, with real accountability.
    </p>
  </section>

  <section class="bg-rich px-10 py-14">
    <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {sorted.map((service) => (
        <ServiceCard
          title={service.data.title}
          tagline={service.data.tagline}
          description={service.data.description}
          whoItIsFor={service.data.whoItIsFor}
          includes={service.data.includes}
          cta={service.data.cta}
          limited={service.data.limited}
        />
      ))}
    </div>
  </section>

  <!-- Bottom CTA -->
  <section class="bg-cream px-10 py-14 text-center">
    <p class="text-pb-text text-lg font-bold mb-6 max-w-lg mx-auto">
      Not sure which is right for you? Start with a conversation.
    </p>
    <a
      href="/contact"
      class="inline-block bg-accent text-deep text-[11px] font-bold uppercase tracking-wider px-8 py-4 hover:brightness-110 transition-all"
    >
      Book a Discovery Call
    </a>
  </section>

</Page>
```

- [ ] **Step 3: Add E2E test**

Append to `tests/e2e/site.spec.ts`:
```typescript
test.describe('/services page', () => {
  test('shows both service offerings', async ({ page }) => {
    await page.goto('/services');
    await expect(page.getByText('1:1 Coaching')).toBeVisible();
    await expect(page.getByText('Consulting')).toBeVisible();
  });

  test('consulting card shows limited engagements note', async ({ page }) => {
    await page.goto('/services');
    await expect(page.getByText(/Currently accepting limited engagements/i)).toBeVisible();
  });
});
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: ServiceCard component and /services page"
```

---

## Task 11: Lead Magnet Landing & Thank You Pages

**Files:**
- Create: `src/pages/start.astro`
- Create: `src/pages/thank-you.astro`

- [ ] **Step 1: Create start.astro**

Bare layout — no nav, no footer. Zero exit paths. This is a conversion page.

```astro
---
// src/pages/start.astro
import Bare from '../layouts/Bare.astro';
import LeadMagnetForm from '../components/LeadMagnetForm.astro';
import { theme } from '../../theme.config';
---
<Bare
  title="Get the Free Guide"
  description={theme.leadMagnet.description}
>
  <!-- Hero: the offer -->
  <section class="bg-rich border-b-[3px] border-accent px-10 py-16 text-center">
    <p class="text-accent text-[10px] uppercase tracking-[0.25em] mb-4">Free Resource</p>
    <h1 class="text-cream text-3xl font-bold mb-4 max-w-xl mx-auto leading-snug">
      {theme.leadMagnet.title}
    </h1>
    <p class="text-muted text-sm leading-relaxed max-w-md mx-auto mb-10">
      {theme.leadMagnet.description}
    </p>
    <LeadMagnetForm />
  </section>

  <!-- What's inside -->
  <section class="bg-cream px-10 py-14 max-w-xl mx-auto">
    <p class="text-burgundy text-[10px] uppercase tracking-[0.25em] mb-6 text-center">What's Inside</p>
    <ul class="space-y-4">
      {theme.leadMagnet.bullets.map((bullet) => (
        <li class="flex gap-3 text-pb-text text-sm leading-relaxed">
          <span class="text-accent font-bold flex-shrink-0 mt-0.5">→</span>
          {bullet}
        </li>
      ))}
    </ul>

    <!-- Phase 2 teaser slot: scorecard (leave placeholder, wire up in Phase 2) -->
    <div class="mt-12 pt-8 border-t border-muted/30 text-center">
      <p class="text-muted text-xs leading-relaxed max-w-xs mx-auto">
        Already doing the basics?
        <!-- DEBT: replace with scorecard link when Phase 2 is built -->
        The self-assessment scorecard is coming soon.
      </p>
    </div>
  </section>
</Bare>
```

- [ ] **Step 2: Create thank-you.astro**

```astro
---
// src/pages/thank-you.astro
// No nav, no footer — the user just converted. Give them one action: book the call.
import Bare from '../layouts/Bare.astro';
import { theme } from '../../theme.config';
---
<Bare title="You're in — check your email">
  <section class="bg-rich border-b-[3px] border-accent px-10 py-20 text-center min-h-screen flex flex-col items-center justify-center">
    <div class="max-w-lg mx-auto">
      <p class="text-accent text-[10px] uppercase tracking-[0.3em] mb-6">You're In</p>
      <h1 class="text-cream text-3xl font-bold mb-6">
        Your guide is on its way.
      </h1>
      <p class="text-muted text-sm leading-relaxed mb-4">
        Check your inbox — the guide will arrive in the next few minutes.
        If you don't see it, check your spam folder.
      </p>
      <p class="text-muted text-sm leading-relaxed mb-12">
        In the meantime — if you're ready to talk about what building a
        Christ-centered sales team looks like for you specifically, I'd
        love to have that conversation.
      </p>
      <a
        href={theme.calendly.url}
        class="inline-block bg-accent text-deep text-[11px] font-bold uppercase tracking-wider px-8 py-4 hover:brightness-110 transition-all"
        target="_blank"
        rel="noopener noreferrer"
      >
        Book a Discovery Call
      </a>
      <p class="text-muted/60 text-[10px] mt-4">No pressure. Just a conversation.</p>
    </div>
  </section>
</Bare>
```

- [ ] **Step 3: Run the Netlify form E2E tests (now /start exists)**

```bash
npx playwright test tests/e2e/site.spec.ts --grep "Lead Magnet"
```

Expected: both Netlify form tests pass.

- [ ] **Step 4: Add thank-you E2E test**

Append to `tests/e2e/site.spec.ts`:
```typescript
test.describe('/thank-you page', () => {
  test('shows confirmation and Calendly CTA', async ({ page }) => {
    await page.goto('/thank-you');
    await expect(page.locator('h1')).toContainText('on its way');
    // Should have the Calendly link
    const cta = page.getByRole('link', { name: /Book a Discovery Call/i });
    await expect(cta).toBeVisible();
  });

  test('has no nav or footer', async ({ page }) => {
    await page.goto('/thank-you');
    await expect(page.locator('nav')).toHaveCount(0);
    await expect(page.locator('footer')).toHaveCount(0);
  });
});
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: /start lead magnet landing and /thank-you confirmation pages"
```

---

## Task 12: Blog & Contact Pages

**Files:**
- Create: `src/pages/blog/index.astro`
- Create: `src/pages/contact.astro`

- [ ] **Step 1: Create blog/index.astro**

Launches with empty state. Grid is ready to populate — just add .md files to `src/content/blog/`.

```astro
---
// src/pages/blog/index.astro
import Page from '../../layouts/Page.astro';
import SectionLabel from '../../components/SectionLabel.astro';
import { getCollection } from 'astro:content';

const posts = await getCollection('blog', ({ data }) => !data.draft);
const sorted = posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---
<Page
  title="Blog"
  description="Thinking out loud about sales, leadership, and what it means to build something that honors God."
>
  <section class="bg-rich border-b-[3px] border-accent px-10 py-16 text-center">
    <SectionLabel text="Blog" />
    <h1 class="text-cream text-4xl font-bold mb-4">Thinking Out Loud</h1>
    <p class="text-muted text-sm max-w-md mx-auto leading-relaxed">
      On sales, leadership, and what it means to build something that honors God.
    </p>
  </section>

  <section class="bg-cream px-10 py-14">
    {sorted.length === 0 ? (
      <div class="max-w-xl mx-auto text-center py-20">
        <p class="text-pb-text/60 text-sm leading-relaxed italic">
          First post coming soon.
        </p>
      </div>
    ) : (
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {sorted.map((post) => (
          <a href={`/blog/${post.slug}`} class="group block bg-white border border-muted/30 hover:border-accent transition-colors p-6">
            {post.data.image && (
              <img src={post.data.image} alt="" class="w-full h-40 object-cover mb-4" />
            )}
            <p class="text-burgundy text-[10px] uppercase tracking-widest mb-2">
              {post.data.pubDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            <h2 class="text-pb-text font-bold text-base mb-2 group-hover:text-burgundy transition-colors">
              {post.data.title}
            </h2>
            <p class="text-pb-text/60 text-xs leading-relaxed">{post.data.description}</p>
          </a>
        ))}
      </div>
    )}
  </section>
</Page>
```

- [ ] **Step 2: Create contact.astro**

```astro
---
// src/pages/contact.astro
import Page from '../layouts/Page.astro';
import SectionLabel from '../components/SectionLabel.astro';
import { theme } from '../../theme.config';

const faq = [
  {
    q: 'What happens on the discovery call?',
    a: "We talk honestly about where you are, what you're trying to build, and whether coaching is the right next step. There's no pitch — just a real conversation.",
  },
  {
    q: 'How long is the call?',
    a: '30 minutes. That\'s enough to know if it\'s worth going deeper.',
  },
  {
    q: 'Who is this call for?',
    a: 'Sales managers, team leaders, and small business owners who want to build a sales culture they\'re proud of — and who are open to faith being part of the conversation.',
  },
  {
    q: 'What happens after the call?',
    a: "If we're a fit, I'll send a proposal for a coaching engagement. If we're not, I'll tell you honestly — and point you toward someone who might be.",
  },
];
---
<Page
  title="Book a Discovery Call"
  description="Start a conversation about building a sales team you're proud of."
>

  <section class="bg-rich border-b-[3px] border-accent px-10 py-16 text-center">
    <SectionLabel text="Contact" />
    <h1 class="text-cream text-4xl font-bold mb-4">Let's Have a Conversation</h1>
    <p class="text-muted text-sm max-w-md mx-auto leading-relaxed">
      No pitch. No pressure. Just an honest conversation about where you are
      and whether this is the right fit.
    </p>
  </section>

  <!-- Calendly embed -->
  <section class="bg-cream px-10 py-14">
    <div class="max-w-3xl mx-auto">
      <!-- Calendly inline widget -->
      <!-- DEBT: replace [handle] in theme.config.ts when Calendly account is set up -->
      <div
        class="calendly-inline-widget min-h-[650px]"
        data-url={theme.calendly.url}
        style="min-width:320px"
      />
      <script is:inline src="https://assets.calendly.com/assets/external/widget.js" async />
    </div>
  </section>

  <!-- FAQ -->
  <section class="bg-rich px-10 py-14">
    <div class="max-w-2xl mx-auto">
      <SectionLabel text="Before You Book" />
      <h2 class="text-cream text-2xl font-bold mb-8">Common Questions</h2>
      <div class="space-y-8">
        {faq.map((item) => (
          <div>
            <h3 class="text-accent font-bold text-sm mb-2">{item.q}</h3>
            <p class="text-muted text-sm leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  </section>

</Page>
```

- [ ] **Step 3: Add E2E tests**

Append to `tests/e2e/site.spec.ts`:
```typescript
test.describe('/blog page', () => {
  test('loads with empty state message', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1')).toContainText('Thinking Out Loud');
    // Empty state when no posts exist
    await expect(page.getByText(/First post coming soon/i)).toBeVisible();
  });
});

test.describe('/contact page', () => {
  test('loads and shows FAQ', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1')).toContainText('Conversation');
    await expect(page.getByText(/What happens on the discovery call/i)).toBeVisible();
  });
});
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: /blog index with empty state and /contact with Calendly + FAQ"
```

---

## Task 13: Netlify Configuration

**Files:**
- Create: `netlify.toml`
- Create: `public/favicon.svg`

- [ ] **Step 1: Create netlify.toml**

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

# Netlify Forms — detected automatically from data-netlify="true" in HTML
# No additional config needed for basic form handling.
# To add email notifications: Netlify Dashboard → Forms → lead-magnet → Notifications

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

# Cache static assets aggressively
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Redirect /admin to Decap CMS setup instructions until CMS is wired up
# DEBT: remove this redirect when Decap CMS is configured
[[redirects]]
  from = "/admin"
  to = "/"
  status = 302
```

- [ ] **Step 2: Create a minimal favicon.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="4" fill="#3d1520"/>
  <rect x="8" y="8" width="16" height="16" rx="2" fill="none" stroke="#c9a84c" stroke-width="2"/>
  <line x1="16" y1="8" x2="16" y2="24" stroke="#c9a84c" stroke-width="2"/>
  <line x1="8" y1="16" x2="24" y2="16" stroke="#c9a84c" stroke-width="2"/>
</svg>
```

- [ ] **Step 3: Verify production build succeeds**

```bash
npm run build
```

Expected: `dist/` directory created, all 7 pages appear as HTML files, no build errors.

Check that these files exist in dist/:
```bash
ls dist/
# Should show: index.html, about/, blog/, contact/, services/, start/, thank-you/
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: Netlify config, security headers, favicon"
```

---

## Task 14: Run Full E2E Test Suite

- [ ] **Step 1: Start dev server (background) and run all E2E tests**

```bash
npm run dev &
sleep 3
npx playwright test
```

Expected: all tests pass. If any fail, read the error and fix the component.

- [ ] **Step 2: Run unit tests**

```bash
npx vitest run
```

Expected: all unit tests pass.

- [ ] **Step 3: Fix any failures**

If tests fail, fix the underlying component or page. Do not skip tests.

- [ ] **Step 4: Commit if any fixes were made**

```bash
git add -A
git commit -m "fix: resolve E2E and unit test failures"
```

---

## Task 15: Deploy to Netlify

- [ ] **Step 1: Create GitHub repo and push**

```bash
# From project root
git remote add origin https://github.com/[handle]/purposebound-strategies.git
git push -u origin main
```

- [ ] **Step 2: Connect to Netlify**

1. Go to [app.netlify.com](https://app.netlify.com)
2. "Add new site" → "Import an existing project"
3. Connect GitHub → select `purposebound-strategies` repo
4. Build settings: Build command `npm run build`, Publish directory `dist`
5. Deploy

- [ ] **Step 3: Verify Netlify Forms detected**

After first deploy: Netlify Dashboard → Forms. Confirm `lead-magnet` form appears (Netlify detects it from the HTML during build).

- [ ] **Step 4: Test the live form submission**

On the deployed URL: go to `/start`, submit a test email, verify redirect to `/thank-you`.

- [ ] **Step 5: Update CLAUDE.md with confirmed commands and gotchas**

Create `CLAUDE.md` in the project root:

```markdown
# PurposeBound Strategies

Christian sales coaching website for [Founder Name]. Astro 5 + Tailwind + Netlify.

**Core value**: Lead capture → email nurture → discovery call.
**Stack**: Astro 5, Tailwind 3, Netlify Forms, Calendly, TypeScript

## Commands

\`\`\`bash
npm run dev      # Dev server at http://localhost:4321
npm run build    # Production build → dist/
npx vitest run   # Unit tests
npx playwright test  # E2E tests
\`\`\`

## Key Files

- \`theme.config.ts\` — ALL design tokens, content values, placeholder data. Start here.
- \`src/styles/global.css\` — CSS custom properties. Must stay in sync with theme.config.ts colors.
- \`src/content/\` — Content Collections: blog posts, testimonials, services
- \`netlify.toml\` — Build config, form handling, security headers

## Code Quality Rule (MANDATORY)

Every touch improves the code. No hacks without \`// DEBT:\`. All content from theme.config.ts or Content Collections — never hardcoded in components.

## Gotchas

1. **Netlify Forms**: requires \`data-netlify="true"\` AND a hidden \`<input name="form-name">\` matching the form's \`name\` attribute. Without the hidden input, form submissions silently fail.

2. **CSS color token naming**: Tailwind reserves \`text\` as a class name, so the body text color token is \`pb-text\` in Tailwind (\`text-pb-text\`) but \`--color-text\` as a CSS variable.

3. **theme.config.ts ↔ global.css sync**: Color values appear in both files. They must match. If you change a color in theme.config.ts, update the matching CSS variable in global.css too.

4. **Calendly URL placeholder**: \`theme.calendly.url\` contains \`[handle]\` until the real account URL is set. The Calendly embed will not render until this is updated.

## Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-24 | Astro + Netlify over WordPress | Client can upgrade to Decap CMS later; Netlify free tier sufficient; better Core Web Vitals |
| 2026-03-24 | theme.config.ts as single source | All tokens in one place; swap logo/colors/copy without touching components |
| 2026-03-24 | Bare layout for /start and /thank-you | Zero exit paths on conversion pages — no nav, no footer |
| 2026-03-24 | Netlify Forms over backend | No server needed; free tier handles small lead volumes; Decap CMS auth uses Netlify Identity anyway |
```

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "docs: add CLAUDE.md with project context and confirmed gotchas"
git push
```

---

## Placeholder Checklist (Before Launch)

These items block launch and require content from the founder:

- [ ] Founder's professional headshot → add to `public/images/founder.jpg`, update `theme.config.ts → founder.photo`
- [ ] Real logo → replace `public/logo-placeholder.svg`, update `theme.config.ts → brand.logo`
- [ ] Real metrics for results bar → update `theme.config.ts → metrics`
- [ ] Full "What I Believe" copy → replace placeholder text in `src/pages/about.astro`
- [ ] Real testimonial → update `src/content/testimonials/featured.json`
- [ ] Calendly URL → update `theme.config.ts → calendly.url`
- [ ] Email provider webhook → choose ConvertKit or MailerLite, update `theme.config.ts → email.webhookUrl`, configure in Netlify Dashboard → Forms → Notifications
- [ ] Guide PDF → upload to `public/downloads/` and link from `/thank-you` or email
- [ ] Domain name → update `astro.config.mjs → site` and `theme.config.ts → site.url`
- [ ] Credibility assets → update `theme.config.ts → credibility` array with real links
