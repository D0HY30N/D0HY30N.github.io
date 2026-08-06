import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";

export function pathsEqual(path1: string, path2: string) {
	const normalizedPath1 = path1.replace(/^\/|\/$/g, "").toLowerCase();
	const normalizedPath2 = path2.replace(/^\/|\/$/g, "").toLowerCase();
	return normalizedPath1 === normalizedPath2;
}

function joinUrl(...parts: string[]): string {
	const joined = parts.join("/");
	return joined.replace(/\/+/g, "/");
}

export function getPostUrlBySlug(slug: string): string {
	return url(`/posts/${slug}/`);
}

export type CategoryValue = string | string[] | null | undefined;

export function getCategoryPath(category: CategoryValue): string[] {
	if (Array.isArray(category)) {
		return category.map((part) => part.trim()).filter(Boolean);
	}
	if (!category) return [];
	// Keep the earlier `Parent -> Child` notation backward compatible.
	return category.split(/\s*->\s*/).map((part) => part.trim()).filter(Boolean);
}

export function getCategoryKey(category: CategoryValue): string {
	return getCategoryPath(category).join(" -> ");
}

export function getCategorySlug(category: CategoryValue): string {
	const name = getCategoryPath(category).at(-1) || "";
	return name
		.replace(/[<>:"/\\|?*]+/g, "-")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

export function parseCategoryPath(category: CategoryValue) {
	const parts = getCategoryPath(category);

	return {
		group: parts.length > 1 ? parts.slice(0, -1).join(" / ") : null,
		name: parts.at(-1) || "",
		parts,
	};
}

export function getCategoryDisplayName(category: CategoryValue): string | null {
	return parseCategoryPath(category).name || null;
}

export function getTagUrl(tag: string): string {
	if (!tag) return url("/archive/");
	return url(`/tag/${encodeURIComponent(tag.trim())}/`);
}

export const UNCATEGORIZED_CATEGORY_SLUG = "_uncategorized";

export function getCategoryUrl(category: CategoryValue): string {
	const categoryKey = getCategoryKey(category);
	if (!categoryKey || categoryKey.toLowerCase() === i18n(I18nKey.uncategorized).toLowerCase())
		return url(`/category/${UNCATEGORIZED_CATEGORY_SLUG}/`);
	return url(`/category/${encodeURIComponent(getCategorySlug(category))}/`);
}

export function getDir(path: string): string {
	const lastSlashIndex = path.lastIndexOf("/");
	if (lastSlashIndex < 0) {
		return "/";
	}
	return path.substring(0, lastSlashIndex + 1);
}

export function url(path: string) {
	return joinUrl("", import.meta.env.BASE_URL, path);
}
