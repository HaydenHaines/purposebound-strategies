# PurposeBound Strategies

Christian/Kingdom marketplace-ministry & leadership coaching website for Tory Bryant. Astro 5 + Tailwind + Netlify.

**Core value:** Lead capture → email nurture → discovery call.
**Stack:** Astro 5, Tailwind 3, Netlify Forms, Calendly, TypeScript
**Repo:** https://github.com/HaydenHaines/purposebound-strategies
**Live:** https://purposeboundstrategies.com (Netlify, custom domain; auto-deploys on push to `main`)

## Commands

```bash
npm run dev      # Dev server at http://localhost:4321
npm run build    # Production build → dist/
npx vitest run   # Unit tests (theme.config + content collection shapes)
npx playwright test  # E2E tests (requires dev server — starts automatically)
```

## Reviewing the CMS locally

The Astro dev server does not serve `public/admin/index.html` at `/admin/` (upstream [withastro/astro#14800](https://github.com/withastro/astro/issues/14800)). Use `npm run build && npx astro preview` then open `http://localhost:4321/admin/` — or, in `npm run dev`, open `http://localhost:4321/admin/index.html` directly.

On localhost, Sveltia offers **"Work with Local Repository"** (Chrome/Edge) — pick the repo folder; edits write straight to the working tree with no GitHub login required. Discard test edits with `git checkout -- src/content public`.

## Key Files

- `theme.config.ts` — brand colors + fonts ONLY. All copy/settings live in `src/content/` (`settings/`, `pages/`, `blog/`, `services/`, `testimonials/`) and are edited by the client at `/admin`.
- `src/styles/global.css` — CSS custom properties. Must stay in sync with theme.config.ts colors.
- `src/content/` — Content Collections: blog posts, testimonials, services
- `public/admin/config.yml` — Sveltia CMS field definitions; MUST mirror the Zod schemas in `src/content/config.ts` (test: `tests/admin-config.test.ts`).
- `netlify.toml` — Build config, form handling, security headers

## Code Quality Rule (MANDATORY)

Every touch improves the code. No hacks without `// DEBT:`. All content from Content Collections (`src/content/`) — never hardcoded in components or `theme.config.ts`.

## Gotchas

1. **Netlify Forms**: requires `data-netlify="true"` AND a hidden `<input name="form-name">` matching the form's `name` attribute. **Form detection must also be enabled in the Netlify dashboard** (Site config → Forms) and the site redeployed afterward — it is OFF by default on newer sites. If it's off, every submission POSTs to a 404 (this exact bug bit us 2026-06-19). Submissions land in Forms → `lead-magnet`; an email notification to Tory (`twbryant1999@gmail.com`) is configured in the dashboard, not in code.

2. **CSS color token naming**: Tailwind reserves `text` as a class name, so the body text color token is `pb-text` in Tailwind (`text-pb-text`) but `--color-text` as a CSS variable.

3. **theme.config.ts ↔ global.css sync**: Color values appear in both files. They must match. If you change a color in theme.config.ts, update the matching CSS variable in global.css too.

5. **Vitest excludes E2E tests**: `vitest.config.ts` explicitly excludes `tests/e2e/**`. Do not remove this — Vitest would otherwise pick up Playwright spec files and fail on `test.describe()`.

6. **Astro dev toolbar disabled**: `astro.config.mjs` has `devToolbar: { enabled: false }`. Without this, the toolbar injects extra `<h1>` elements into pages, breaking Playwright's strict-mode locator assertions.

7. **Consulting CTA**: `src/content/services/consulting.json` uses "Start the Conversation" as the CTA (not "Inquire About Consulting"). This was changed during testing to avoid E2E test ambiguity — do not revert.

8. **No `base` path — deploys at root**: the site is served at the domain root on Netlify, so `astro.config.mjs` has no `base`. All internal links/assets are plain root-absolute paths (`href="/contact"`, `src="/logo.png"`) — do NOT reintroduce `${base}` prefixes (they'd render `//path`, a broken protocol-relative URL). (Historical: an earlier GitHub Pages deploy used `base: '/purposebound-strategies'`; that's gone.)

9. **SectionLabel and QuoteBlock on dark sections**: Both components have a `light` boolean prop. Always pass `light` when the component sits inside a `bg-rich` or `bg-deep` section — without it, `text-link` (#2573b6) and `text-pb-text` (#132240) are near-invisible on the dark backgrounds (#1b3560 / #132240). Default (no prop) = dark text for cream/light sections.

10. **CMS ↔ schema lock-step**: adding a field means editing BOTH `src/content/config.ts` (Zod) and `public/admin/config.yml` (Sveltia) with the same key name. A key the schema doesn't know fails the build; a key the CMS doesn't know is invisible to Tory.

11. **CMS saves deploy live**: Sveltia commits straight to `main` (no editorial workflow). A save that violates a schema fails the Netlify build and the site stays on the last good deploy — check Netlify deploy logs when Tory reports "my change didn't show up".

12. **Auth is Netlify's GitHub OAuth provider, NOT Git Gateway** (Git Gateway is deprecated). Editors need a GitHub account with Write access to the repo. Never add `base_url` to `config.yml` unless replacing the auth provider.

13. **HTML parity guard**: `scripts/html-parity.sh snapshot|check` — use it for any refactor that must not change rendered output.

14. **Data-collection sort order is not deterministic** across clean builds (Astro's glob loader reads files concurrently). Any list rendered from a `type: 'data'` collection needs an explicit total order — `services` has `order`; `testimonials` sorts featured-first then by entry id (see index.astro).

## Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-24 | Astro + Netlify over WordPress | Client can upgrade to Decap CMS later; Netlify free tier sufficient; better Core Web Vitals |
| 2026-03-24 | theme.config.ts as single source | All tokens in one place; swap logo/colors/copy without touching components |
| 2026-03-24 | Bare layout for /start and /thank-you | Zero exit paths on conversion pages — no nav, no footer |
| 2026-03-24 | Netlify Forms over backend | No server needed; free tier handles small lead volumes; Decap CMS auth uses Netlify Identity anyway |
| 2026-06-19 | MailerLite as email provider | Free to 1,000 subs; bridged via Netlify outgoing webhook → Zapier Catch Hook → MailerLite "Create Subscriber" (group `Leads – 5 Pillars`). No form-markup change; `theme.email.webhookUrl` stays empty (webhook is set in Netlify dashboard, not code). Lead fields: name, email, phone, business, employees. |
| 2026-06-19 | Live on Netlify + custom domain | Migrated off GitHub Pages; `base` removed, `site` set to `https://purposeboundstrategies.com`; stale `.github/workflows/deploy.yml` (GH Pages) deleted. Form detection enabled + email notification to Tory working. Client signed off on current state. |
| 2026-08-27 | Sveltia CMS (GitHub backend via Netlify OAuth) over Decap+Identity+Git Gateway | Git Gateway deprecated by Netlify; Sveltia is the maintained Decap-compatible successor; no servers, no SaaS. |
| 2026-08-27 | All copy moved from theme.config.ts + templates into Content Collections | Single typed source the CMS can write; theme.config.ts is brand tokens only. |
| 2026-08-27 | No editorial workflow | Single editor; save = publish; blog keeps its draft flag. |
| 2026-08-27 | Metrics removed (not migrated) | MetricsBar was never rendered; no value in exposing dead content to the editor. |
