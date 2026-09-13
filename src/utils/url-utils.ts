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

export function getPostUrlBySlug(slug: string, category?: string): string {
	const postUrl = url(`/posts/${slug}/`);
	return category === undefined
		? postUrl
		: `${postUrl}?category=${encodeURIComponent(category)}`;
}

export function getTagUrl(tag: string): string {
	const name = tag.trim();
	if (!name) return url("/");
	return url(`/tag/${encodeURIComponent(name)}/`);
}

export function getCategoryUrl(category: string | null): string {
	const name = category?.trim() || i18n(I18nKey.uncategorized);
	return url(`/category/${encodeURIComponent(name)}/`);
}

export function getDir(path: string): string {
	const lastSlashIndex = path.lastIndexOf("/");
	if (lastSlashIndex < 0) {
		return "/";
	}
	return path.substring(0, lastSlashIndex + 1);
}

export function url(path: string) {
	const base = joinUrl("", import.meta.env.BASE_URL, "");
	const normalizedPath = joinUrl("", path);
	// CMS image URLs already include the GitHub Pages project path.
	if (normalizedPath === base.slice(0, -1) || normalizedPath.startsWith(base)) {
		return normalizedPath;
	}
	return joinUrl(base, path);
}
