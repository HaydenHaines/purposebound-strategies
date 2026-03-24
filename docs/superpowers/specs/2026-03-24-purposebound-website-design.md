# PurposeBound Strategies — Website Design Spec

**Date:** 2026-03-24
**Status:** Approved

---

## Overview

A marketing and lead-generation website for PurposeBound Strategies, a Christian sales coaching and management consulting company. The site establishes credibility with sales managers, team leaders, and small business owners building a sales function for the first time — and positions the brand for future corporate/enterprise consulting engagements.

**Core positioning:** Building a business that honors Christ in its structure, relationships, and actions — from the inside out.

**Core value delivered by the site:** Capture qualified leads via a free resource, nurture them via email, and convert them to discovery calls.

---

## Target Audience

**Primary (now):**
- Sales managers and team leaders (3–30 person teams)
- Small business owners building a sales function from scratch

**Aspirational (future):**
- Corporate executives / VP-level leaders seeking organizational transformation

**Who the site speaks to directly:** Sales leaders who feel the tension between hitting their numbers and building something they're proud of — and who want faith to be part of the answer, not just the background.

---

## Visual Identity

### Palette — "Stained Glass"
Deep structural colors with a single brilliant accent, used deliberately. Gold appears once per section — where the light catches.

| Token | Value | Role |
|-------|-------|------|
| `--color-deep` | `#2c1018` | Dark backgrounds, nav, footer |
| `--color-rich` | `#3d1520` | Hero, dark sections |
| `--color-accent` | `#c9a84c` | Gold — CTAs, labels, highlights |
| `--color-cream` | `#f7f5f0` | Light backgrounds, body sections |
| `--color-burgundy` | `#6b1e2e` | Section labels, links, borders |
| `--color-muted` | `#d9c4b8` | Body text on dark backgrounds |
| `--color-text` | `#2c1018` | Body text on light backgrounds |

### Typography
- **Headings:** Georgia (serif) — weight 700. Conveys authority, tradition, and substance.
- **Body:** System serif fallback or Georgia at lighter weight.
- **Labels/nav/CTAs:** Uppercase, wide letter-spacing, small size (10–11px). Creates formality.

All type tokens defined in `theme.config.ts` — no hardcoded values in components.

### Design Principle
The stained glass metaphor governs composition: rich, dark color provides structure and depth; the gold accent is used once per section as the moment of light. Never more than one gold element per visual section.

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Astro | Zero JS by default → fast Core Web Vitals → strong SEO |
| Styling | Tailwind CSS | Utility-first, pairs naturally with Astro |
| Content | Astro Content Collections | Markdown-based; maps directly to Decap CMS file structure |
| Theme | `theme.config.ts` | Single source of truth for colors, fonts, logo path |
| Hosting | Netlify | Free tier sufficient; native Decap CMS auth integration |
| Forms | Netlify Forms | Lead magnet capture; no backend required |
| Scheduling | Calendly embed | Discovery call booking on `/contact` |
| Email | TBD (ConvertKit or MailerLite recommended) | Nurture sequence after lead magnet signup |

### CMS Path (Decap-ready)
Content Collections are structured so Decap CMS can be added later with a `config.yml` + `/admin` route — no content refactoring needed. The client can then edit content through a browser UI at `/admin` without touching code.

---

## Site Structure

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Homepage | Flyer-style first impression + primary CTA |
| `/about` | What I Believe | Faith statement → coaching philosophy → founder story |
| `/services` | Services | 1:1 coaching + consulting offerings |
| `/start` | Lead Magnet Landing | Dedicated conversion page — no nav/footer |
| `/thank-you` | Thank You | Post-submission confirmation + next step CTA |
| `/blog` | Blog | Thought leadership (launches empty, ready to populate) |
| `/contact` | Contact / Book | Calendly embed + discovery call FAQ |

---

## Sales Funnel

### Funnel Architecture
```
Homepage / Blog post
    ↓
Lead Magnet Landing Page (/start)
  → Free Guide: "The 5 Pillars of a Christ-Centered Sales Culture"
  → Scorecard: "How Kingdom-Aligned Is Your Sales Team?" (Phase 2)
    ↓
Email Nurture Sequence (3–5 emails)
  → Value delivery: framework, Scripture, practical application
  → Soft CTA to book a call in emails 2–3
  → Direct CTA in email 4–5
    ↓
Discovery Call (/contact — Calendly)
    ↓
Coaching Engagement or Consulting Proposal
```

### Lead Magnet Strategy
- **Phase 1:** Guide PDF — "The 5 Pillars of a Christ-Centered Sales Culture." Lower production effort, immediate value.
- **Phase 2:** Scorecard — "How Kingdom-Aligned Is Your Sales Team?" Interactive self-assessment with scored results and tailored follow-up. Same email funnel, higher perceived value.
- Both use the same landing page template. Only the offer content swaps.

### Lead Magnet Landing Page (`/start`) Design
- No global nav or footer — zero exit paths
- Above fold: offer title, 3-line description, email capture form
- Below fold: "What's inside" bullet list (3–5 items), scorecard teaser (Phase 2 slot), small trust note ("No spam, ever. Unsubscribe anytime.")

---

## Homepage Sections (in order)

1. **Nav** — Logo left, gold nav links right, "Book a Call" gold button
2. **Hero** — Split layout: headline/CTAs left, founder photo right. Dark burgundy background, gold accent on key headline word. Two CTAs: "Get the Free Guide" (primary, gold) + "Book a Discovery Call" (secondary, outlined).
3. **Results Metrics Bar** — Dark background, 3 gold numbers: leaders coached, outcome metric, years experience. Placeholder values until real data collected.
4. **Who I Work With** — Light cream section. Specific: "sales managers and small business owners leading teams of 3–30 people." Speaks directly to the tension between numbers and integrity.
5. **The Problem** — Cream section. Names the pressure, performance anxiety, and short-term thinking that defines most sales cultures. Sets up the solution.
6. **How It Works** — Dark section. 3 steps: Discovery Call → Build Your Plan → Lead with Purpose. Gold numbered circles.
7. **Credibility Bar** — Subtle cream strip. "As Featured In / Certified By" — publications, speaking engagements, certifications. Placeholder until assets collected.
8. **What I Believe (taste)** — Gold left-border block quote. One sentence from the full belief statement. Link to `/about`.
9. **Lead Magnet CTA** — Dark section with gold top border. Guide title, short description, email capture form. Primary conversion point.
10. **Testimonial** — Cream section. One featured testimonial. Must include a specific result (metric or observable change), not just sentiment.
11. **Footer** — Dark. Logo + name left, minimal nav right.

---

## Supporting Pages

### `/about` — What I Believe
Three sections, in this order:
1. **Faith Statement** — The scriptural and theological foundation. What he believes about God, work, business, and what it means to honor Christ in a commercial context. This leads — it is not buried.
2. **Coaching Philosophy** — How that faith informs his approach to sales leadership, team culture, and performance. Practical and specific.
3. **Founder Story** — His background, experience, and why he started PurposeBound. Ends with a discovery call CTA.

### `/services`
Two primary offering cards:
- **1:1 Coaching** — For sales managers and leaders. Monthly engagement. Who it's for, what's included, CTA to book a call.
- **Consulting / Team Engagements** — For organizations. Scoped engagements. "Currently accepting limited engagements" note signals selectivity and scarcity.

No public pricing on either. Pricing is a discovery call conversation.

### `/start` — Lead Magnet Landing
Dedicated conversion page. No nav, no footer. See Funnel Architecture above. Form submission via Netlify Forms — on success, redirect to `/thank-you`.

### `/thank-you`
Post-submission confirmation page. No nav exit paths. Three elements: confirmation message ("Your guide is on its way"), a short "what happens next" note (check email, discovery call CTA), and a single "Book a Discovery Call" button. Enables conversion tracking via URL.

### `/blog`
Launches with a single placeholder message: *"Thinking out loud about sales, leadership, and what it means to build something that honors God. First post coming soon."* Grid layout ready to populate. Each post: featured image, title, 2-line excerpt, read time.

### `/contact`
- Short intro line above the embed
- Calendly embed (full width)
- Below: FAQ — what to expect on the call, how long, who it's for, what happens after

---

## Content Collections Structure

```
src/content/
  blog/              → Blog posts (Markdown + frontmatter)
  testimonials/      → Testimonial entries (name, title, company, quote, result)
  services/          → Service offering definitions
  config.ts          → Collection schemas (Zod validation)

theme.config.ts      → Colors, fonts, logo path, site name, tagline, contact info
```

All content is file-based. Decap CMS maps to this structure with no refactoring.

---

## Configuration

`theme.config.ts` is the single source of truth for:
- Color palette (all CSS custom properties)
- Font choices
- Logo path (swap when logo is delivered)
- Site name, tagline
- Founder name and title
- Contact email
- Calendly URL
- Social links
- Results metrics bar values (leaders coached, outcome stat, years experience) — placeholder strings until real data collected. Never hardcoded in markup.
- Email provider webhook URL (stubbed until provider is chosen — ConvertKit or MailerLite recommended)

No color values, logo paths, or contact details appear hardcoded in any component.

---

## Code Quality

All development follows the project Code Quality Rule (MANDATORY):
- Every touch improves the code
- No hacks without `// DEBT:` comments
- No magic numbers — all values from `theme.config.ts` or named constants
- No God components — files over 400 lines need splitting
- No hardcoded content — all copy lives in Content Collections or `theme.config.ts`
- Comments explain WHY, not WHAT
- Tests test behavior, not implementation

---

## Open Questions / Placeholders

These need real content before launch:

- [ ] Founder's professional headshot
- [ ] Logo file (placeholder in `theme.config.ts`)
- [ ] Real metrics for the results bar (leaders coached, outcome stat, years experience)
- [ ] At least one testimonial with a specific result
- [ ] Calendly account URL
- [ ] Email provider choice (ConvertKit or MailerLite recommended) + nurture sequence copy
- [ ] Guide PDF content ("The 5 Pillars of a Christ-Centered Sales Culture")
- [ ] Full "What I Believe" copy from founder
- [ ] Any credibility assets: media mentions, speaking engagements, certifications
- [ ] Domain name

---

## Out of Scope (Phase 1)

- Scorecard / self-assessment interactivity (Phase 2)
- Decap CMS setup (on-demand when client is ready to self-edit)
- Blog posts (structure ships, content comes later)
- WordPress migration (available if client prefers long-term)
- Membership or gated content
- Payment processing
