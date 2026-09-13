import { defineCollection, z } from "astro:content";

// Hand-written YAML dates and CMS date strings should render identically.
const contentDate = z.union([z.date(), z.string().min(1)]).pipe(z.coerce.date());

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: contentDate,
		updated: z.preprocess(
			(value) => value === "" || value === null ? undefined : value,
			contentDate.optional(),
		),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		parentCategory: z.string().trim().optional().nullable().default(""),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}).refine((data) => !data.parentCategory || Boolean(data.category?.trim()), {
		message: "대분류(parentCategory)를 지정할 때는 소분류(category)도 입력해주세요.",
		path: ["category"],
	}),
});
const specCollection = defineCollection({
	schema: z.object({}),
});
export const collections = {
	posts: postsCollection,
	spec: specCollection,
};
