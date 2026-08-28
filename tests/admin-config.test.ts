import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { parse } from 'yaml';

// The CMS config must stay in lock-step with the content collections.
const cfg = parse(readFileSync('public/admin/config.yml', 'utf8'));
const collections: any[] = cfg.collections;
const byName = (n: string) => collections.find((c) => c.name === n);

describe('public/admin/config.yml', () => {
  it('uses the GitHub backend on main with no Git Gateway', () => {
    expect(cfg.backend).toMatchObject({ name: 'github', repo: 'HaydenHaines/purposebound-strategies', branch: 'main' });
    expect(cfg.backend.base_url).toBeUndefined();
    expect(cfg.publish_mode).toBeUndefined(); // no editorial workflow: save = publish
  });
  it('stores media under public/images', () => {
    expect(cfg.media_folder).toBe('public/images');
    expect(cfg.public_folder).toBe('/images');
  });
  it('every settings/pages file entry points at an existing JSON file', () => {
    for (const c of ['settings', 'pages']) {
      for (const f of byName(c).files) expect(existsSync(f.file), f.file).toBe(true);
    }
  });
  it('folder collections point at the content dirs', () => {
    expect(byName('blog').folder).toBe('src/content/blog');
    expect(byName('services').folder).toBe('src/content/services');
    expect(byName('testimonials').folder).toBe('src/content/testimonials');
  });
  it('lead magnet PDF uploads to the site root', () => {
    const lm = byName('settings').files.find((f: any) => f.name === 'leadMagnet');
    const file = lm.fields.find((f: any) => f.name === 'file');
    expect(file).toMatchObject({ widget: 'file', media_folder: 'public', public_folder: '/' });
  });
});
