# PurposeBound Strategies

Christian sales coaching website for [Founder Name]. Astro 5 + Tailwind + Netlify.

**Core value:** Lead capture → email nurture → discovery call.
**Stack:** Astro 5, Tailwind 3, Netlify Forms, Calendly, TypeScript
**Repo:** https://github.com/HaydenHaines/purposebound-strategies
**Live (GitHub Pages):** https://haydenhaines.github.io/purposebound-strategies/

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

1. **Netlify Forms**: requires `data-netlify="true"` AND a hidden `<input name="form-name">` matching the form's `name` attribute. Without the hidden input, form submissions silently fail.

2. **CSS color token naming**: Tailwind reserves `text` as a class name, so the body text color token is `pb-text` in Tailwind (`text-pb-text`) but `--color-text` as a CSS variable.

3. **theme.config.ts ↔ global.css sync**: Color values appear in both files. They must match. If you change a color in theme.config.ts, update the matching CSS variable in global.css too.

4. **Calendly URL placeholder**: `theme.calendly.url` contains `[handle]` until the real account URL is set. The Calendly embed will not render until this is updated.

5. **Vitest excludes E2E tests**: `vitest.config.ts` explicitly excludes `tests/e2e/**`. Do not remove this — Vitest would otherwise pick up Playwright spec files and fail on `test.describe()`.

6. **Astro dev toolbar disabled**: `astro.config.mjs` has `devToolbar: { enabled: false }`. Without this, the toolbar injects extra `<h1>` elements into pages, breaking Playwright's strict-mode locator assertions.

7. **Consulting CTA**: `src/content/services/consulting.json` uses "Start the Conversation" as the CTA (not "Inquire About Consulting"). This was changed during testing to avoid E2E test ambiguity — do not revert.

8. **GitHub Pages `base` path — no trailing slash**: `import.meta.env.BASE_URL` is `/purposebound-strategies` (no trailing slash). Always write `${base}/path` not `${base}path`. Static assets in `public/` also need the prefix: `src={`${base}/logo-placeholder.svg`}`. This affects every `href` and asset `src` in every component and page.

9. **SectionLabel and QuoteBlock on dark sections**: Both components have a `light` boolean prop. Always pass `light` when the component sits inside a `bg-rich` or `bg-deep` section — without it, `text-burgundy` (#6b1e2e) and `text-pb-text` (#2c1018) are near-invisible on the dark backgrounds (#3d1520 / #2c1018). Default (no prop) = dark text for cream/light sections.

## Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-24 | Astro + Netlify over WordPress | Client can upgrade to Decap CMS later; Netlify free tier sufficient; better Core Web Vitals |
| 2026-03-24 | theme.config.ts as single source | All tokens in one place; swap logo/colors/copy without touching components |
| 2026-03-24 | Bare layout for /start and /thank-you | Zero exit paths on conversion pages — no nav, no footer |
| 2026-03-24 | Netlify Forms over backend | No server needed; free tier handles small lead volumes; Decap CMS auth uses Netlify Identity anyway |
| 2026-03-24 | GitHub Pages for testing, Netlify for production | Client testing before domain/Netlify account is set up; swap `astro.config.mjs` site/base back to `purposeboundstrategies.com` and remove `base` when moving to Netlify |
