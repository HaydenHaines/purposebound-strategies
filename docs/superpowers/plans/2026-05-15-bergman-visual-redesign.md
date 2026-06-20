# Bergman-Inspired Visual Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Bergman Marketing-inspired redesign of the PurposeBound homepage at `/alt`, accessible via an "Alternative Site" link on the current homepage. The current site is completely untouched. All work is on `main`.

**Architecture:** All redesign components are new files (`HeroAlt`, `BenefitBar`, `TestimonialGrid`, `ServiceIconCard`). The existing components (`Hero`, `MetricsBar`, `ServiceCard`, etc.) are never modified. `src/pages/alt.astro` assembles the redesigned layout using only the new components. `theme.config.ts` gets `benefits` added alongside the existing `metrics` — nothing is removed. When Tory approves the redesign, swap `alt.astro` → `index.astro` in a single commit.

**Tech Stack:** Astro 5, Tailwind 3, Google Fonts (Oswald), Vitest, Playwright

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/layouts/Base.astro` | Modify | Add Oswald to Google Fonts import (additive — no breakage) |
| `tailwind.config.mjs` | Modify | Register `display` font family (additive) |
| `theme.config.ts` | Modify | Add `benefits` array alongside existing `metrics` |
| `src/styles/global.css` | Modify | Add `.clip-diag-bottom`, `.clip-diag-top` utilities (additive) |
| `src/components/HeroAlt.astro` | **Create** | Bergman-style hero — Oswald all-caps, gold keyword highlight |
| `src/components/BenefitBar.astro` | **Create** | Checkmark outcome bar (Bergman checkmark strip) |
| `src/components/TestimonialGrid.astro` | **Create** | Static 3-column grid with star ratings |
| `src/components/ServiceIconCard.astro` | **Create** | Icon-first vertical service card (alt version of ServiceCard) |
| `src/content/config.ts` | Modify | Add optional `icon` field to services schema |
| `src/content/services/coaching.json` | Modify | Add `"icon": "shepherd"` |
| `src/content/services/consulting.json` | Modify | Add `"icon": "building"` |
| `src/pages/alt.astro` | **Create** | Redesigned homepage — assembles all new components |
| `src/pages/index.astro` | Modify (minor) | Add one "Alternative Site" preview link in footer area |
| `tests/theme.test.ts` | Modify | Add `benefits` length assertion; add `fonts.heading` check |
| `tests/collections.test.ts` | Modify | Add `icon` field assertion for services |
| `tests/e2e/site.spec.ts` | Modify | Fix stale base-path + CTA text + service name assertions |
| `playwright.config.ts` | Modify | Export `BASE_PATH` constant; fix `webServer.url` |

**Files never touched:**
`src/components/Hero.astro`, `src/components/MetricsBar.astro`, `src/components/ServiceCard.astro`, `src/components/TestimonialScroller.astro`, `src/pages/about.astro`, `src/pages/services.astro`, `src/pages/contact.astro`, `src/components/HowItWorks.astro`

---

### Task 1: Fix stale E2E tests (baseline audit)

The E2E tests were written before the GitHub Pages base path (`/purposebound-strategies`) was added and before several CTA labels were renamed. All `page.goto('/')` calls resolve to the wrong URL; several `getByText` assertions reference old copy. Fix these before any feature work so the suite is green on the current codebase.

**Files:**
- Modify: `playwright.config.ts`
- Modify: `tests/e2e/site.spec.ts`

- [ ] **Step 1: Run the existing E2E suite and record failures**

```bash
npx playwright test 2>&1 | head -80
```

Expected: Multiple failures — navigation errors because `page.goto('/')` hits `localhost:4321/` instead of `localhost:4321/purposebound-strategies/`; assertion failures on stale CTA names and service titles.

- [ ] **Step 2: Update playwright.config.ts to export BASE_PATH**

Replace the entire file:

```ts
import { defineConfig } from '@playwright/test';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4321;
export const BASE_PATH = '/purposebound-strategies';
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: BASE_URL,
  },
  webServer: {
    command: 'npm run dev',
    url: `${BASE_URL}${BASE_PATH}/`,
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 3: Rewrite site.spec.ts with correct base paths and current copy**

Replace the entire file:

```ts
import { test, expect } from '@playwright/test';
import { BASE_PATH } from '../../playwright.config';

const r = (path: string) => `${BASE_PATH}${path}`;

test.describe('Homepage', () => {
  test('loads and shows headline', async ({ page }) => {
    await page.goto(r('/'));
    await expect(page.locator('h1')).toContainText('Something Greater');
  });

  test('primary CTA links to /start', async ({ page }) => {
    await page.goto(r('/'));
    const cta = page.getByRole('link', { name: /Get the Free Guide/i });
    await expect(cta).toHaveAttribute('href', r('/start'));
  });

  test('secondary CTA links to /contact', async ({ page }) => {
    await page.goto(r('/'));
    const cta = page.getByRole('link', { name: /Start a Conversation/i }).first();
    await expect(cta).toHaveAttribute('href', r('/contact'));
  });

  test('nav has correct links', async ({ page }) => {
    await page.goto(r('/'));
    await expect(page.getByRole('link', { name: /About/i }).first()).toHaveAttribute('href', r('/about'));
    await expect(page.getByRole('link', { name: /Services/i }).first()).toHaveAttribute('href', r('/services'));
  });

  test('"What I Believe" section links to /about', async ({ page }) => {
    await page.goto(r('/'));
    const link = page.getByRole('link', { name: /Read the Full Statement/i });
    await expect(link).toHaveAttribute('href', r('/about'));
  });
});

test.describe('/about page', () => {
  test('loads and shows title', async ({ page }) => {
    await page.goto(r('/about'));
    await expect(page.locator('h1')).toContainText('What I Believe');
  });

  test('has a start a conversation CTA', async ({ page }) => {
    await page.goto(r('/about'));
    const cta = page.getByRole('link', { name: /Start a Conversation/i });
    await expect(cta).toHaveAttribute('href', r('/contact'));
  });
});

test.describe('Lead Magnet Form', () => {
  test('form on /start has correct Netlify attributes', async ({ page }) => {
    await page.goto(r('/start'));
    const form = page.locator('form[name="lead-magnet"]');
    await expect(form).toHaveAttribute('data-netlify', 'true');
    await expect(form).toHaveAttribute('method', 'POST');
    await expect(form).toHaveAttribute('action', r('/thank-you'));
    const hiddenInput = form.locator('input[name="form-name"]');
    await expect(hiddenInput).toHaveAttribute('value', 'lead-magnet');
  });

  test('email input is required', async ({ page }) => {
    await page.goto(r('/start'));
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required');
  });
});

test.describe('/thank-you page', () => {
  test('shows confirmation and Calendly CTA', async ({ page }) => {
    await page.goto(r('/thank-you'));
    await expect(page.locator('h1')).toContainText('on its way');
    const cta = page.getByRole('link', { name: /Book a Discovery Call/i });
    await expect(cta).toBeVisible();
  });

  test('has no nav or footer', async ({ page }) => {
    await page.goto(r('/thank-you'));
    await expect(page.locator('nav')).toHaveCount(0);
    await expect(page.locator('footer')).toHaveCount(0);
  });
});

test.describe('/services page', () => {
  test('shows both service offerings', async ({ page }) => {
    await page.goto(r('/services'));
    await expect(page.getByText('Leadership Coaching')).toBeVisible();
    await expect(page.getByText('Corporate Ministry')).toBeVisible();
  });

  test('consulting card shows limited engagements note', async ({ page }) => {
    await page.goto(r('/services'));
    await expect(page.getByText(/Currently accepting limited engagements/i)).toBeVisible();
  });
});

test.describe('/blog page', () => {
  test('loads with empty state message', async ({ page }) => {
    await page.goto(r('/blog'));
    await expect(page.locator('h1')).toContainText('Thinking Out Loud');
    await expect(page.getByText(/First post coming soon/i)).toBeVisible();
  });
});

test.describe('/contact page', () => {
  test('loads and shows FAQ', async ({ page }) => {
    await page.goto(r('/contact'));
    await expect(page.locator('h1')).toContainText('Conversation');
    await expect(page.getByText(/What happens on the call/i)).toBeVisible();
  });
});

test.describe('/alt page', () => {
  test('loads and shows redesigned headline', async ({ page }) => {
    await page.goto(r('/alt'));
    await expect(page.locator('h1')).toContainText('Something Greater');
  });

  test('has alternative site label', async ({ page }) => {
    await page.goto(r('/alt'));
    await expect(page.getByText(/Alternative Design/i)).toBeVisible();
  });
});
```

- [ ] **Step 4: Run E2E suite — expect `/alt` tests to fail (page doesn't exist yet), all others to pass**

```bash
npx playwright test 2>&1 | grep -E "passed|failed|error"
```

Expected: `alt page` describe block fails with "page not found"; all other tests pass.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts tests/e2e/site.spec.ts
git commit -m "fix: correct E2E base paths and stale CTA/service-name assertions"
```

---

### Task 2: Oswald display font system

Oswald (Google Fonts, weight 600–700) is added as an additive font family. No existing classes change — `font-heading` and `font-body` still resolve to Georgia. The new `font-display` class is only used in new components and `alt.astro`.

**Files:**
- Modify: `src/layouts/Base.astro` (line 32, Google Fonts link)
- Modify: `tailwind.config.mjs` (fontFamily block)
- Modify: `theme.config.ts` (add `display` font entry)
- Modify: `tests/theme.test.ts` (add font assertion)

- [ ] **Step 1: Add a failing test for the display font token**

In `tests/theme.test.ts`, add inside the existing `describe('theme.config', ...)`:

```ts
it('has Oswald as display font', () => {
  expect(theme.brand.fonts.display[0]).toBe('Oswald');
});
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npx vitest run tests/theme.test.ts
```

Expected: FAIL — `Cannot read properties of undefined (reading '0')` (the `display` key doesn't exist yet).

- [ ] **Step 3: Add Oswald to the Google Fonts link in Base.astro**

Replace line 32:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Oswald:wght@600;700&display=swap" rel="stylesheet" />
```

- [ ] **Step 4: Add display font to tailwind.config.mjs**

In the `fontFamily` block, add after `inter`:

```js
display: ['Oswald', 'Georgia', 'serif'],
```

Full block becomes:

```js
fontFamily: {
  heading:  ['Georgia', '"Times New Roman"', 'serif'],
  body:     ['Georgia', '"Times New Roman"', 'serif'],
  inter:    ['Inter', 'system-ui', 'sans-serif'],
  display:  ['Oswald', 'Georgia', 'serif'],
},
```

- [ ] **Step 5: Add display font to theme.config.ts fonts object**

In `theme.config.ts`, update the `fonts` block to:

```ts
fonts: {
  heading: ['Georgia', '"Times New Roman"', 'serif'],
  body: ['Georgia', '"Times New Roman"', 'serif'],
  display: ['Oswald', 'Georgia', 'serif'],
},
```

- [ ] **Step 6: Run all unit tests**

```bash
npx vitest run
```

Expected: All tests pass (the new `display` font assertion + all existing tests).

- [ ] **Step 7: Confirm build**

```bash
npm run build 2>&1 | tail -5
```

Expected: `7 page(s) built` with no errors.

- [ ] **Step 8: Commit**

```bash
git add src/layouts/Base.astro tailwind.config.mjs theme.config.ts tests/theme.test.ts
git commit -m "feat: add Oswald display font to type system (additive — no existing components change)"
```

---

### Task 3: Diagonal section CSS utilities + benefits token

Two additive CSS classes for angled section transitions. Also adds `benefits` to `theme.config.ts` alongside the existing `metrics` array — nothing is removed.

**Files:**
- Modify: `src/styles/global.css`
- Modify: `theme.config.ts`
- Modify: `tests/theme.test.ts`

- [ ] **Step 1: Add a failing test for benefits**

In `tests/theme.test.ts`, add inside `describe('theme.config', ...)`:

```ts
it('has exactly 3 benefits', () => {
  expect(theme.benefits).toHaveLength(3);
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run tests/theme.test.ts
```

Expected: FAIL — `theme.benefits is not iterable`.

- [ ] **Step 3: Add benefits to theme.config.ts (keep metrics)**

After the existing `metrics` array, add:

```ts
benefits: [
  { text: 'Form People, Not Just Drive Performance' },
  { text: 'Cultivate Spiritual Health' },
  { text: 'Anchor Culture in Kingdom Conviction' },
],
```

- [ ] **Step 4: Run tests to confirm**

```bash
npx vitest run tests/theme.test.ts
```

Expected: All tests pass.

- [ ] **Step 5: Add diagonal utilities to global.css**

Append after the existing `html { ... }` block:

```css
/* Diagonal section transitions — Bergman Marketing visual language */
.clip-diag-bottom {
  position: relative;
  z-index: 1;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 60px), 0 100%);
  padding-bottom: calc(3.5rem + 60px);
}

.clip-diag-top {
  position: relative;
  z-index: 2;
  clip-path: polygon(0 60px, 100% 0, 100% 100%, 0 100%);
  padding-top: calc(3.5rem + 60px);
  margin-top: -60px;
}
```

- [ ] **Step 6: Confirm build**

```bash
npm run build 2>&1 | tail -5
```

Expected: `7 page(s) built` with no errors.

- [ ] **Step 7: Commit**

```bash
git add src/styles/global.css theme.config.ts tests/theme.test.ts
git commit -m "feat: diagonal CSS utilities and benefits token for alt redesign"
```

---

### Task 4: New redesign components

Create the four new components used only by `alt.astro`. Nothing existing is modified.

**Files:**
- Create: `src/components/HeroAlt.astro`
- Create: `src/components/BenefitBar.astro`
- Create: `src/components/TestimonialGrid.astro`
- Create: `src/components/ServiceIconCard.astro`

- [ ] **Step 1: Create HeroAlt.astro**

```astro
---
// src/components/HeroAlt.astro
import { theme } from '../../theme.config';
const base = import.meta.env.BASE_URL;
---
<section class="bg-rich border-b-[3px] border-accent flex items-stretch min-h-[520px] relative overflow-hidden">
  <img
    src={`${base}${theme.brand.logo}`}
    alt=""
    aria-hidden="true"
    class="absolute left-0 top-1/2 -translate-y-1/2 h-[90%] opacity-[0.06] object-contain pointer-events-none select-none z-[1]"
  />
  <div class="flex-1 pl-16 pr-10 py-14 flex flex-col justify-center relative z-10">
    <p class="font-inter text-accent text-xs uppercase tracking-[0.3em] mb-5">
      Corporate Ministry · Workplace Discipleship · Spiritual Leadership
    </p>
    <h1 class="font-display uppercase text-cream font-bold leading-none mb-6" style="font-size: clamp(2.8rem, 6vw, 5rem); letter-spacing: 0.02em;">
      Build a Business That<br />
      Honors <span class="text-accent">Something Greater.</span>
    </h1>
    <p class="text-muted text-base leading-relaxed max-w-md mb-8">
      Your business is a mission field. We help faith-driven leaders build cultures
      that form people, not just drive performance.
    </p>
    <div class="flex gap-3 flex-wrap">
      <a
        href={`${base}/start`}
        class="font-inter bg-accent text-deep text-xs font-bold uppercase tracking-wider px-6 py-3 hover:brightness-110 transition-all"
      >
        Get the Free Guide
      </a>
      <a
        href={`${base}/contact`}
        class="font-inter border border-cream text-cream text-xs uppercase tracking-wider px-6 py-3 hover:bg-cream hover:text-deep transition-all"
      >
        Start a Conversation
      </a>
    </div>
  </div>
  <div class="w-72 flex-shrink-0 overflow-hidden relative z-10">
    <img
      src={`${base}${theme.founder.photo}`}
      alt={theme.founder.name}
      class="w-full h-full object-cover object-top"
    />
  </div>
</section>
```

- [ ] **Step 2: Create BenefitBar.astro**

```astro
---
// src/components/BenefitBar.astro
import { theme } from '../../theme.config';
---
<div class="bg-accent px-8 py-5 flex flex-wrap justify-center items-center gap-x-10 gap-y-3">
  {theme.benefits.map((benefit, i) => (
    <>
      {i > 0 && <span class="text-deep/40 hidden sm:inline">|</span>}
      <div class="flex items-center gap-2">
        <span class="text-deep text-lg font-bold leading-none">✓</span>
        <span class="font-display uppercase text-deep font-bold tracking-wide text-sm">
          {benefit.text}
        </span>
      </div>
    </>
  ))}
</div>
```

- [ ] **Step 3: Create TestimonialGrid.astro**

```astro
---
// src/components/TestimonialGrid.astro
interface Testimonial {
  name: string;
  title: string;
  company: string;
  quote: string;
  result?: string;
}
interface Props {
  testimonials: Testimonial[];
}
const { testimonials } = Astro.props;
const visible = testimonials.slice(0, 6);
---
<section class="bg-cream px-10 py-16">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
    {visible.map((t) => (
      <div class="bg-white border border-muted/20 px-7 py-8 flex flex-col">
        <div class="text-accent text-lg mb-4 tracking-widest">★★★★★</div>
        <blockquote class="text-pb-text text-sm leading-relaxed italic flex-1 mb-5">
          "{t.quote}"
        </blockquote>
        <p class="text-pb-text/50 text-[11px] uppercase tracking-wider">
          — {t.name}<br />
          <span class="font-normal normal-case not-italic">{t.title}{t.company ? `, ${t.company}` : ''}</span>
        </p>
      </div>
    ))}
  </div>
</section>
```

- [ ] **Step 4: Create ServiceIconCard.astro**

```astro
---
// src/components/ServiceIconCard.astro
interface Props {
  title: string;
  tagline: string;
  description: string;
  whoItIsFor: string;
  includes: string[];
  cta: string;
  limited: boolean;
  icon?: string;
}
const { title, tagline, description, whoItIsFor, includes, cta, limited, icon } = Astro.props;
const base = import.meta.env.BASE_URL;
---
<div class="bg-deep p-8 flex flex-col items-center text-center">
  {icon === 'shepherd' && (
    <svg class="w-16 h-16 text-accent mb-5" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="32" y1="20" x2="32" y2="58" />
      <path d="M32 20 Q32 8 24 8 Q16 8 16 16 Q16 22 24 22 Q28 22 32 20" />
      <line x1="26" y1="46" x2="38" y2="46" />
    </svg>
  )}
  {icon === 'building' && (
    <svg class="w-16 h-16 text-accent mb-5" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="12" y="24" width="40" height="34" />
      <polyline points="8,24 32,8 56,24" />
      <rect x="26" y="42" width="12" height="16" />
      <rect x="16" y="30" width="8" height="8" />
      <rect x="40" y="30" width="8" height="8" />
    </svg>
  )}
  <div class="mb-5 w-full">
    <p class="text-accent text-[10px] uppercase tracking-[0.25em] mb-2">{tagline}</p>
    <h2 class="font-display uppercase text-cream text-2xl font-bold mb-3 leading-tight">{title}</h2>
    <p class="text-muted text-sm leading-relaxed mb-3">{description}</p>
    <p class="text-muted/70 text-xs leading-relaxed italic">{whoItIsFor}</p>
  </div>
  <div class="mb-6 flex-1 w-full text-left">
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
    href={`${base}/contact`}
    class="font-inter inline-block bg-accent text-deep text-xs font-bold uppercase tracking-wider px-6 py-3 text-center hover:brightness-110 transition-all"
  >
    {cta}
  </a>
</div>
```

- [ ] **Step 5: Confirm build is clean (new components don't break anything)**

```bash
npm run build 2>&1 | tail -5
```

Expected: `7 page(s) built` (alt.astro doesn't exist yet — 7 pages, same as before, no errors).

- [ ] **Step 6: Commit**

```bash
git add src/components/HeroAlt.astro src/components/BenefitBar.astro src/components/TestimonialGrid.astro src/components/ServiceIconCard.astro
git commit -m "feat: add redesign components (HeroAlt, BenefitBar, TestimonialGrid, ServiceIconCard)"
```

---

### Task 5: Service icon data

Adds the `icon` field to the services content collection schema and both JSON files. The existing `ServiceCard` component is unaffected — it doesn't read this field.

**Files:**
- Modify: `src/content/config.ts`
- Modify: `src/content/services/coaching.json`
- Modify: `src/content/services/consulting.json`
- Modify: `tests/collections.test.ts`

- [ ] **Step 1: Add failing test for icon field**

In `tests/collections.test.ts`, add inside `describe('service seed data', ...)`:

```ts
it('coaching has an icon identifier', () => {
  expect(coaching).toHaveProperty('icon');
  expect(typeof coaching.icon).toBe('string');
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run tests/collections.test.ts
```

Expected: FAIL — `expected {} to have property 'icon'`

- [ ] **Step 3: Update services schema in src/content/config.ts**

Inside the `services` schema object, add after `order: z.number()`:

```ts
icon: z.enum(['shepherd', 'building']).optional(),
```

- [ ] **Step 4: Add icon to coaching.json**

Add `"icon": "shepherd"` as a field before `"order"`:

```json
{
  "title": "Leadership Coaching",
  "tagline": "Coaching | Shepherding | Stewarding",
  "description": "One-on-one coaching for faith-driven leaders carrying the weight of their organization's culture and people. Leading with conviction, shepherding your team well, and building a culture anchored in purpose.",
  "whoItIsFor": "Best for business owners, executives, and managers who want a trusted pastoral presence — someone to walk alongside them, pray with them, and help them lead from a place of spiritual clarity.",
  "includes": [
    "Monthly 1:1 coaching and stewarding sessions with Tory",
    "Prayer, accountability, and spiritual direction",
    "Decision discernment support and biblical counsel",
    "Discipleship accountability and growth",
    "Frameworks for developing and leading people",
    "Tools for building a culture of integrity and purpose",
    "A coaching approach grounded in Scripture and proven practice"
  ],
  "cta": "Start the Conversation",
  "limited": false,
  "icon": "shepherd",
  "order": 1
}
```

- [ ] **Step 5: Add icon to consulting.json**

```json
{
  "title": "Corporate Ministry",
  "tagline": "For Organizations",
  "description": "Organizational engagements to reshape culture, establish spiritual rhythms, and help your business become a mission field — nurturing the spiritual health of your people and anchoring your culture in Kingdom values.",
  "whoItIsFor": "Best for organizations whose culture doesn't match their values — or faith-driven businesses that want to build something intentional from the start.",
  "includes": [
    "Organizational culture assessment",
    "On-site presence",
    "Company-wide spiritual formation initiatives",
    "Leadership team coaching and shepherding",
    "Bible study and corporate ministry prayer facilitation",
    "Ongoing advisory and shepherding presence",
    "Light crisis support"
  ],
  "cta": "Start the Conversation",
  "limited": true,
  "icon": "building",
  "order": 2
}
```

- [ ] **Step 6: Run all unit tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/content/config.ts src/content/services/coaching.json src/content/services/consulting.json tests/collections.test.ts
git commit -m "feat: add icon field to services content collection"
```

---

### Task 6: Build alt.astro and link from current homepage

Create `src/pages/alt.astro` — the complete redesigned homepage using all new components. Then add one unobtrusive "Alternative Design" link to the current `index.astro`.

**Files:**
- Create: `src/pages/alt.astro`
- Modify: `src/pages/index.astro` (add one link at the bottom)

- [ ] **Step 1: Create src/pages/alt.astro**

```astro
---
// src/pages/alt.astro — Bergman-inspired redesign preview
import Page from '../layouts/Page.astro';
import SectionLabel from '../components/SectionLabel.astro';
import HeroAlt from '../components/HeroAlt.astro';
import BenefitBar from '../components/BenefitBar.astro';
import HowItWorks from '../components/HowItWorks.astro';
import CredibilityBar from '../components/CredibilityBar.astro';
import QuoteBlock from '../components/QuoteBlock.astro';
import LeadMagnetForm from '../components/LeadMagnetForm.astro';
import TestimonialGrid from '../components/TestimonialGrid.astro';
import ServiceIconCard from '../components/ServiceIconCard.astro';
import { theme } from '../../theme.config';
import { getCollection } from 'astro:content';

const testimonialEntries = await getCollection('testimonials');
const testimonials = testimonialEntries
  .sort((a, b) => (b.data.featured ? 1 : 0) - (a.data.featured ? 1 : 0))
  .map(e => e.data);

const serviceEntries = await getCollection('services');
const services = serviceEntries.sort((a, b) => a.data.order - b.data.order);

const base = import.meta.env.BASE_URL;
---
<Page title="Alternative Design Preview | PurposeBound Strategies">

  <!-- Preview banner -->
  <div class="bg-deep border-b-2 border-accent px-6 py-2 flex items-center justify-between">
    <p class="font-inter text-muted text-xs uppercase tracking-widest">
      Alternative Design Preview
    </p>
    <a href={`${base}/`} class="font-inter text-accent text-xs uppercase tracking-wider hover:text-cream transition-colors">
      ← Back to Current Site
    </a>
  </div>

  <HeroAlt />
  <BenefitBar />

  <!-- Who I Work With + The Problem — gold section with navy cards -->
  <section class="bg-accent clip-diag-bottom">
    <div class="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto px-10 pt-14 pb-4">
      <div class="bg-deep px-8 py-10">
        <SectionLabel text="Who I Work With" light />
        <h2 class="font-display uppercase text-cream text-3xl font-bold mb-4 leading-tight">
          Leaders Who Know Their Business Was Made for More.
        </h2>
        <p class="text-muted text-base leading-relaxed">
          If you're carrying the weight of your organization's culture — and quietly wondering if there's someone who can help you tend the souls in your care, not just the systems — you're exactly who this is for.
        </p>
      </div>
      <div class="bg-deep border-l-4 border-accent px-8 py-10">
        <SectionLabel text="The Problem" light />
        <h2 class="font-display uppercase text-cream text-3xl font-bold leading-tight mb-4">
          You Can Build a Thriving Business and Still Lose Your People.
        </h2>
        <p class="text-muted text-base leading-relaxed">
          Metrics don't shepherd hearts. Systems don't tend souls. If you sense there's more — for your people, your culture, your calling — PurposeBound Strategies was built for you.
        </p>
      </div>
    </div>
  </section>

  <!-- Meet Tory — white 50/50 Bergman founder block -->
  <section class="bg-cream clip-diag-top">
    <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-0 items-stretch px-10 py-16">
      <div class="overflow-hidden">
        <img
          src={`${base}${theme.founder.photo}`}
          alt={theme.founder.name}
          class="w-full h-full object-cover object-top"
          loading="lazy"
        />
      </div>
      <div class="flex flex-col justify-center pl-12">
        <SectionLabel text="Meet Tory" />
        <h2 class="font-display uppercase text-pb-text text-4xl font-bold leading-none mb-6">
          Hi, I'm Tory.
        </h2>
        <p class="text-pb-text/70 text-base leading-relaxed mb-4">
          Sales leader, coach, and Kingdom-minded guide — six million-dollar producers developed, 34 leaders taken from their desks to the mission field, and 25 years at the intersection of faith and professional excellence.
        </p>
        <blockquote class="border-l-4 border-accent pl-5 py-1 mb-8">
          <p class="text-pb-text/80 text-base font-bold italic leading-relaxed">
            "For 25 years I've watched leaders build organizations that succeed outwardly while quietly eroding inwardly. That gap is exactly where I work."
          </p>
        </blockquote>
        <a
          href={`${base}/about`}
          class="font-inter inline-block bg-accent text-deep text-xs font-bold uppercase tracking-wider px-6 py-3 hover:brightness-110 transition-all self-start"
        >
          Read His Story
        </a>
      </div>
    </div>
  </section>

  <HowItWorks />

  <!-- Services — gold section, icon cards -->
  <section class="bg-accent px-10 py-16">
    <div class="text-center mb-10">
      <SectionLabel text="Services" />
      <h2 class="font-display uppercase text-deep text-4xl font-bold leading-none">
        How We Work Together
      </h2>
    </div>
    <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {services.map((service) => (
        <ServiceIconCard
          title={service.data.title}
          tagline={service.data.tagline}
          description={service.data.description}
          whoItIsFor={service.data.whoItIsFor}
          includes={service.data.includes}
          cta={service.data.cta ?? "Let's Talk"}
          limited={service.data.limited}
          icon={service.data.icon}
        />
      ))}
    </div>
  </section>

  <CredibilityBar />

  <!-- Bold accent callout -->
  <section class="bg-accent px-10 py-16 text-center">
    <p class="font-display uppercase text-deep text-5xl font-bold leading-none max-w-2xl mx-auto" style="letter-spacing: 0.02em;">
      The Workplace Is a Mission Field.
    </p>
    <p class="text-deep/70 text-base mt-5 max-w-lg mx-auto leading-relaxed">
      The question isn't whether your organization is forming the people in it — it's what it's forming them into.
    </p>
  </section>

  <!-- Photo Banner -->
  <div class="relative h-72 overflow-hidden">
    <img
      src={`${base}/images/mission-group.jpg`}
      alt="Group on mission trip"
      class="w-full h-full object-cover object-center"
      loading="lazy"
    />
    <div class="absolute inset-0 bg-deep/65 flex flex-col items-center justify-center text-center px-10">
      <p class="text-accent text-xs uppercase tracking-[0.3em] mb-4">Ministry in the Marketplace</p>
      <p class="font-display uppercase text-cream text-3xl font-bold leading-none max-w-xl">
        Faith Doesn't Stop at the Office Door.
      </p>
      <p class="text-muted text-base mt-4 max-w-lg">
        34 leaders brought from their desks to the mission field — and back again, changed.
      </p>
    </div>
  </div>

  <!-- What I Believe -->
  <section class="px-10 py-10 max-w-2xl mx-auto">
    <SectionLabel text="What I Believe" />
    <QuoteBlock
      quote="A marketplace business is a discipleship environment. The question isn't whether you're forming your team — it's what you're forming them into."
    />
    <div class="mt-6 pl-6">
      <a
        href={`${base}/about`}
        class="font-inter inline-block bg-accent text-deep text-xs font-bold uppercase tracking-wider px-8 py-4 hover:brightness-110 transition-all"
      >
        Read the Full Statement
      </a>
    </div>
  </section>

  <!-- Lead Magnet CTA -->
  <section class="bg-rich border-t-[3px] border-accent px-10 py-14 text-center">
    <SectionLabel text="Free Resource" light />
    <h2 class="font-display uppercase text-cream text-3xl font-bold mb-3">{theme.leadMagnet.title}</h2>
    <p class="text-muted text-base mb-8 max-w-md mx-auto">{theme.leadMagnet.description}</p>
    <LeadMagnetForm />
  </section>

  <TestimonialGrid testimonials={testimonials} />

</Page>
```

- [ ] **Step 2: Add "Alternative Site" link to current index.astro**

In `src/pages/index.astro`, add just before the closing `</Page>` tag:

```astro
  <!-- Design preview link — remove when redesign is approved and swapped in -->
  <div class="bg-deep/60 px-8 py-3 text-center border-t border-muted/20">
    <a href={`${base}/alt`} class="font-inter text-muted text-xs uppercase tracking-widest hover:text-accent transition-colors">
      View Alternative Design →
    </a>
  </div>
```

- [ ] **Step 3: Run the full build**

```bash
npm run build 2>&1 | tail -5
```

Expected: `8 page(s) built` (now includes `/alt`) with no errors.

- [ ] **Step 4: Run all unit tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 5: Run E2E suite — /alt tests should now pass**

```bash
npx playwright test
```

Expected: All tests pass including the two new `/alt` tests.

- [ ] **Step 6: Commit**

```bash
git add src/pages/alt.astro src/pages/index.astro
git commit -m "feat: alt.astro redesign preview at /alt with link from current homepage"
```

---

### Final: Push to GitHub Pages

```bash
git push origin main
```

GitHub Actions deploys in ~2 minutes. Both URLs will be live:
- Current site: `https://haydenhaines.github.io/purposebound-strategies/`
- Redesign preview: `https://haydenhaines.github.io/purposebound-strategies/alt`

---

## Self-Review

**Spec coverage:**
- ✅ Oswald condensed headlines → Task 2 (font system) + Task 4 (`HeroAlt`, `BenefitBar`, `ServiceIconCard`, `alt.astro`)
- ✅ Gold as dominant section background → Task 6 (`alt.astro` — Who I Work With, Services, callout sections)
- ✅ Diagonal section transitions → Task 3 (CSS utilities) + Task 6 (applied in `alt.astro`)
- ✅ Checkmark outcome bar → Task 4 (`BenefitBar`) + Task 6
- ✅ 3-column testimonial grid with stars → Task 4 (`TestimonialGrid`) + Task 6
- ✅ 50/50 Bergman founder block → Task 6 (`alt.astro` "Meet Tory" section)
- ✅ Services icon grid → Task 4 (`ServiceIconCard`) + Task 5 (icon data) + Task 6
- ✅ Current site completely untouched (except one link) → architectural constraint confirmed
- ✅ All on `main` branch — no worktree → architectural constraint confirmed
- ✅ Stale E2E tests fixed → Task 1
- ✅ `/alt` E2E tests added → Task 1

**Placeholder scan:** None. Every step contains complete code.

**Type consistency:** `ServiceIconCard` Props interface matches `service.data` fields. `TestimonialGrid` `Testimonial` interface matches fields read from the collection. `icon?: string` in `ServiceIconCard` matches `service.data.icon` (typed as `'shepherd' | 'building' | undefined` by the Zod schema). `theme.benefits` is typed as `readonly { text: string }[]` via `as const`.
