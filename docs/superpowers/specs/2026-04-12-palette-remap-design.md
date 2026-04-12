# Palette Remap — Logo-Aligned Colors

**Date:** 2026-04-12  
**Status:** Approved  

## Goal

Replace the placeholder "Stained Glass" burgundy/maroon palette with colors derived directly from the actual PurposeBound Strategies logo. The logo uses deep navy, logo-sphere bright blue, and warm gold — none of which were reflected in the old palette.

## Approach Selected

**Option B — Navy + Bright Blue.** Darkest navy as primary backgrounds, uses the logo's sphere blue for accent/label roles on light sections, gold accent matched to logo gold. Chosen over:
- Option A (Full Navy) — same darks but used a slightly lighter blue for links, less direct logo correspondence
- Option C (Deep Navy, Warm Cream) — slightly darker navy with warmer cream; good but less contrast on light sections

## Color Token Changes

Token names are unchanged. Only values change. Two files must stay in sync: `theme.config.ts` and `src/styles/global.css`.

| Token | New Value | Old Value | Role |
|-------|-----------|-----------|------|
| `deep` | `#132240` | `#2c1018` | Nav, footer, darkest backgrounds |
| `rich` | `#1b3560` | `#3d1520` | Hero, dark sections |
| `accent` | `#d09b2a` | `#c9a84c` | CTAs, section labels, gold highlight |
| `cream` | `#f7f5f0` | `#f7f5f0` | Light section backgrounds — **unchanged** |
| `burgundy` | `#2573b6` | `#6b1e2e` | Section labels, links, borders on cream — logo sphere blue |
| `muted` | `#c8d8e8` | `#d9c4b8` | Body text on dark backgrounds — cool blue-gray |
| `text` | `#132240` | `#2c1018` | Body text on cream/light backgrounds |

## Logo Color Source

Colors sampled from `/public/logo.png`:
- Dark navy dominant: `rgb(19, 47, 86)` → rounded to `#132240` / `#1b3560`
- Gold accent mean: `rgb(210, 155, 47)` → `#d09b2a`
- Sphere bright blue mean: `rgb(37, 115, 182)` → `#2573b6`

## Scope

- `theme.config.ts` — update `brand.colors` object (7 values)
- `src/styles/global.css` — update 7 CSS custom properties in `:root`

No component files need editing. The token names are identical — all components already reference them via Tailwind classes (`bg-deep`, `text-accent`, etc.) and CSS variables (`var(--color-muted)`).

## Out of Scope

- Font changes
- Layout changes
- Component restructuring
- Tailwind config changes (token names unchanged)
