import { describe, it, expect } from 'vitest';
import { theme } from '../theme.config';

describe('theme.config', () => {
  it('has all required color tokens', () => {
    const required = ['deep', 'rich', 'accent', 'cream', 'link', 'muted', 'text'];
    required.forEach((key) => {
      expect(theme.brand.colors[key as keyof typeof theme.brand.colors]).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it('has exactly 3 metrics', () => {
    expect(theme.metrics).toHaveLength(3);
  });

  it('has a leadMagnet title', () => {
    expect(theme.leadMagnet.title.length).toBeGreaterThan(0);
  });

  it('has Oswald as display font', () => {
    expect(theme.brand.fonts.display[0]).toBe('Oswald');
  });

  it('uses logo-aligned palette values', () => {
    const c = theme.brand.colors;
    expect(c.deep).toBe('#132240');
    expect(c.rich).toBe('#1b3560');
    expect(c.accent).toBe('#d09b2a');
    expect(c.cream).toBe('#f7f5f0');
    expect(c.link).toBe('#2573b6');
    expect(c.muted).toBe('#6a96b8');
    expect(c.text).toBe('#132240');
  });
});
