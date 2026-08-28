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
