import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

export const collections = {
  posts: defineCollection({
    loader: glob({ base: "./src/posts", pattern: "**/*.md" }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      published: z.coerce.date(),
      category: z.string().trim().min(1),
      draft: z.boolean().default(false),
    }),
  }),
};
