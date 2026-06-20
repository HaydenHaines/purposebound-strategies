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

## Key Files

- `theme.config.ts` — ALL design tokens, content values, placeholder data. Start here.
- `src/styles/global.css` — CSS custom properties. Must stay in sync with theme.config.ts colors.
- `src/content/` — Content Collections: blog posts, testimonials, services
- `netlify.toml` — Build config, form handling, security headers

## Code Quality Rule (MANDATORY)

Every touch improves the code. No hacks without `// DEBT:`. All content from theme.config.ts or Content Collections — never hardcoded in components.

## Gotchas

1. **Netlify Forms**: requires `data-netlify="true"` AND a hidden `<input name="form-name">` matching the form's `name` attribute. **Form detection must also be enabled in the Netlify dashboard** (Site config → Forms) and the site redeployed afterward — it is OFF by default on newer sites. If it's off, every submission POSTs to a 404 (this exact bug bit us 2026-06-19). Submissions land in Forms → `lead-magnet`; an email notification to Tory (`twbryant1999@gmail.com`) is configured in the dashboard, not in code.

2. **CSS color token naming**: Tailwind reserves `text` as a class name, so the body text color token is `pb-text` in Tailwind (`text-pb-text`) but `--color-text` as a CSS variable.

3. **theme.config.ts ↔ global.css sync**: Color values appear in both files. They must match. If you change a color in theme.config.ts, update the matching CSS variable in global.css too.

4. **Calendly URL placeholder**: `theme.calendly.url` contains `[handle]` until the real account URL is set. The Calendly embed will not render until this is updated.

5. **Vitest excludes E2E tests**: `vitest.config.ts` explicitly excludes `tests/e2e/**`. Do not remove this — Vitest would otherwise pick up Playwright spec files and fail on `test.describe()`.

6. **Astro dev toolbar disabled**: `astro.config.mjs` has `devToolbar: { enabled: false }`. Without this, the toolbar injects extra `<h1>` elements into pages, breaking Playwright's strict-mode locator assertions.

7. **Consulting CTA**: `src/content/services/consulting.json` uses "Start the Conversation" as the CTA (not "Inquire About Consulting"). This was changed during testing to avoid E2E test ambiguity — do not revert.

8. **No `base` path — deploys at root**: the site is served at the domain root on Netlify, so `astro.config.mjs` has no `base`. All internal links/assets are plain root-absolute paths (`href="/contact"`, `src="/logo.png"`) — do NOT reintroduce `${base}` prefixes (they'd render `//path`, a broken protocol-relative URL). (Historical: an earlier GitHub Pages deploy used `base: '/purposebound-strategies'`; that's gone.)

9. **SectionLabel and QuoteBlock on dark sections**: Both components have a `light` boolean prop. Always pass `light` when the component sits inside a `bg-rich` or `bg-deep` section — without it, `text-link` (#2573b6) and `text-pb-text` (#132240) are near-invisible on the dark backgrounds (#1b3560 / #132240). Default (no prop) = dark text for cream/light sections.

## Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-24 | Astro + Netlify over WordPress | Client can upgrade to Decap CMS later; Netlify free tier sufficient; better Core Web Vitals |
| 2026-03-24 | theme.config.ts as single source | All tokens in one place; swap logo/colors/copy without touching components |
| 2026-03-24 | Bare layout for /start and /thank-you | Zero exit paths on conversion pages — no nav, no footer |
| 2026-03-24 | Netlify Forms over backend | No server needed; free tier handles small lead volumes; Decap CMS auth uses Netlify Identity anyway |
| 2026-06-19 | MailerLite as email provider | Free to 1,000 subs; bridged via Netlify outgoing webhook → Zapier Catch Hook → MailerLite "Create Subscriber" (group `Leads – 5 Pillars`). No form-markup change; `theme.email.webhookUrl` stays empty (webhook is set in Netlify dashboard, not code). Lead fields: name, email, phone, business, employees. |
| 2026-06-19 | Live on Netlify + custom domain | Migrated off GitHub Pages; `base` removed, `site` set to `https://purposeboundstrategies.com`; stale `.github/workflows/deploy.yml` (GH Pages) deleted. Form detection enabled + email notification to Tory working. Client signed off on current state. |
