import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const lore = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lore' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    metaDescription: z.string().optional(),
    canonicalURL: z.string().url().optional(),
    pubDate: z.coerce.date(),
    author: z.string(),
    tags: z.array(z.string()),
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx,yaml,yml}', base: './src/content/gallery' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      image: image().optional(),
      alt: z.string().optional(),
      category: z.string().optional(),
    }),
});

export const collections = { lore, gallery };