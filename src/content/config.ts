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

export const collections = { blog, testimonials, services, settings };
