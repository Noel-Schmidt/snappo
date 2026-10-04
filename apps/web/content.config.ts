import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        category: z.string(),
        publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        toolLabel: z.string().optional(),
        toolPath: z.string().optional(),
      }),
    }),
  },
})
