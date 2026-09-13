import { getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";
import { categoryConfig } from "../config";
import { groupCategories, resolveCategoryGroups } from "./category-groups";

// // Retrieve posts and sort them by publication date
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const sorted = allBlogPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
	return sorted;
}

export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].slug;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].slug;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap = new Map<string, number>();
	allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
		const tags = new Set(post.data.tags.map((tag) => tag.trim()).filter(Boolean));
		tags.forEach((tag) => {
			countMap.set(tag, (countMap.get(tag) || 0) + 1);
		});
	});

	// sort tags
	const keys = [...countMap.keys()].sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap.get(key)! }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
	parentCategory: string;
};

export async function getCategoryList(): Promise<Category[]> {
	return (await getCategoryGroups()).flatMap((group) => group.categories);
}

export async function getCategoryGroups(): Promise<
	{ name: string; categories: Category[] }[]
> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const configuredGroups = resolveCategoryGroups(
		allBlogPosts.map((post) => post.data),
		categoryConfig.groups,
	);
	const count = new Map<string, number>();
	for (const group of configuredGroups) {
		for (const category of group.categories) count.set(category, 0);
	}
	allBlogPosts.forEach((post: { data: { category: string | null } }) => {
		const categoryName =
			post.data.category?.trim() || i18n(I18nKey.uncategorized);

		count.set(categoryName, (count.get(categoryName) || 0) + 1);
	});

	const lst = [...count.keys()].sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Omit<Category, "parentCategory">[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count.get(c)!,
			url: getCategoryUrl(c),
		});
	}
	return groupCategories(ret, configuredGroups).map((group) => ({
		name: group.name,
		categories: group.categories.map((category) => ({
			...category,
			parentCategory: group.name,
		})),
	}));
}
