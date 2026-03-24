import { describe, it, expect } from 'vitest';

// We test that our seed data files are valid JSON matching the expected shape.
// This mirrors what Astro's Zod validation does at build time.

import featured from '../src/content/testimonials/featured.json';
import coaching from '../src/content/services/coaching.json';
import consulting from '../src/content/services/consulting.json';

describe('testimonial seed data', () => {
  it('has required fields', () => {
    expect(featured).toHaveProperty('name');
    expect(featured).toHaveProperty('title');
    expect(featured).toHaveProperty('company');
    expect(featured).toHaveProperty('quote');
    expect(featured).toHaveProperty('featured');
  });
});

describe('service seed data', () => {
  it('coaching has required fields', () => {
    expect(coaching).toHaveProperty('title');
    expect(coaching).toHaveProperty('description');
    expect(coaching).toHaveProperty('includes');
    expect(Array.isArray(coaching.includes)).toBe(true);
    expect(coaching).toHaveProperty('order');
  });

  it('consulting has limited flag', () => {
    expect(consulting).toHaveProperty('limited');
    expect(consulting.limited).toBe(true);
  });
});
