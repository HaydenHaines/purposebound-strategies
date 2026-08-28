# Content Management Portal (Sveltia CMS) — Design

**Date:** 2026-08-27 · **Status:** approved by Hayden, pending implementation

## Goal

Give Tory Bryant (client) a self-service portal at `/admin` to edit all site copy,
blog posts, testimonials, services, images, the lead-magnet PDF, and site settings
(nav, name/tagline, Calendly, LinkedIn, contact email, founder profile, metrics,
credentials, FAQ). Saves publish immediately to the live site.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| CMS | Sveltia CMS (Decap-compatible) served from `public/admin/` | Actively maintained, fast UI, native GitHub backend + media uploads; no build step or npm dependency |
| Auth | GitHub backend via Netlify's OAuth provider; Tory uses a GitHub account with Write on the repo | Netlify **Git Gateway is deprecated** (no new setups), so the classic Identity email login is off the table. Netlify OAuth is supported and serverless. Tina Cloud (email login) rejected as a SaaS dependency. |
| Workflow | No editorial workflow — save commits to `main` → Netlify deploys | Single editor; blog already has a `draft` flag |
| Content storage | Astro Content Collections (`src/content/`) with Zod schemas | Already the pattern for blog/services/testimonials; typed; build fails loudly on bad data |
| `theme.config.ts` | Reduced to `brand.colors` + `brand.fonts` only | Design tokens stay code; everything else is content |

## Content model

All in `src/content/`, schemas in `src/content/config.ts`.

### `settings` (type: data, one file per entry)
- `site.json` — `name`, `tagline`, `description`, `url`, `nav[] {label, href}`, `social {linkedin}`, `calendly {url}`, `contactEmail`
- `founder.json` — `name`, `title`, `photo`, `bio`, `email`
- `leadMagnet.json` — `title`, `description`, `file` (PDF path at site root), `bullets[]`
- `contact.json` — `faq[] {q, a}`

### `pages` (type: data)
- `home.json` — `hero {kicker, headline[], subhead, primaryCta, secondaryCta}`, `benefits[] {text}`, `metrics[] {value, label}`, `intro {headline, body}`, `losePeople {headline, body}`, `founderBlurb`, `howItWorks {heading, steps[] {title, body}}`, `credibility {label, items[] {name, url}}`, `callout {headline, body}`, `banner {label, headline, subline, image}`, `whatIBelieve {quote, cta}`
- `about.json` — one object per section on the about page: `{headline, body}`; plus `statement`, `closing`

### Existing (unchanged)
`blog` (markdown), `services` (json), `testimonials` (json).

Rules: field names match what components already consume; no optional fields
unless the UI handles absence; array order = display order.

## CMS configuration

- `public/admin/index.html` — loads `https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js`; `<meta name="robots" content="noindex">`.
- `public/admin/config.yml`:
  - `backend: {name: github, repo: HaydenHaines/purposebound-strategies, branch: main}` (no `base_url` → Netlify OAuth provider by default)
  - `media_folder: public/images`, `public_folder: /images`; lead-magnet `file` field overrides to `media_folder: public`, `public_folder: /`
  - File collections: Settings (Site, Founder, Lead Magnet, Contact), Pages (Home, About)
  - Folder collections: Blog (`src/content/blog`, fields = schema, `draft` boolean, markdown body), Services, Testimonials
- `netlify.toml`: remove the `/admin → /` redirect (closes the DEBT note). `X-Frame-Options: DENY` stays.
- Sitemap: exclude `/admin` and drop `/alt`.

## One-time dashboard setup (Hayden)

1. GitHub → Settings → Developer settings → OAuth Apps → New: homepage `https://purposeboundstrategies.com`, callback `https://api.netlify.com/auth/done`.
2. Netlify → Site → Access & security → OAuth → Install provider → GitHub → paste Client ID/Secret.
3. GitHub repo → Settings → Collaborators → add Tory's GitHub account (Write).
4. Netlify → Site → Notifications → deploy failed → email Hayden.

## Refactor

- Pages/components read content via `getEntry()` instead of `theme.*`. No markup or style changes.
- Hardcoded copy in `index.astro` / `about.astro` moves to `home.json` / `about.json`.
- Delete dead code: `Hero.astro`, `alt.astro`, `brand.logo`.
- Update `CLAUDE.md`: key files, content location, `/admin` usage, Sveltia gotchas, decisions log.
- Write `docs/editing-your-site.md` — one-page guide for Tory.

## Failure handling

Invalid CMS save → Zod fails the Netlify build → live site stays on last good deploy → deploy-failure email to Hayden. Nothing broken ships.

## Testing

- Vitest: every content file parses against its schema; `theme.config.ts` exports only `brand`.
- Build parity: `dist/` HTML diff before/after refactor = empty (except `/alt` removal).
- Playwright: existing specs green; `/admin` returns 200 and loads the Sveltia script; `config.yml` parses and names every collection.
- Smoke after dashboard setup: Hayden logs in, edits a testimonial, confirms commit + deploy, reverts.

## Out of scope

Colors/fonts editing, editorial/preview workflow, MailerLite nurture, Decap CMS, Tina.
