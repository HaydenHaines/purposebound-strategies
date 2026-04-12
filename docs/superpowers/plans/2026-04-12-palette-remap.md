# Palette Remap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder burgundy/maroon color palette with logo-aligned navy, gold, and sphere-blue values across the two files that define site colors.

**Architecture:** Colors are defined as string values in `theme.config.ts`, mirrored as CSS custom properties in `global.css`, and consumed by Tailwind via `tailwind.config.mjs` (which reads the CSS variables). Only the two source files need changing — no Tailwind config or component edits required.

**Tech Stack:** Astro 5, Tailwind 3, TypeScript, Vitest

---

### Task 1: Update color token values in theme.config.ts

**Files:**
- Modify: `theme.config.ts` (brand.colors object, lines ~19–31)
- Modify: `tests/theme.test.ts` (add value assertions)

- [ ] **Step 1: Add failing value assertions to the existing test**

Open `tests/theme.test.ts` and add a new `it` block after the existing `'has all required color tokens'` test:

```ts
it('uses logo-aligned palette values', () => {
  const c = theme.brand.colors;
  expect(c.deep).toBe('#132240');
  expect(c.rich).toBe('#1b3560');
  expect(c.accent).toBe('#d09b2a');
  expect(c.cream).toBe('#f7f5f0');
  expect(c.burgundy).toBe('#2573b6');
  expect(c.muted).toBe('#c8d8e8');
  expect(c.text).toBe('#132240');
});
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
npx vitest run tests/theme.test.ts
```

Expected output: 1 test fails with `expected '#2c1018' to be '#132240'` (or similar).

- [ ] **Step 3: Update the color values in theme.config.ts**

Replace the entire `colors` block inside `brand`:

```ts
colors: {
  deep:     '#132240',   // nav, footer, darkest backgrounds
  rich:     '#1b3560',   // hero, dark sections
  accent:   '#d09b2a',   // gold — CTAs, labels, the light
  cream:    '#f7f5f0',   // light backgrounds, body sections
  burgundy: '#2573b6',   // section labels, links, borders (logo sphere blue)
  muted:    '#c8d8e8',   // body text on dark backgrounds
  text:     '#132240',   // body text on light backgrounds
},
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
npx vitest run tests/theme.test.ts
```

Expected output: all 3 tests pass, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add theme.config.ts tests/theme.test.ts
git commit -m "feat: remap palette to logo-aligned navy and gold"
```

---

### Task 2: Update CSS custom properties in global.css

**Files:**
- Modify: `src/styles/global.css` (`:root` block, lines ~10–18)

- [ ] **Step 1: Update the `:root` block**

Replace the entire `:root` block in `src/styles/global.css`:

```css
:root {
  --color-deep:     #132240;
  --color-rich:     #1b3560;
  --color-accent:   #d09b2a;
  --color-cream:    #f7f5f0;
  --color-burgundy: #2573b6;
  --color-muted:    #c8d8e8;
  --color-text:     #132240;
}
```

- [ ] **Step 2: Run the full build to confirm no errors**

```bash
npm run build
```

Expected: `7 page(s) built` with no errors or warnings (the "blog collection empty" notice is expected and harmless).

- [ ] **Step 3: Run all unit tests**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: sync CSS variables with logo-aligned palette"
```

---

### Task 3: Visual verification

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Open `http://localhost:4321/purposebound-strategies/` (or whatever BASE_URL is set to).

- [ ] **Step 2: Check each page**

Visit each of these and confirm no contrast issues — dark text on dark background, or light text on light background:

| Page | Dark sections to check | Light sections to check |
|------|------------------------|-------------------------|
| `/` | Nav, Hero, How It Works dark | Metrics bar, light content |
| `/about` | Hero banner, "How This Shapes My Work" | Faith statement, My Story |
| `/services` | Any dark CTA sections | Service cards |
| `/contact` | Page hero | FAQ section |
| `/start` | Full page | — |

Pay particular attention to `SectionLabel` and `QuoteBlock` components — per CLAUDE.md they require the `light` prop when inside `bg-rich`/`bg-deep` sections, otherwise the text (`text-burgundy` which is now `#2573b6`) may be hard to see on dark navy.

- [ ] **Step 3: Confirm no SectionLabel contrast issues**

On any dark section that uses `<SectionLabel>`, the label text should be gold (`#d09b2a`), not navy-on-navy. If any dark section shows a navy label on a navy background, the component is missing the `light` prop — check CLAUDE.md gotcha #9 for the fix pattern.

- [ ] **Step 4: Commit if any light-prop fixes were needed**

```bash
git add src/pages/<affected>.astro
git commit -m "fix: add light prop to SectionLabel/QuoteBlock in dark sections"
```

If no fixes were needed, skip this step.
