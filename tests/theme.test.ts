import { describe, it, expect } from 'vitest';
import { theme } from '../theme.config';

describe('theme.config', () => {
  it('has all required color tokens', () => {
    const required = ['deep', 'rich', 'accent', 'cream', 'burgundy', 'muted', 'text'];
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
});
