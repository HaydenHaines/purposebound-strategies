import { describe, it, expect } from 'vitest';
import { settingsSchemas } from '../src/content/config';
import site from '../src/content/settings/site.json';
import founder from '../src/content/settings/founder.json';
import leadMagnet from '../src/content/settings/leadMagnet.json';
import contact from '../src/content/settings/contact.json';
import { pageSchemas } from '../src/content/config';
import home from '../src/content/pages/home.json';

// Every content file the CMS can write must parse against its schema.
// This mirrors Astro's build-time validation so a bad save fails here first.
describe('settings collection', () => {
  it('site.json matches schema', () => {
    expect(() => settingsSchemas.site.parse(site)).not.toThrow();
    expect(site.nav.map((n) => n.href)).toEqual(['/about', '/services', '/blog']);
  });
  it('founder.json matches schema', () => {
    expect(() => settingsSchemas.founder.parse(founder)).not.toThrow();
  });
  it('leadMagnet.json matches schema and points at a file in public/', () => {
    expect(() => settingsSchemas.leadMagnet.parse(leadMagnet)).not.toThrow();
    expect(leadMagnet.file).toMatch(/^\/[^/].*\.pdf$/);
  });
  it('contact.json has at least one FAQ', () => {
    expect(() => settingsSchemas.contact.parse(contact)).not.toThrow();
    expect(contact.faq.length).toBeGreaterThan(0);
  });
});

describe('pages collection', () => {
  it('home.json matches schema', () => {
    expect(() => pageSchemas.home.parse(home)).not.toThrow();
    expect(home.benefits).toHaveLength(3);
    expect(home.howItWorks.steps).toHaveLength(3);
    expect(home.hero.headlineAccent).toContain('Something Greater');
  });
});
