import type { CategoryGroupConfig } from "../types/config";

export function normalizeCategoryGroups(
	groups: CategoryGroupConfig[],
): CategoryGroupConfig[] {
	const groupNames = new Set<string>();
	const categoryNames = new Set<string>();

	return groups.map((group) => {
		const name = group.name.trim();
		if (!name || groupNames.has(name)) {
			throw new Error(`대분류 이름이 비어 있거나 중복되었습니다: "${name}"`);
		}
		groupNames.add(name);

		const categories = group.categories.map((category) => {
			const categoryName = category.trim();
			if (!categoryName || categoryNames.has(categoryName)) {
				throw new Error(
					`소분류 이름이 비어 있거나 중복되었습니다: "${categoryName}"`,
				);
			}
			categoryNames.add(categoryName);
			return categoryName;
		});

		return { name, categories };
	});
}

export function groupCategories<T extends { name: string }>(
	categories: T[],
	configuredGroups: CategoryGroupConfig[],
): { name: string; categories: T[] }[] {
	const remaining = new Map(categories.map((category) => [category.name, category]));
	const groups = normalizeCategoryGroups(configuredGroups).map((group) => {
		const children: T[] = [];
		for (const name of group.categories) {
			const category = remaining.get(name);
			if (category) children.push(category);
			remaining.delete(name);
		}
		return { name: group.name, categories: children };
	});

	// 대분류가 없는 카테고리는 ALL 바로 아래에 독립적으로 표시합니다.
	if (remaining.size > 0) {
		groups.unshift({ name: "", categories: [...remaining.values()] });
	}

	return groups;
}

export function resolveCategoryGroups(
	posts: { category?: string | null; parentCategory?: string | null }[],
	configuredGroups: CategoryGroupConfig[],
): CategoryGroupConfig[] {
	const groups = normalizeCategoryGroups(configuredGroups);
	const parents = new Map<string, string>();

	for (const post of posts) {
		const parent = post.parentCategory?.trim();
		if (!parent) continue;
		const category = post.category?.trim();
		if (!category) {
			throw new Error(`대분류 "${parent}"의 글에 소분류(category)를 입력해주세요.`);
		}
		const previous = parents.get(category);
		if (previous && previous !== parent) {
			throw new Error(
				`소분류 "${category}"의 대분류가 "${previous}"와 "${parent}"로 다릅니다. 해당 글들의 parentCategory를 통일하거나 소분류 이름을 구분해주세요.`,
			);
		}
		parents.set(category, parent);
	}

	// Markdown assignments override legacy settings for the same category.
	for (const [category, parent] of parents) {
		for (const group of groups) {
			if (group.name !== parent) {
				group.categories = group.categories.filter((name) => name !== category);
			}
		}
		let group = groups.find((item) => item.name === parent);
		if (!group) {
			group = { name: parent, categories: [] };
			groups.push(group);
		}
		if (!group.categories.includes(category)) group.categories.push(category);
	}

	return groups.filter((group) => group.categories.length > 0);
}
