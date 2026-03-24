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
    order: z.number(),
  }),
});

export const collections = { blog, testimonials, services };
