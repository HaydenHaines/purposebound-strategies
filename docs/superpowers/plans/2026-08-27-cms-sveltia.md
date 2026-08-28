# Sveltia CMS Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the client a self-service `/admin` portal (Sveltia CMS, GitHub login) that edits every piece of site copy, settings, images, and the lead-magnet PDF, publishing straight to `main`.

**Architecture:** All editable content moves out of `theme.config.ts` and page templates into Astro Content Collections under `src/content/` (typed with Zod). Pages/components read it with `getEntry()`. `theme.config.ts` shrinks to brand tokens (colors, fonts). A static `public/admin/` (HTML + `config.yml`) loads Sveltia from CDN; it authenticates through Netlify's GitHub OAuth provider and commits edits to `main`, which Netlify auto-deploys.

**Tech Stack:** Astro 5 (`astro:content` legacy collections in `src/content/`), Zod (bundled with Astro), Sveltia CMS (CDN), Netlify (hosting + OAuth provider), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-27-cms-design.md`

## Global Constraints

- Rendered HTML must not change: after every refactor task, `npm run build` output must match the baseline captured in Task 0 (only exceptions: `/alt` removed in Task 5, `/admin` added in Task 6).
- No `${base}` prefixes; all links are root-absolute (`/contact`).
- Components inside `bg-rich`/`bg-deep` sections keep passing `light` to `SectionLabel`/`QuoteBlock`.
- Every hack gets a `// DEBT:` comment; none are expected here.
- `theme.config.ts` colors ↔ `src/styles/global.css` must stay in sync (unchanged rule; colors are not touched).
- Content Collections: `type: 'data'` for JSON, `type: 'content'` for blog markdown. Schemas live in `src/content/config.ts`.
- Working branch: `cms-sveltia` (already exists, contains the spec). Commit after every task.
- Run from repo root `/Users/haydenhaines/Projects/ClaudeProjects/purposebound-strategies`.

## File map

| File | Responsibility |
|---|---|
| `src/content/config.ts` | Zod schemas for all collections (modify) |
| `src/content/settings/site.json` | name, tagline, description, url, nav, social, calendly, contactEmail (create) |
| `src/content/settings/founder.json` | name, title, photo, email (create) |
| `src/content/settings/leadMagnet.json` | title, description, file, bullets (create) |
| `src/content/settings/contact.json` | FAQ list (create) |
| `src/content/pages/home.json` | every string on the homepage (create) |
| `src/content/pages/about.json` | every string on the about page (create) |
| `theme.config.ts` | brand colors + fonts only (shrink) |
| `src/layouts/Base.astro`, `src/components/{Nav,Footer,HeroAlt,BenefitBar,HowItWorks,CredibilityBar}.astro`, `src/pages/{index,about,contact,start,thank-you,privacy}.astro` | read from collections (modify) |
| `src/components/{Hero,MetricsBar,TestimonialScroller}.astro`, `src/pages/alt.astro` | dead — delete |
| `public/admin/index.html`, `public/admin/config.yml` | Sveltia CMS (create) |
| `netlify.toml`, `astro.config.mjs` | drop `/admin` redirect; exclude `/admin` from sitemap (modify) |
| `tests/content.test.ts` | schema tests for every content file (create); `tests/theme.test.ts` (shrink) |
| `tests/e2e/site.spec.ts` | fix stale PDF assertion, drop `/alt`, add `/admin` (modify) |
| `tests/admin-config.test.ts` | `config.yml` parses and covers every collection/file (create) |
| `scripts/html-parity.sh` | build-output diff helper (create) |
| `CLAUDE.md`, `docs/editing-your-site.md` | docs (modify/create) |

---

### Task 0: Baseline, fix the already-failing E2E assertion

**Files:**
- Create: `scripts/html-parity.sh`
- Modify: `tests/e2e/site.spec.ts:93`

**Interfaces:**
- Produces: `scripts/html-parity.sh snapshot` → copies `dist/**/*.html` to `.parity/baseline/`; `scripts/html-parity.sh check` → builds and diffs against baseline, exit 1 on any difference. Later tasks call `check`.

- [ ] **Step 1: Confirm the stale assertion fails today**

Run: `npx playwright test -g "shows the gated download"`
Expected: FAIL — href is `/5-pillars-christ-centered-culture.pdf` but the test expects `/5-pillars-christ-centered-sales-culture.pdf` (the PDF was renamed on 2026-08-27 in commit 805d688 without updating the test).

- [ ] **Step 2: Fix the assertion**

In `tests/e2e/site.spec.ts` replace
```ts
    await expect(download).toHaveAttribute('href', '/5-pillars-christ-centered-sales-culture.pdf');
```
with
```ts
    await expect(download).toHaveAttribute('href', '/5-pillars-christ-centered-culture.pdf');
```

- [ ] **Step 3: Run it to verify it passes**

Run: `npx playwright test -g "shows the gated download"`
Expected: PASS

- [ ] **Step 4: Write the parity helper**

Create `scripts/html-parity.sh`:
```bash
#!/usr/bin/env bash
# Guards the CMS refactor: rendered HTML must not change.
# usage: scripts/html-parity.sh snapshot   # build + save baseline
#        scripts/html-parity.sh check      # build + diff against baseline
set -euo pipefail
cd "$(dirname "$0")/.."
BASE=.parity/baseline
CUR=.parity/current
npm run build --silent >/dev/null
case "${1:-}" in
  snapshot)
    rm -rf "$BASE"; mkdir -p "$BASE"
    (cd dist && find . -name '*.html' | cpio -pdm "../$BASE" 2>/dev/null)
    echo "baseline: $(find "$BASE" -name '*.html' | wc -l | tr -d ' ') pages" ;;
  check)
    rm -rf "$CUR"; mkdir -p "$CUR"
    (cd dist && find . -name '*.html' | cpio -pdm "../$CUR" 2>/dev/null)
    # Ignore pages that are intentionally added/removed (see plan Global Constraints).
    if diff -r -x 'alt' -x 'admin' "$BASE" "$CUR"; then echo "HTML parity: OK"; else echo "HTML parity: DIFF (see above)"; exit 1; fi ;;
  *) echo "usage: $0 snapshot|check"; exit 2 ;;
esac
```
Note: uses `cpio` (present on macOS) to copy with directory structure — `cp --parents` is GNU-only.

Run: `chmod +x scripts/html-parity.sh && echo ".parity/" >> .gitignore`

- [ ] **Step 5: Snapshot the baseline and verify `check` is green against itself**

Run: `scripts/html-parity.sh snapshot && scripts/html-parity.sh check`
Expected: `baseline: 13 pages` then `HTML parity: OK`

- [ ] **Step 6: Commit**

```bash
git add tests/e2e/site.spec.ts scripts/html-parity.sh .gitignore
git commit -m "test: fix stale PDF href assertion; add HTML parity guard for CMS refactor"
```

---

### Task 1: Settings collection — schemas + data + tests

**Files:**
- Modify: `src/content/config.ts`
- Create: `src/content/settings/site.json`, `src/content/settings/founder.json`, `src/content/settings/leadMagnet.json`, `src/content/settings/contact.json`
- Create: `tests/content.test.ts`

**Interfaces:**
- Produces collection `settings` with entries `site`, `founder`, `leadMagnet`, `contact`. Consumers use `const site = (await getEntry('settings', 'site')).data;` etc. Shapes exactly as in the JSON below.
- Produces exported schemas `settingsSchemas` (record keyed by entry id) from `src/content/config.ts` for tests.

- [ ] **Step 1: Write the failing test**

Create `tests/content.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { settingsSchemas } from '../src/content/config';
import site from '../src/content/settings/site.json';
import founder from '../src/content/settings/founder.json';
import leadMagnet from '../src/content/settings/leadMagnet.json';
import contact from '../src/content/settings/contact.json';

// Every content file the CMS can write must parse against its schema.
// This mirrors Astro's build-time validation so a bad save fails here first.
describe('settings collection', () => {
  it('site.json matches schema', () => {
    expect(() => settingsSchemas.site.parse(site)).not.toThrow();
    expect(site.nav.map((n) => n.href)).toEqual(['/about', '/services', '/blog']);
  });
  it('founder.json matches schema', () => {
    expect(() => settingsSchemas.founder.parse(founder)).not.toThrow();
  });
  it('leadMagnet.json matches schema and points at a file in public/', () => {
    expect(() => settingsSchemas.leadMagnet.parse(leadMagnet)).not.toThrow();
    expect(leadMagnet.file).toMatch(/^\/[^/].*\.pdf$/);
  });
  it('contact.json has at least one FAQ', () => {
    expect(() => settingsSchemas.contact.parse(contact)).not.toThrow();
    expect(contact.faq.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/content.test.ts`
Expected: FAIL — cannot resolve `../src/content/settings/site.json` / `settingsSchemas` not exported.

- [ ] **Step 3: Add schemas**

In `src/content/config.ts`, after the `services` definition and before `export const collections`, add:
```ts
// ---- Settings: site-wide values Tory edits in the CMS (one JSON file per entry) ----
const siteSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  url: z.string().url(),
  nav: z.array(z.object({ label: z.string(), href: z.string() })),
  social: z.object({ linkedin: z.string() }),
  calendly: z.object({ url: z.string().url() }),
  contactEmail: z.string().email(),
});

const founderSchema = z.object({
  name: z.string(),
  title: z.string(),
  photo: z.string(),
  email: z.string().email(),
});

const leadMagnetSchema = z.object({
  title: z.string(),
  description: z.string(),
  file: z.string(), // root-absolute path to the PDF in public/
  bullets: z.array(z.string()),
});

const contactSchema = z.object({
  faq: z.array(z.object({ q: z.string(), a: z.string() })),
});

// Exported for tests; Astro itself uses the union below.
export const settingsSchemas = {
  site: siteSchema,
  founder: founderSchema,
  leadMagnet: leadMagnetSchema,
  contact: contactSchema,
};

const settings = defineCollection({
  type: 'data',
  schema: z.union([siteSchema, founderSchema, leadMagnetSchema, contactSchema]),
});
```
and change the export to:
```ts
export const collections = { blog, testimonials, services, settings };
```

- [ ] **Step 4: Create the data files (values copied verbatim from `theme.config.ts`)**

`src/content/settings/site.json`:
```json
{
  "name": "PurposeBound Strategies",
  "tagline": "Equipping Leaders for Marketplace Ministry.",
  "description": "Corporate ministry and Kingdom-focused coaching for faith-driven leaders committed to bringing the Kingdom into the marketplace.",
  "url": "https://purposeboundstrategies.com",
  "nav": [
    { "label": "About", "href": "/about" },
    { "label": "Services", "href": "/services" },
    { "label": "Blog", "href": "/blog" }
  ],
  "social": { "linkedin": "https://www.linkedin.com/in/tory-bryant-84197973/" },
  "calendly": { "url": "https://calendly.com/twbryant1999/30min" },
  "contactEmail": "twbryant1999@gmail.com"
}
```

`src/content/settings/founder.json`:
```json
{
  "name": "Tory Bryant",
  "title": "Founder & Owner, PurposeBound Strategies",
  "photo": "/images/founder.jpg",
  "email": "twbryant1999@gmail.com"
}
```

`src/content/settings/leadMagnet.json`:
```json
{
  "title": "The 5 Pillars of a Christ-Centered Culture",
  "description": "A practical framework for faith-driven leaders who want to build something that lasts.",
  "file": "/5-pillars-christ-centered-culture.pdf",
  "bullets": [
    "A biblical foundation for each pillar, drawn from scripture and tested in real organizations",
    "Practical weekly actions that move principles from the page into everyday leadership",
    "Honest reflection prompts that reveal what your culture is actually forming in people"
  ]
}
```

`src/content/settings/contact.json`:
```json
{
  "faq": [
    { "q": "What happens on the call?", "a": "We talk honestly about where your organization is, what you're sensing God may be calling it toward, and whether a coaching relationship makes sense. There's no pitch — just a real conversation." },
    { "q": "How long is the call?", "a": "30 minutes. That's enough to know if it's worth going deeper." },
    { "q": "Who is this for?", "a": "Faith-driven business owners, executives, and leaders who sense their organization has a higher calling — and want a trusted guide to help them build it." },
    { "q": "What happens after the call?", "a": "If we're a fit, I'll send a proposal for a coaching engagement. If we're not, I'll tell you honestly — and point you toward someone who might be better suited." }
  ]
}
```

- [ ] **Step 5: Run tests and build**

Run: `npx vitest run && npm run build`
Expected: all tests PASS (existing 10 + 4 new); build completes with 13 pages. (Nothing consumes the collection yet, so the site is unchanged.)

Note: `tsconfig.json` must have `"resolveJsonModule": true` for the JSON imports — `tests/collections.test.ts` already imports JSON, so it does.

- [ ] **Step 6: Commit**

```bash
git add src/content/config.ts src/content/settings tests/content.test.ts
git commit -m "feat(content): settings collection (site, founder, leadMagnet, contact) with schemas + tests"
```

---

### Task 2: Point settings consumers at the collection

**Files:**
- Modify: `src/layouts/Base.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`, `src/pages/contact.astro`, `src/pages/start.astro`, `src/pages/thank-you.astro`, `src/pages/privacy.astro`, `src/pages/index.astro` (lead-magnet section + founder block only), `src/pages/about.astro` (founder photo/name only)

**Interfaces:**
- Consumes `getEntry('settings', <id>)` from Task 1.
- After this task no file except `theme.config.ts` itself references `theme.site`, `theme.nav`, `theme.social`, `theme.calendly`, `theme.contact`, `theme.leadMagnet`, or `theme.founder`.

Pattern for every file: replace `import { theme } from '../../theme.config';` with `import { getEntry } from 'astro:content';` (keep other imports), fetch the entries in frontmatter, and substitute in the template. Exact edits:

- [ ] **Step 1: `src/layouts/Base.astro`**

Frontmatter: replace the `theme` import with
```ts
import { getEntry } from 'astro:content';
import { settingsSchemas } from '../content/config';
const site = settingsSchemas.site.parse((await getEntry('settings', 'site'))!.data);
```
Then replace every `theme.site.name` → `site.name` (5 occurrences) and `theme.site.description` → `site.description` (1).

Why `parse`: the `settings` collection schema is a union, so `getEntry(...).data` is typed as the union. Re-parsing with the specific schema narrows it to the exact entry shape with no casts. It runs once per page at build time — negligible. Use this form in every consumer below.

- [ ] **Step 2: `src/components/Nav.astro` and `src/components/Footer.astro`**

Frontmatter (both):
```ts
import { getEntry } from 'astro:content';
import { settingsSchemas } from '../content/config';
const site = settingsSchemas.site.parse((await getEntry('settings', 'site'))!.data);
```
Template: `theme.site.name` → `site.name`; `theme.nav.map` → `site.nav.map`; in Footer `theme.social.linkedin` → `site.social.linkedin` (2 occurrences).

- [ ] **Step 3: `src/pages/contact.astro`**

Frontmatter:
```ts
import { getEntry } from 'astro:content';
import { settingsSchemas } from '../content/config';
const site = settingsSchemas.site.parse((await getEntry('settings', 'site'))!.data);
const contact = settingsSchemas.contact.parse((await getEntry('settings', 'contact'))!.data);
```
Template: `data-url={theme.calendly.url}` → `data-url={site.calendly.url}`; `theme.contact.faq.map` → `contact.faq.map`. Delete the stale comment line `<!-- DEBT: replace [handle] in theme.config.ts when Calendly account is set up -->` (Calendly is set).

- [ ] **Step 4: `src/pages/start.astro` and `src/pages/thank-you.astro`**

Frontmatter (start):
```ts
import { getEntry } from 'astro:content';
import { settingsSchemas } from '../content/config';
const leadMagnet = settingsSchemas.leadMagnet.parse((await getEntry('settings', 'leadMagnet'))!.data);
```
Replace `theme.leadMagnet.` → `leadMagnet.` (4 occurrences).

Frontmatter (thank-you): same two imports plus
```ts
const site = settingsSchemas.site.parse((await getEntry('settings', 'site'))!.data);
const leadMagnet = settingsSchemas.leadMagnet.parse((await getEntry('settings', 'leadMagnet'))!.data);
```
Replace `theme.leadMagnet.title` → `leadMagnet.title`, `theme.leadMagnet.file` → `leadMagnet.file`, `theme.calendly.url` → `site.calendly.url`.

- [ ] **Step 5: `src/pages/privacy.astro`**

Frontmatter: add the two imports and
```ts
const site = settingsSchemas.site.parse((await getEntry('settings', 'site'))!.data);
```
Replace `theme.site.name` → `site.name` (2) and `theme.founder.email` → `site.contactEmail` (2).

- [ ] **Step 6: `src/pages/index.astro` and `src/pages/about.astro` (settings references only)**

index frontmatter: replace the `theme` import with `import { settingsSchemas } from '../content/config';` (keep `getCollection` import, add `getEntry` to it) and
```ts
const founder = settingsSchemas.founder.parse((await getEntry('settings', 'founder'))!.data);
const leadMagnet = settingsSchemas.leadMagnet.parse((await getEntry('settings', 'leadMagnet'))!.data);
```
Template: `theme.founder.photo` → `founder.photo`, `theme.founder.name` → `founder.name`, `theme.leadMagnet.title` → `leadMagnet.title`, `theme.leadMagnet.description` → `leadMagnet.description`.

about frontmatter: replace the `theme` import with
```ts
import { getEntry } from 'astro:content';
import { settingsSchemas } from '../content/config';
const founder = settingsSchemas.founder.parse((await getEntry('settings', 'founder'))!.data);
```
Template: `theme.founder.photo` → `founder.photo`, `theme.founder.name` → `founder.name` (2).

- [ ] **Step 7: Verify no stragglers, parity, tests**

Run: `grep -rn "theme\.\(site\|nav\|social\|calendly\|contact\|leadMagnet\|founder\)" src` 
Expected: no output.

Run: `scripts/html-parity.sh check && npx vitest run && npx playwright test`
Expected: `HTML parity: OK`; vitest all pass; playwright all pass.

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "refactor: read site/founder/leadMagnet/contact settings from content collection"
```

---

### Task 3: Home page content → `pages/home.json`

**Files:**
- Modify: `src/content/config.ts`, `src/pages/index.astro`, `src/components/HeroAlt.astro`, `src/components/BenefitBar.astro`, `src/components/HowItWorks.astro`, `src/components/CredibilityBar.astro`
- Create: `src/content/pages/home.json`
- Modify: `tests/content.test.ts`

**Interfaces:**
- Produces collection `pages` entry `home`, schema `pageSchemas.home` exported from `src/content/config.ts`.
- `HeroAlt`, `BenefitBar`, `HowItWorks`, `CredibilityBar` fetch `home` themselves (no props) so `index.astro` stays a thin composition.

- [ ] **Step 1: Write the failing test**

Append to `tests/content.test.ts`:
```ts
import { pageSchemas } from '../src/content/config';
import home from '../src/content/pages/home.json';

describe('pages collection', () => {
  it('home.json matches schema', () => {
    expect(() => pageSchemas.home.parse(home)).not.toThrow();
    expect(home.benefits).toHaveLength(3);
    expect(home.howItWorks.steps).toHaveLength(3);
    expect(home.hero.headline).toContain('Something Greater');
  });
});
```
(Move the `import`s to the top of the file with the others.)

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/content.test.ts`
Expected: FAIL — `pageSchemas` not exported / `home.json` missing.

- [ ] **Step 3: Add the schema**

In `src/content/config.ts`, after the settings block:
```ts
// ---- Pages: every string on a page template, so Tory can edit copy without touching code ----
const homeSchema = z.object({
  meta: z.object({ title: z.string() }),
  hero: z.object({
    kicker: z.string(),
    headline: z.string(),          // plain part, e.g. "Build a Business That Honors"
    headlineAccent: z.string(),    // gold part, e.g. "Something Greater."
    subhead: z.string(),
    primaryCta: z.object({ label: z.string(), href: z.string() }),
    secondaryCta: z.object({ label: z.string(), href: z.string() }),
  }),
  benefits: z.array(z.object({ text: z.string() })),
  whoIWorkWith: z.object({ label: z.string(), headline: z.string(), body: z.string() }),
  problem: z.object({ label: z.string(), headline: z.string(), body: z.string() }),
  meetTory: z.object({
    label: z.string(),
    headline: z.string(),
    body: z.string(),
    quote: z.string(),
    cta: z.object({ label: z.string(), href: z.string() }),
  }),
  howItWorks: z.object({
    label: z.string(),
    steps: z.array(z.object({ title: z.string(), body: z.string() })),
    cta: z.object({ label: z.string(), href: z.string() }),
  }),
  services: z.object({ label: z.string(), headline: z.string() }),
  credibility: z.object({
    label: z.string(),
    items: z.array(z.object({ name: z.string(), url: z.string() })),
  }),
  callout: z.object({ headline: z.string(), body: z.string() }),
  banner: z.object({
    label: z.string(),
    headline: z.string(),
    subline: z.string(),
    image: z.string(),
    imageAlt: z.string(),
  }),
  whatIBelieve: z.object({
    label: z.string(),
    quote: z.string(),
    cta: z.object({ label: z.string(), href: z.string() }),
  }),
  freeResource: z.object({ label: z.string() }),
});

export const pageSchemas = { home: homeSchema };

const pages = defineCollection({
  type: 'data',
  schema: homeSchema, // Task 4 turns this into a union with aboutSchema
});
```
Export: `export const collections = { blog, testimonials, services, settings, pages };`

- [ ] **Step 4: Create `src/content/pages/home.json` (copy is verbatim from the current templates)**

```json
{
  "meta": { "title": "Professional Coaching & Marketplace Ministry" },
  "hero": {
    "kicker": "Marketplace Ministry ✦ Discipleship ✦ Spiritual Leadership",
    "headline": "Build a Business That Honors",
    "headlineAccent": "Something Greater.",
    "subhead": "Your business is a mission field. We help faith-driven leaders build cultures that form people, not just drive performance.",
    "primaryCta": { "label": "Get the Free Guide", "href": "/start" },
    "secondaryCta": { "label": "Let's Talk", "href": "/contact" }
  },
  "benefits": [
    { "text": "Shepherd Hearts, Not Just Systems" },
    { "text": "Cultivate Spiritual Health" },
    { "text": "Tend The Souls In Your Organization" }
  ],
  "whoIWorkWith": {
    "label": "Who I Work With",
    "headline": "Leaders Who Know Their Business Was Made for More.",
    "body": "If you're carrying the weight of your organization's culture — and quietly wondering if there's someone who can help you tend the souls in your care, not just the systems — you're exactly who this is for."
  },
  "problem": {
    "label": "The Problem",
    "headline": "You Can Build a Thriving Business and Still Lose Your People.",
    "body": "Metrics don't shepherd hearts. Systems don't tend souls. If you sense there's more — for your people, your culture, your calling — PurposeBound Strategies was built for you."
  },
  "meetTory": {
    "label": "Meet Tory",
    "headline": "Hi, I'm Tory.",
    "body": "Kingdom-minded catalyst, coach, and sales leader — led six, million-dollar producers, high school and collegiate athletes, 34 leaders taken from their desks to the mission field, and 25 years living at the intersection of faith and excellence.",
    "quote": "\"For 25 years I've watched leaders build thriving organizations while slowly losing what matters most. That gap is exactly where I work.\"",
    "cta": { "label": "Read His Story", "href": "/about" }
  },
  "howItWorks": {
    "label": "How It Works",
    "steps": [
      { "title": "Let's Talk", "body": "A candid conversation about where your organization is, where you sense it's called to go, and whether Tory is the right fit for that journey. No pitch — just discernment." },
      { "title": "Walk Together", "body": "An engagement shaped around your people, your culture, and the specific work God seems to be calling your organization into." },
      { "title": "Stop Building Alone", "body": "Ongoing presence, accountability, and equipping — because the most meaningful work isn't meant to be done in isolation." }
    ],
    "cta": { "label": "Let's Talk", "href": "/contact" }
  },
  "services": { "label": "Services", "headline": "How We Work Together" },
  "credibility": {
    "label": "Credentials & Recognition",
    "items": [
      { "name": "2024 Facilis Cares Award", "url": "" },
      { "name": "$20–25M Revenue Oversight", "url": "" },
      { "name": "Domestic & International Mission Leadership", "url": "" },
      { "name": "Ministry Integration & Operational Leadership", "url": "" },
      { "name": "25+ Years Building Leaders, Teams, and Kingdom Impact | 250+ People Developed", "url": "" },
      { "name": "M.S. Leadership & Professional Development", "url": "" }
    ]
  },
  "callout": {
    "headline": "The Workplace Is a Mission Field.",
    "body": "The question isn't whether your organization is forming the people in it — it's what it's forming them into."
  },
  "banner": {
    "label": "Ministry in the Marketplace",
    "headline": "Faith Doesn't Stop at the Office Door.",
    "subline": "34 leaders brought from their desks to the mission field — and back again, changed.",
    "image": "/images/mission-group.jpg",
    "imageAlt": "Group on mission trip"
  },
  "whatIBelieve": {
    "label": "What I Believe",
    "quote": "A business is a discipleship environment. The question isn't whether you're forming your team — it's what you're forming them into.",
    "cta": { "label": "Read the Full Statement", "href": "/about" }
  },
  "freeResource": { "label": "Free Resource" }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run tests/content.test.ts`
Expected: PASS.

- [ ] **Step 6: Refactor the four components**

Each component's frontmatter becomes:
```ts
import { getEntry } from 'astro:content';
import { pageSchemas } from '../content/config';
const home = pageSchemas.home.parse((await getEntry('pages', 'home'))!.data);
```
(`HowItWorks` keeps its `SectionLabel` import.)

`HeroAlt.astro` template substitutions (markup otherwise untouched):
- kicker `<p>` text → `{home.hero.kicker}`
- `<h1 …>Build a Business That Honors <span class="text-accent">Something Greater.</span></h1>` → `<h1 …>{home.hero.headline} <span class="text-accent">{home.hero.headlineAccent}</span></h1>`
- subhead `<p>` text → `{home.hero.subhead}`
- first `<a href={`/contact`}>Let's Talk</a>` → `href={home.hero.secondaryCta.href}` / `{home.hero.secondaryCta.label}`
- second `<a href={`/start`}>Get the Free Guide</a>` → `href={home.hero.primaryCta.href}` / `{home.hero.primaryCta.label}`

`BenefitBar.astro`: `theme.benefits.map` → `home.benefits.map`.

`HowItWorks.astro`: `<SectionLabel text="How It Works" light />` → `<SectionLabel text={home.howItWorks.label} light />`; `theme.howItWorks.steps.map` → `home.howItWorks.steps.map`; bottom CTA `href={`/contact`}` → `href={home.howItWorks.cta.href}` and text → `{home.howItWorks.cta.label}`.

`CredibilityBar.astro`: `theme.credibility.length` → `home.credibility.items.length`; `theme.credibilityLabel` → `home.credibility.label`; `theme.credibility.map` → `home.credibility.items.map`.

- [ ] **Step 7: Refactor `src/pages/index.astro`**

Frontmatter: add `const home = pageSchemas.home.parse((await getEntry('pages', 'home'))!.data);` (import `pageSchemas` alongside `settingsSchemas`). `<Page title="Professional Coaching & Marketplace Ministry">` → `<Page title={home.meta.title}>`.

Substitutions, top to bottom (keep every class attribute exactly):
- Who I Work With card: `text="Who I Work With"` → `text={home.whoIWorkWith.label}`; h2 text → `{home.whoIWorkWith.headline}`; p text → `{home.whoIWorkWith.body}`.
- Problem card: same with `home.problem.*`.
- Meet Tory: `text="Meet Tory"` → `{home.meetTory.label}`; h2 → `{home.meetTory.headline}`; p → `{home.meetTory.body}`; blockquote p → `{home.meetTory.quote}`; `<a href={`/about`}>Read His Story</a>` → `href={home.meetTory.cta.href}` / `{home.meetTory.cta.label}`.
- Services heading: `text="Services"` → `{home.services.label}`; h2 → `{home.services.headline}`.
- Callout: first p → `{home.callout.headline}`; second p → `{home.callout.body}`.
- Banner: both "Ministry in the Marketplace" `<p>`s → `{home.banner.label}`; both "Faith Doesn't Stop…" `<p>`s → `{home.banner.headline}`; subline → `{home.banner.subline}`; `src={`/images/mission-group.jpg`}` → `src={home.banner.image}`; `alt="Group on mission trip"` → `alt={home.banner.imageAlt}`.
- What I Believe: `text="What I Believe"` → `{home.whatIBelieve.label}`; `quote="…"` → `quote={home.whatIBelieve.quote}`; `<a href={`/about`}>Read the Full Statement</a>` → `href={home.whatIBelieve.cta.href}` / `{home.whatIBelieve.cta.label}`.
- Free Resource: `text="Free Resource"` → `text={home.freeResource.label}`.

- [ ] **Step 8: Verify parity + tests**

Run: `grep -n "theme" src/pages/index.astro src/components/HeroAlt.astro src/components/BenefitBar.astro src/components/HowItWorks.astro src/components/CredibilityBar.astro`
Expected: no output.

Run: `scripts/html-parity.sh check && npx vitest run && npx playwright test`
Expected: `HTML parity: OK`, all green. If parity diffs on whitespace inside a `<p>`, it's because a multi-line text node became `{expr}` — that is acceptable ONLY if the diff is whitespace-only; confirm with `diff -w` and note it in the commit message.

- [ ] **Step 9: Commit**

```bash
git add src tests/content.test.ts
git commit -m "refactor: homepage copy moves to content/pages/home.json"
```

---

### Task 4: About page content → `pages/about.json`

**Files:**
- Modify: `src/content/config.ts`, `src/pages/about.astro`, `tests/content.test.ts`
- Create: `src/content/pages/about.json`

**Interfaces:**
- Produces `pageSchemas.about`; `pages` collection schema becomes `z.union([homeSchema, aboutSchema])`.

- [ ] **Step 1: Write the failing test**

Append inside the `pages collection` describe in `tests/content.test.ts` (add `import about from '../src/content/pages/about.json';` at top):
```ts
  it('about.json matches schema', () => {
    expect(() => pageSchemas.about.parse(about)).not.toThrow();
    expect(about.story.sections.length).toBeGreaterThanOrEqual(4);
  });
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/content.test.ts` → FAIL (`pageSchemas.about` undefined).

- [ ] **Step 3: Add the schema**

In `src/content/config.ts` after `homeSchema`:
```ts
const aboutSchema = z.object({
  meta: z.object({ title: z.string(), description: z.string() }),
  hero: z.object({ label: z.string(), headline: z.string(), subhead: z.string() }),
  foundation: z.object({ label: z.string(), headline: z.string(), paragraphs: z.array(z.string()) }),
  philosophy: z.object({
    label: z.string(),
    headline: z.string(),
    subhead: z.string(),
    paragraphs: z.array(z.string()),
    quote: z.string(),
    image: z.string(),
    imageAlt: z.string(),
  }),
  story: z.object({
    label: z.string(),
    roles: z.string(),
    tagline: z.string(),
    intro: z.array(z.string()),
    sections: z.array(z.object({ heading: z.string(), paragraphs: z.array(z.string()) })),
    closing: z.string(),
    strengths: z.string(),
    image: z.string(),
    imageAlt: z.string(),
    cta: z.object({ label: z.string(), href: z.string() }),
  }),
});
```
Change `export const pageSchemas = { home: homeSchema, about: aboutSchema };` and the collection to `schema: z.union([homeSchema, aboutSchema]),`.

- [ ] **Step 4: Create `src/content/pages/about.json`**

Copy each paragraph verbatim from `src/pages/about.astro` (lines 203–291 of the file as of commit 805d688). Structure:
```json
{
  "meta": { "title": "What I Believe", "description": "The faith and philosophy behind PurposeBound Strategies." },
  "hero": {
    "label": "About",
    "headline": "What I Believe",
    "subhead": "The foundation isn't a philosophy. It's a Person — and everything flows from there."
  },
  "foundation": {
    "label": "The Foundation",
    "headline": "Your work is not separate from your calling. It was always meant to be the same thing.",
    "paragraphs": [
      "I didn't arrive at this conviction through a curriculum or a conference. …(verbatim)…",
      "I believe the marketplace is one of the largest mission fields in the world. …(verbatim)…",
      "PurposeBound Strategies exists to help business leaders see their work as both mission and ministry …(verbatim)…",
      "The world measures organizations by output and revenue. …(verbatim)…"
    ]
  },
  "philosophy": {
    "label": "How This Shapes My Work",
    "headline": "Everything in your organization is forming someone.",
    "subhead": "The only question is whether you're being intentional about it.",
    "paragraphs": [
      "A team is a culture. Culture forms people. …(verbatim)…",
      "The culture you build shapes the character of everyone in it. …(verbatim)…",
      "Through PurposeBound Strategies, I equip and empower leaders …(verbatim)…",
      "This isn't a framework you implement and forget. …(verbatim)…"
    ],
    "quote": "A business is a discipleship environment. The question isn't whether you're forming your team — it's what you're forming them into.",
    "image": "/images/purposebound-additional.jpg",
    "imageAlt": "Team members praying together during a mission outreach"
  },
  "story": {
    "label": "My Story",
    "roles": "Founder & Owner · Marketplace Ministry Leader · Sales Coach · Educator",
    "tagline": "Every role. One conviction. The workplace is a mission field — and the people in your care deserve a leader who knows it.",
    "intro": [
      "Tory Bryant is the Founder and Owner of PurposeBound Strategies, …(verbatim)…",
      "Tory serves organizations as a coach, steward, and shepherding presence …(verbatim)…"
    ],
    "sections": [
      { "heading": "Sales & Business Leadership", "paragraphs": ["Over 12 years as Sales Coach, …(verbatim)…"] },
      { "heading": "Coaching & Education", "paragraphs": ["A decorated coach and educator, …(verbatim)…", "Tory holds a Bachelor of Science …(verbatim)…"] },
      { "heading": "Ministry & Community", "paragraphs": ["Tory is deeply invested in community and Kingdom work. …(verbatim)…", "He is a current member of the Permian Basin …(verbatim)…"] }
    ],
    "closing": "PurposeBound Strategies is the culmination of that 25-year journey …(verbatim)…",
    "strengths": "Business Development · Leadership Development · Team Building · Sales Management · Ministry & Missions · Spiritual Formation · Shepherding · Coaching · Strategic Planning · Program Administration · Fundraising · Mentoring",
    "image": "/images/purposebound-group.jpg",
    "imageAlt": "PurposeBound Strategies team on mission",
    "cta": { "label": "Let's Talk", "href": "/contact" }
  }
}
```
"…(verbatim)…" means: paste the full paragraph exactly as it appears in `about.astro` — the parity check in Step 7 will catch any deviation. Note the on-page order is intro → Sales → Coaching → **closing paragraph** → Ministry → Core Strengths; the template in Step 6 reproduces that order, so `closing` is rendered between sections[1] and sections[2]. Escape `&` in JSON? No — JSON needs no escaping for `&`; but `"` inside text must be `\"`.

- [ ] **Step 5: Run the test → PASS**

Run: `npx vitest run tests/content.test.ts`

- [ ] **Step 6: Refactor `src/pages/about.astro`**

Frontmatter adds `import { pageSchemas } from '../content/config';` (already importing `settingsSchemas` — merge into one import) and
```ts
const about = pageSchemas.about.parse((await getEntry('pages', 'about'))!.data);
```
Template rewrite (all classes preserved; only text becomes expressions):
- `<Page title="What I Believe" description="…">` → `<Page title={about.meta.title} description={about.meta.description}>`
- Hero: label/h1/p → `about.hero.label` / `about.hero.headline` / `about.hero.subhead`.
- Foundation: label/h2 → `about.foundation.label`/`.headline`; the four `<p>` → `{about.foundation.paragraphs.map((p) => <p>{p}</p>)}`.
- Philosophy: label/h2/italic p → `about.philosophy.label`/`.headline`/`.subhead`; the four `<p>` → `{about.philosophy.paragraphs.map((p) => <p>{p}</p>)}`; `quote="…"` → `quote={about.philosophy.quote}`; img `src`/`alt` → `about.philosophy.image`/`.imageAlt`.
- Story: label → `about.story.label`; roles `<p>` → `{about.story.roles}`; tagline `<p>` → `{about.story.tagline}`; the two intro `<p>` → `{about.story.intro.map((p) => <p>{p}</p>)}`; then:
```astro
      {about.story.sections.slice(0, 2).map((s) => (
        <div>
          <p class="text-accent text-[10px] uppercase tracking-[0.25em] mb-3">{s.heading}</p>
          {s.paragraphs.map((p, i) => <p class={i > 0 ? 'mt-3' : undefined}>{p}</p>)}
        </div>
      ))}
      <p>{about.story.closing}</p>
      {about.story.sections.slice(2).map((s) => (
        <div>
          <p class="text-accent text-[10px] uppercase tracking-[0.25em] mb-3">{s.heading}</p>
          {s.paragraphs.map((p, i) => <p class={i > 0 ? 'mt-3' : undefined}>{p}</p>)}
        </div>
      ))}
      <div>
        <p class="text-accent text-[10px] uppercase tracking-[0.25em] mb-3">Core Strengths</p>
        <p class="text-pb-text/70">{about.story.strengths}</p>
      </div>
```
- Final img `src`/`alt` → `about.story.image`/`.imageAlt`; CTA `<a href={`/contact`}>Let's Talk</a>` → `href={about.story.cta.href}` / `{about.story.cta.label}`.

The "Core Strengths" heading stays literal — it's a structural label, not copy (same treatment as "© year" in the footer).

- [ ] **Step 7: Verify parity + tests**

Run: `scripts/html-parity.sh check && npx vitest run && npx playwright test`
Expected: `HTML parity: OK` (whitespace-only diffs acceptable per Task 3 Step 8 rule; `<p class="mt-3">` vs `<p>` with `class={undefined}` renders identically — Astro omits undefined attributes).

- [ ] **Step 8: Commit**

```bash
git add src tests/content.test.ts
git commit -m "refactor: about page copy moves to content/pages/about.json"
```

---

### Task 5: Shrink `theme.config.ts`, delete dead code

**Files:**
- Modify: `theme.config.ts`, `tests/theme.test.ts`, `tests/e2e/site.spec.ts`
- Delete: `src/components/Hero.astro`, `src/components/MetricsBar.astro`, `src/components/TestimonialScroller.astro`, `src/pages/alt.astro`

**Interfaces:**
- `theme.config.ts` exports `theme = { brand: { colors, fonts } }` only. `tailwind.config.*` may import `theme.brand` — check with `grep -n theme tailwind.config.*` before editing; if it references anything else, keep that key too and say so in the commit.

Spec deviation to record: the spec listed `metrics` as editable. `MetricsBar.astro` is not imported anywhere, so metrics are not displayed on the site; there is nothing for Tory to edit. Dropping them (and the dead component) rather than exposing a field with no effect.

- [ ] **Step 1: Confirm dead code is dead**

Run: `grep -rn "Hero\.astro\|MetricsBar\|TestimonialScroller\|theme\." src tailwind.config.* astro.config.mjs | grep -v "^src/components/\(Hero\|MetricsBar\|TestimonialScroller\)\.astro"`
Expected: only `theme.brand.*` references (tailwind config) — nothing else. If anything else appears, it was missed in Tasks 2–4: fix it there first.

- [ ] **Step 2: Update `tests/theme.test.ts` to the new shape (failing first)**

Delete the `has exactly 3 metrics`, `has a leadMagnet title`, and `has exactly 3 benefits` tests. Add:
```ts
  it('contains brand tokens only — all content lives in src/content/', () => {
    expect(Object.keys(theme)).toEqual(['brand']);
    expect(Object.keys(theme.brand).sort()).toEqual(['colors', 'fonts']);
  });
```
Run: `npx vitest run tests/theme.test.ts` → FAIL (keys include site, founder, …).

- [ ] **Step 3: Rewrite `theme.config.ts`**

```ts
// theme.config.ts — BRAND TOKENS ONLY.
// All copy, settings, and content live in src/content/ (edited via /admin).
// NOTE: CSS custom properties in src/styles/global.css must stay in sync with brand.colors.
// If you change a color here, update global.css to match.

export const theme = {
  brand: {
    // Palette: logo-aligned — deep navy + sphere blue + gold accent.
    // Gold is used ONCE per section as the moment the light catches. Not a pattern, a highlight.
    colors: {
      deep:     '#132240',   // nav, footer, darkest backgrounds
      rich:     '#1b3560',   // hero, dark sections
      accent:   '#d09b2a',   // gold — CTAs, labels, the light
      cream:    '#f7f5f0',   // light backgrounds, body sections
      link:     '#2573b6',   // logo sphere blue — section labels, links, borders on cream sections
      muted:    '#6a96b8',   // body text on dark backgrounds
      text:     '#132240',   // body text on light backgrounds
    },
    fonts: {
      heading: ['Georgia', '"Times New Roman"', 'serif'],
      body: ['Georgia', '"Times New Roman"', 'serif'],
      display: ['Oswald', 'Georgia', 'serif'],
    },
  },
} as const;

export type Theme = typeof theme;
```

- [ ] **Step 4: Delete dead files and the `/alt` E2E test**

Run: `git rm src/components/Hero.astro src/components/MetricsBar.astro src/components/TestimonialScroller.astro src/pages/alt.astro`

In `tests/e2e/site.spec.ts` delete the whole `test.describe('/alt page', …)` block.

- [ ] **Step 5: Verify**

Run: `npx vitest run && scripts/html-parity.sh check && npx playwright test`
Expected: vitest green; parity OK (build now 12 pages — `/alt` is excluded from the diff); playwright green. Also `curl`-free check that `/alt` is gone: `ls dist/alt` → "No such file".

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: theme.config.ts is brand tokens only; remove dead Hero/MetricsBar/TestimonialScroller/alt"
```

---

### Task 6: Sveltia CMS at `/admin`

**Files:**
- Create: `public/admin/index.html`, `public/admin/config.yml`, `tests/admin-config.test.ts`
- Modify: `netlify.toml`, `astro.config.mjs`, `tests/e2e/site.spec.ts`, `package.json` (dev dep `yaml`)

**Interfaces:**
- `config.yml` collection/file names and field names must match the JSON keys from Tasks 1–4 exactly (Sveltia writes those keys).

- [ ] **Step 1: Write the failing config test**

Run: `npm i -D yaml`

Create `tests/admin-config.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { parse } from 'yaml';

// The CMS config must stay in lock-step with the content collections.
const cfg = parse(readFileSync('public/admin/config.yml', 'utf8'));
const collections: any[] = cfg.collections;
const byName = (n: string) => collections.find((c) => c.name === n);

describe('public/admin/config.yml', () => {
  it('uses the GitHub backend on main with no Git Gateway', () => {
    expect(cfg.backend).toMatchObject({ name: 'github', repo: 'HaydenHaines/purposebound-strategies', branch: 'main' });
    expect(cfg.backend.base_url).toBeUndefined();
    expect(cfg.publish_mode).toBeUndefined(); // no editorial workflow: save = publish
  });
  it('stores media under public/images', () => {
    expect(cfg.media_folder).toBe('public/images');
    expect(cfg.public_folder).toBe('/images');
  });
  it('every settings/pages file entry points at an existing JSON file', () => {
    for (const c of ['settings', 'pages']) {
      for (const f of byName(c).files) expect(existsSync(f.file), f.file).toBe(true);
    }
  });
  it('folder collections point at the content dirs', () => {
    expect(byName('blog').folder).toBe('src/content/blog');
    expect(byName('services').folder).toBe('src/content/services');
    expect(byName('testimonials').folder).toBe('src/content/testimonials');
  });
  it('lead magnet PDF uploads to the site root', () => {
    const lm = byName('settings').files.find((f: any) => f.name === 'leadMagnet');
    const file = lm.fields.find((f: any) => f.name === 'file');
    expect(file).toMatchObject({ widget: 'file', media_folder: 'public', public_folder: '/' });
  });
});
```
Run: `npx vitest run tests/admin-config.test.ts` → FAIL (file missing).

- [ ] **Step 2: Create `public/admin/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>PurposeBound Strategies — Site Editor</title>
  </head>
  <body>
    <!-- Sveltia CMS (Decap-compatible). Auth: GitHub via Netlify's OAuth provider (configured in the Netlify dashboard). -->
    <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
  </body>
</html>
```

- [ ] **Step 3: Create `public/admin/config.yml`**

```yaml
# Sveltia CMS configuration — see docs/editing-your-site.md for the editor guide.
# Field names MUST match the Zod schemas in src/content/config.ts.
backend:
  name: github
  repo: HaydenHaines/purposebound-strategies
  branch: main
  # No base_url → Sveltia uses Netlify's GitHub OAuth provider (set up in Netlify → Access & security → OAuth).

site_url: https://purposeboundstrategies.com
display_url: https://purposeboundstrategies.com
logo_url: /favicon-512.png

media_folder: public/images
public_folder: /images

collections:
  # ---------- Settings ----------
  - name: settings
    label: Settings
    icon: settings
    files:
      - name: site
        label: Site
        file: src/content/settings/site.json
        format: json
        fields:
          - { name: name, label: Site Name, widget: string }
          - { name: tagline, label: Tagline, widget: string }
          - { name: description, label: Description (search engines & social), widget: text }
          - { name: url, label: Site URL, widget: string }
          - name: nav
            label: Navigation Links
            label_singular: Link
            widget: list
            fields:
              - { name: label, label: Label, widget: string }
              - { name: href, label: Path (e.g. /about), widget: string }
          - name: social
            label: Social
            widget: object
            fields:
              - { name: linkedin, label: LinkedIn URL, widget: string }
          - name: calendly
            label: Calendly
            widget: object
            fields:
              - { name: url, label: Booking URL, widget: string }
          - { name: contactEmail, label: Contact Email (privacy page), widget: string }

      - name: founder
        label: Founder
        file: src/content/settings/founder.json
        format: json
        fields:
          - { name: name, label: Name, widget: string }
          - { name: title, label: Title, widget: string }
          - { name: photo, label: Photo, widget: image }
          - { name: email, label: Email, widget: string }

      - name: leadMagnet
        label: Free Guide (Lead Magnet)
        file: src/content/settings/leadMagnet.json
        format: json
        fields:
          - { name: title, label: Title, widget: string }
          - { name: description, label: Description, widget: text }
          - name: file
            label: PDF File
            widget: file
            media_folder: public
            public_folder: /
            hint: Upload the PDF visitors download after submitting the form.
          - { name: bullets, label: "What's Inside (bullets)", label_singular: Bullet, widget: list }

      - name: contact
        label: Contact Page FAQ
        file: src/content/settings/contact.json
        format: json
        fields:
          - name: faq
            label: Questions
            label_singular: Question
            widget: list
            fields:
              - { name: q, label: Question, widget: string }
              - { name: a, label: Answer, widget: text }

  # ---------- Pages ----------
  - name: pages
    label: Pages
    icon: description
    files:
      - name: home
        label: Home Page
        file: src/content/pages/home.json
        format: json
        fields:
          - name: meta
            label: Browser Title
            widget: object
            fields:
              - { name: title, label: Title, widget: string }
          - name: hero
            label: Hero
            widget: object
            fields:
              - { name: kicker, label: Small line above headline, widget: string }
              - { name: headline, label: Headline (white part), widget: string }
              - { name: headlineAccent, label: Headline (gold part), widget: string }
              - { name: subhead, label: Subheadline, widget: text }
              - name: primaryCta
                label: Gold Button
                widget: object
                fields:
                  - { name: label, label: Label, widget: string }
                  - { name: href, label: Link, widget: string }
              - name: secondaryCta
                label: Outline Button
                widget: object
                fields:
                  - { name: label, label: Label, widget: string }
                  - { name: href, label: Link, widget: string }
          - name: benefits
            label: Gold Bar Benefits
            label_singular: Benefit
            widget: list
            fields:
              - { name: text, label: Text, widget: string }
          - name: whoIWorkWith
            label: Who I Work With
            widget: object
            fields:
              - { name: label, label: Small label, widget: string }
              - { name: headline, label: Headline, widget: string }
              - { name: body, label: Body, widget: text }
          - name: problem
            label: The Problem
            widget: object
            fields:
              - { name: label, label: Small label, widget: string }
              - { name: headline, label: Headline, widget: string }
              - { name: body, label: Body, widget: text }
          - name: meetTory
            label: Meet Tory
            widget: object
            fields:
              - { name: label, label: Small label, widget: string }
              - { name: headline, label: Headline, widget: string }
              - { name: body, label: Body, widget: text }
              - { name: quote, label: Pull quote, widget: text }
              - name: cta
                label: Button
                widget: object
                fields:
                  - { name: label, label: Label, widget: string }
                  - { name: href, label: Link, widget: string }
          - name: howItWorks
            label: How It Works
            widget: object
            fields:
              - { name: label, label: Small label, widget: string }
              - name: steps
                label: Steps
                label_singular: Step
                widget: list
                fields:
                  - { name: title, label: Title, widget: string }
                  - { name: body, label: Body, widget: text }
              - name: cta
                label: Button
                widget: object
                fields:
                  - { name: label, label: Label, widget: string }
                  - { name: href, label: Link, widget: string }
          - name: services
            label: Services Heading
            widget: object
            fields:
              - { name: label, label: Small label, widget: string }
              - { name: headline, label: Headline, widget: string }
          - name: credibility
            label: Credentials Bar
            widget: object
            fields:
              - { name: label, label: Small label, widget: string }
              - name: items
                label: Credentials
                label_singular: Credential
                widget: list
                fields:
                  - { name: name, label: Text, widget: string }
                  - { name: url, label: Link (optional), widget: string, required: false, default: "" }
          - name: callout
            label: Gold Callout
            widget: object
            fields:
              - { name: headline, label: Headline, widget: string }
              - { name: body, label: Body, widget: text }
          - name: banner
            label: Photo Banner
            widget: object
            fields:
              - { name: label, label: Small label, widget: string }
              - { name: headline, label: Headline, widget: string }
              - { name: subline, label: Line under headline, widget: string }
              - { name: image, label: Photo, widget: image }
              - { name: imageAlt, label: Photo description (accessibility), widget: string }
          - name: whatIBelieve
            label: What I Believe
            widget: object
            fields:
              - { name: label, label: Small label, widget: string }
              - { name: quote, label: Quote, widget: text }
              - name: cta
                label: Button
                widget: object
                fields:
                  - { name: label, label: Label, widget: string }
                  - { name: href, label: Link, widget: string }
          - name: freeResource
            label: Free Resource Section
            widget: object
            fields:
              - { name: label, label: Small label, widget: string }

      - name: about
        label: About Page
        file: src/content/pages/about.json
        format: json
        fields:
          - name: meta
            label: Browser Title & Description
            widget: object
            fields:
              - { name: title, label: Title, widget: string }
              - { name: description, label: Description, widget: text }
          - name: hero
            label: Page Header
            widget: object
            fields:
              - { name: label, label: Small label, widget: string }
              - { name: headline, label: Headline, widget: string }
              - { name: subhead, label: Subheadline, widget: text }
          - name: foundation
            label: The Foundation
            widget: object
            fields:
              - { name: label, label: Small label, widget: string }
              - { name: headline, label: Headline, widget: string }
              - { name: paragraphs, label: Paragraphs, label_singular: Paragraph, widget: list, field: { name: p, label: Paragraph, widget: text } }
          - name: philosophy
            label: How This Shapes My Work
            widget: object
            fields:
              - { name: label, label: Small label, widget: string }
              - { name: headline, label: Headline, widget: string }
              - { name: subhead, label: Italic line, widget: string }
              - { name: paragraphs, label: Paragraphs, label_singular: Paragraph, widget: list, field: { name: p, label: Paragraph, widget: text } }
              - { name: quote, label: Quote, widget: text }
              - { name: image, label: Photo, widget: image }
              - { name: imageAlt, label: Photo description, widget: string }
          - name: story
            label: My Story
            widget: object
            fields:
              - { name: label, label: Small label, widget: string }
              - { name: roles, label: Roles line (under name), widget: string }
              - { name: tagline, label: Italic tagline, widget: text }
              - { name: intro, label: Intro paragraphs, label_singular: Paragraph, widget: list, field: { name: p, label: Paragraph, widget: text } }
              - name: sections
                label: Story Sections
                label_singular: Section
                widget: list
                fields:
                  - { name: heading, label: Heading, widget: string }
                  - { name: paragraphs, label: Paragraphs, label_singular: Paragraph, widget: list, field: { name: p, label: Paragraph, widget: text } }
              - { name: closing, label: Closing paragraph (shown after the 2nd section), widget: text }
              - { name: strengths, label: Core strengths (· separated), widget: text }
              - { name: image, label: Photo, widget: image }
              - { name: imageAlt, label: Photo description, widget: string }
              - name: cta
                label: Button
                widget: object
                fields:
                  - { name: label, label: Label, widget: string }
                  - { name: href, label: Link, widget: string }

  # ---------- Blog ----------
  - name: blog
    label: Blog Posts
    label_singular: Post
    icon: article
    folder: src/content/blog
    create: true
    extension: md
    format: frontmatter
    slug: "{{slug}}"
    summary: "{{title}} — {{pubDate}}"
    fields:
      - { name: title, label: Title, widget: string }
      - { name: description, label: Short description, widget: text }
      - { name: pubDate, label: Publish date, widget: datetime, format: YYYY-MM-DD, time_format: false }
      - { name: author, label: Author, widget: string, default: Tory Bryant }
      - { name: image, label: Cover image, widget: image, required: false }
      - { name: draft, label: Draft (hide from site), widget: boolean, default: false }
      - { name: body, label: Body, widget: markdown }

  # ---------- Services ----------
  - name: services
    label: Services
    label_singular: Service
    icon: handshake
    folder: src/content/services
    create: true
    extension: json
    format: json
    slug: "{{slug}}"
    identifier_field: title
    fields:
      - { name: title, label: Title, widget: string }
      - { name: tagline, label: Tagline, widget: string }
      - { name: description, label: Description, widget: text }
      - { name: whoItIsFor, label: Who it's for, widget: text }
      - { name: includes, label: What's included, label_singular: Item, widget: list }
      - { name: cta, label: Button label, widget: string, default: "Let's Talk" }
      - { name: limited, label: Show "limited engagements" note, widget: boolean, default: false }
      - { name: icon, label: Icon, widget: select, options: [shepherd, building], required: false }
      - { name: order, label: Display order (1 = first), widget: number, value_type: int }

  # ---------- Testimonials ----------
  - name: testimonials
    label: Testimonials
    label_singular: Testimonial
    icon: format_quote
    folder: src/content/testimonials
    create: true
    extension: json
    format: json
    slug: "{{slug}}"
    identifier_field: name
    fields:
      - { name: name, label: Name, widget: string }
      - { name: title, label: Title, widget: string }
      - { name: company, label: Company, widget: string }
      - { name: quote, label: Quote, widget: text }
      - { name: result, label: Result (optional metric), widget: string, required: false }
      - { name: featured, label: Featured, widget: boolean, default: false }
```
Check the real blog frontmatter keys before finalizing the blog block: `head -8 src/content/blog/hearing-from-god.md`. If `pubDate` values contain a time, drop `time_format: false`.

- [ ] **Step 4: Run the config test → PASS**

Run: `npx vitest run tests/admin-config.test.ts`

- [ ] **Step 5: Remove the redirect, exclude `/admin` from the sitemap**

`netlify.toml`: delete the three-line `[[redirects]]` block and its two comment lines above it (the `/admin → /` redirect and its DEBT note).

`astro.config.mjs`:
```js
integrations: [tailwind(), sitemap({ filter: (page) => !page.includes('/admin') })],
```

- [ ] **Step 6: Add the E2E check**

Append to `tests/e2e/site.spec.ts`:
```ts
test.describe('/admin (CMS)', () => {
  test('serves the Sveltia editor shell', async ({ page }) => {
    const res = await page.goto(r('/admin/'));
    expect(res?.status()).toBe(200);
    await expect(page.locator('script[src*="sveltia-cms"]')).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
});
```

- [ ] **Step 7: Verify**

Run: `npm run build && ls dist/admin && grep -c admin dist/sitemap-0.xml; npx vitest run && npx playwright test`
Expected: `dist/admin` contains `index.html` and `config.yml`; grep prints `0`; all tests green. Parity check is not required here (no template changed) but run `scripts/html-parity.sh check` anyway — expected OK.

- [ ] **Step 8: Commit**

```bash
git add public/admin tests/admin-config.test.ts tests/e2e/site.spec.ts netlify.toml astro.config.mjs package.json package-lock.json
git commit -m "feat: Sveltia CMS at /admin (GitHub backend via Netlify OAuth); drop /admin redirect; hide from sitemap"
```

---

### Task 7: Docs, PR, dashboard handoff

**Files:**
- Modify: `CLAUDE.md`
- Create: `docs/editing-your-site.md`

- [ ] **Step 1: Update `CLAUDE.md`**

- **Key Files**: replace the `theme.config.ts` line with: ``- `theme.config.ts` — brand colors + fonts ONLY. All copy/settings live in `src/content/` (`settings/`, `pages/`, `blog/`, `services/`, `testimonials/`) and are edited by the client at `/admin`.`` Add: ``- `public/admin/config.yml` — Sveltia CMS field definitions; MUST mirror the Zod schemas in `src/content/config.ts` (test: `tests/admin-config.test.ts`).``
- **Code Quality Rule**: change "All content from theme.config.ts or Content Collections" to "All content from Content Collections (`src/content/`) — never hardcoded in components or `theme.config.ts`."
- **Gotchas**: delete #4 (Calendly placeholder — resolved). Add:
  - `10. **CMS ↔ schema lock-step**: adding a field means editing BOTH `src/content/config.ts` (Zod) and `public/admin/config.yml` (Sveltia) with the same key name. A key the schema doesn't know fails the build; a key the CMS doesn't know is invisible to Tory.`
  - `11. **CMS saves deploy live**: Sveltia commits straight to `main` (no editorial workflow). A save that violates a schema fails the Netlify build and the site stays on the last good deploy — check Netlify deploy logs when Tory reports "my change didn't show up".`
  - `12. **Auth is Netlify's GitHub OAuth provider, NOT Git Gateway** (Git Gateway is deprecated). Editors need a GitHub account with Write access to the repo. Never add `base_url` to `config.yml` unless replacing the auth provider.`
  - `13. **HTML parity guard**: `scripts/html-parity.sh snapshot|check` — use it for any refactor that must not change rendered output.`
- **Decisions log** add rows:
  - `| 2026-08-27 | Sveltia CMS (GitHub backend via Netlify OAuth) over Decap+Identity+Git Gateway | Git Gateway deprecated by Netlify; Sveltia is the maintained Decap-compatible successor; no servers, no SaaS. |`
  - `| 2026-08-27 | All copy moved from theme.config.ts + templates into Content Collections | Single typed source the CMS can write; theme.config.ts is brand tokens only. |`
  - `| 2026-08-27 | No editorial workflow | Single editor; save = publish; blog keeps its draft flag. |`
  - `| 2026-08-27 | Metrics removed (not migrated) | MetricsBar was never rendered; no value in exposing dead content to the editor. |`

- [ ] **Step 2: Write `docs/editing-your-site.md`** (for Tory; plain language)

```markdown
# Editing Your Website

**Editor:** https://purposeboundstrategies.com/admin/

1. Open the link above and click **Sign in with GitHub**. Use the GitHub account Hayden set up for you.
2. In the left sidebar pick what you want to edit:
   - **Pages → Home Page / About Page** — every headline and paragraph on those pages.
   - **Settings → Site** — site name, navigation links, LinkedIn, Calendly link.
   - **Settings → Founder** — your name, title, photo.
   - **Settings → Free Guide** — the PDF title, description, bullets, and the PDF file itself (click the file field → Upload).
   - **Settings → Contact Page FAQ** — the questions on the contact page.
   - **Blog Posts** — write new posts (turn **Draft** on to hide a post while you work on it).
   - **Services / Testimonials** — add, edit, reorder.
3. Make your change and click **Save** (top right). That's it — the site rebuilds itself and your change is live in about a minute.

**Photos:** click any photo field → **Upload** → pick a JPG/PNG. Keep photos under ~1 MB.

**Something didn't show up?** Wait two minutes and refresh. If it's still missing, text Hayden — a save can occasionally be rejected by the site's safety checks, and the site simply keeps showing the previous version until it's fixed.
```

- [ ] **Step 3: Final full verification**

Run: `npx vitest run && npm run build && npx playwright test && scripts/html-parity.sh check`
Expected: all green; 12 pages + `/admin`.

- [ ] **Step 4: Commit and open the PR**

```bash
git add CLAUDE.md docs/editing-your-site.md
git commit -m "docs: CMS gotchas + decisions; client editing guide"
git push -u origin cms-sveltia
gh pr create --title "Sveltia CMS portal at /admin; content moved to collections" --body "Implements docs/superpowers/specs/2026-08-27-cms-design.md. Rendered HTML unchanged (parity guard) except /alt removed and /admin added.

Post-merge dashboard steps (Hayden): see spec §One-time dashboard setup.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

- [ ] **Step 5: Hand off the dashboard steps (cannot be automated — need Hayden's GitHub + Netlify logins)**

Report to Hayden, verbatim:
1. GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**: name `PurposeBound CMS`, homepage `https://purposeboundstrategies.com`, callback `https://api.netlify.com/auth/done`. Copy Client ID + generate a Client Secret.
2. Netlify → site → **Site configuration → Access & security → OAuth → Install provider → GitHub** → paste ID + secret.
3. GitHub repo → **Settings → Collaborators → Add people** → Tory's GitHub username → role **Write**. (Create the account at github.com/signup with `twbryant1999@gmail.com` if he doesn't have one.)
4. Netlify → **Site configuration → Notifications → Deploy failed → Email** → Hayden's address.
5. Smoke test: visit `/admin/`, sign in, change a testimonial's `result`, Save, watch the Netlify deploy, confirm on the live site, then revert the same way.
