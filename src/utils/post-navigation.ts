export type NavigationPost = {
	slug: string;
	title: string;
	category: string;
	url: string;
};

export type PostLink = Pick<NavigationPost, "title" | "url">;

export type PostNeighbors = {
	newer: PostLink | null;
	older: PostLink | null;
};

export type PostNavigation = {
	category: string;
	all: PostNeighbors;
	categoryOnly: PostNeighbors;
};

function getNeighbors(
	posts: NavigationPost[],
	slug: string,
	category?: string,
): PostNeighbors {
	const index = posts.findIndex((post) => post.slug === slug);
	const toLink = (post: NavigationPost | undefined): PostLink | null =>
		post
			? {
					title: post.title,
					url: category === undefined
						? post.url
						: `${post.url}?category=${encodeURIComponent(category)}`,
				}
			: null;

	return { newer: toLink(posts[index - 1]), older: toLink(posts[index + 1]) };
}

export function createPostNavigation(
	posts: NavigationPost[],
	slug: string,
): PostNavigation {
	const current = posts.find((post) => post.slug === slug);
	if (!current) throw new Error(`Post not found: ${slug}`);

	return {
		category: current.category,
		all: getNeighbors(posts, slug),
		categoryOnly: getNeighbors(
			posts.filter((post) => post.category === current.category),
			slug,
			current.category,
		),
	};
}

export function getActivePostNeighbors(
	navigation: PostNavigation,
	search: string,
): PostNeighbors {
	return new URLSearchParams(search).get("category") === navigation.category
		? navigation.categoryOnly
		: navigation.all;
}
