import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
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
    expect(cfg.media_folder).toBe('/public/images');
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
    expect(file).toMatchObject({ widget: 'file', media_folder: '/public', public_folder: '/' });
  });
});

// Shape Sveltia writes for a field list: object keys → nested shape; list w/ fields → ['object', shape]; list w/ single field or bare → ['scalar'].
type Shape = { [k: string]: Shape | 'scalar' | ['list', Shape | 'scalar'] };
function shapeOf(fields: any[]): Shape {
  const out: Shape = {};
  for (const f of fields) {
    if (f.widget === 'object') out[f.name] = shapeOf(f.fields);
    else if (f.widget === 'list') out[f.name] = ['list', f.fields ? shapeOf(f.fields) : 'scalar'];
    else out[f.name] = 'scalar';
  }
  return out;
}
function shapeOfValue(v: any): Shape | 'scalar' | ['list', Shape | 'scalar'] {
  if (Array.isArray(v)) return ['list', v.length && typeof v[0] === 'object' ? (shapeOfValue(v[0]) as Shape) : 'scalar'];
  if (v && typeof v === 'object') {
    const o: Shape = {};
    for (const k of Object.keys(v)) o[k] = shapeOfValue(v[k]);
    return o;
  }
  return 'scalar';
}

// blog is markdown frontmatter + a `body` markdown field, not a JSON data file — it's excluded from
// this structural comparison, which only makes sense for the JSON-shaped settings/pages/services/testimonials collections.
describe('config.yml field tree matches the data files (CLAUDE.md gotcha #10)', () => {
  for (const c of ['settings', 'pages']) {
    for (const f of byName(c).files) {
      it(`${c}/${f.name}`, () => {
        const data = JSON.parse(readFileSync(f.file, 'utf8'));
        expect(shapeOfValue(data)).toEqual(shapeOf(f.fields));
      });
    }
  }
  it('services + testimonials field names match a real entry', () => {
    for (const c of ['services', 'testimonials']) {
      const col = byName(c);
      const dir = col.folder;
      const sample = readdirSync(dir).find((n: string) => n.endsWith('.json'))!;
      const data = JSON.parse(readFileSync(join(dir, sample), 'utf8'));
      const cmsKeys = new Set(col.fields.map((x: any) => x.name));
      for (const k of Object.keys(data)) expect(cmsKeys.has(k), `${c}: ${k} not in CMS`).toBe(true);
    }
  });
});
