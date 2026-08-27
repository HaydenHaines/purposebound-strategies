// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default('Founder'),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const testimonials = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    title: z.string(),
    company: z.string(),
    quote: z.string(),
    result: z.string().optional(), // specific metric or observable change — make this concrete
    featured: z.boolean().default(false),
  }),
});

const services = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    description: z.string(),
    whoItIsFor: z.string(),
    includes: z.array(z.string()),
    cta: z.string().default("Let's Talk"),
    limited: z.boolean().default(false), // true = show "Currently accepting limited engagements"
    icon: z.enum(['shepherd', 'building']).optional(),
    order: z.number(),
  }),
});

// ---- Settings: site-wide values Tory edits in the CMS (one JSON file per entry) ----
const siteSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  url: z.string().url(),
  nav: z.array(z.object({ label: z.string(), href: z.string() })),
  social: z.object({ linkedin: z.string() }),
  calendly: z.object({ url: z.string().url() }),
  contactEmail: z.string().email(),
});

const founderSchema = z.object({
  name: z.string(),
  title: z.string(),
  photo: z.string(),
  email: z.string().email(),
});

const leadMagnetSchema = z.object({
  title: z.string(),
  description: z.string(),
  file: z.string(), // root-absolute path to the PDF in public/
  bullets: z.array(z.string()),
});

const contactSchema = z.object({
  faq: z.array(z.object({ q: z.string(), a: z.string() })),
});

// Exported for tests; Astro itself uses the union below.
export const settingsSchemas = {
  site: siteSchema,
  founder: founderSchema,
  leadMagnet: leadMagnetSchema,
  contact: contactSchema,
};

const settings = defineCollection({
  type: 'data',
  schema: z.union([siteSchema, founderSchema, leadMagnetSchema, contactSchema]),
});

// ---- Pages: every string on a page template, so Tory can edit copy without touching code ----
const homeSchema = z.object({
  meta: z.object({ title: z.string() }),
  hero: z.object({
    kicker: z.string(),
    headline: z.string(),          // plain part, e.g. "Build a Business That Honors"
    headlineAccent: z.string(),    // gold part, e.g. "Something Greater."
    subhead: z.string(),
    primaryCta: z.object({ label: z.string(), href: z.string() }),
    secondaryCta: z.object({ label: z.string(), href: z.string() }),
  }),
  benefits: z.array(z.object({ text: z.string() })),
  whoIWorkWith: z.object({ label: z.string(), headline: z.string(), body: z.string() }),
  problem: z.object({ label: z.string(), headline: z.string(), body: z.string() }),
  meetTory: z.object({
    label: z.string(),
    headline: z.string(),
    body: z.string(),
    quote: z.string(),
    cta: z.object({ label: z.string(), href: z.string() }),
  }),
  howItWorks: z.object({
    label: z.string(),
    steps: z.array(z.object({ title: z.string(), body: z.string() })),
    cta: z.object({ label: z.string(), href: z.string() }),
  }),
  services: z.object({ label: z.string(), headline: z.string() }),
  credibility: z.object({
    label: z.string(),
    items: z.array(z.object({ name: z.string(), url: z.string() })),
  }),
  callout: z.object({ headline: z.string(), body: z.string() }),
  banner: z.object({
    label: z.string(),
    headline: z.string(),
    subline: z.string(),
    image: z.string(),
    imageAlt: z.string(),
  }),
  whatIBelieve: z.object({
    label: z.string(),
    quote: z.string(),
    cta: z.object({ label: z.string(), href: z.string() }),
  }),
  freeResource: z.object({ label: z.string() }),
});

const aboutSchema = z.object({
  meta: z.object({ title: z.string(), description: z.string() }),
  hero: z.object({ label: z.string(), headline: z.string(), subhead: z.string() }),
  foundation: z.object({ label: z.string(), headline: z.string(), paragraphs: z.array(z.string()) }),
  philosophy: z.object({
    label: z.string(),
    headline: z.string(),
    subhead: z.string(),
    paragraphs: z.array(z.string()),
    quote: z.string(),
    image: z.string(),
    imageAlt: z.string(),
  }),
  story: z.object({
    label: z.string(),
    roles: z.string(),
    tagline: z.string(),
    intro: z.array(z.string()),
    sections: z.array(z.object({ heading: z.string(), paragraphs: z.array(z.string()) })),
    closing: z.string(),
    strengths: z.string(),
    image: z.string(),
    imageAlt: z.string(),
    cta: z.object({ label: z.string(), href: z.string() }),
  }),
});

export const pageSchemas = { home: homeSchema, about: aboutSchema };

const pages = defineCollection({
  type: 'data',
  schema: z.union([homeSchema, aboutSchema]),
});

export const collections = { blog, testimonials, services, settings, pages };
