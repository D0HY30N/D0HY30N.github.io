import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;
export const POSTS_PER_PAGE = 10;

export async function listPosts() {
  const posts = await getCollection("posts", ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf() || a.id.localeCompare(b.id));
}

export function postsByCategory(posts: Post[]) {
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    const group = groups.get(post.data.category);
    if (group) group.push(post);
    else groups.set(post.data.category, [post]);
  }
  return groups;
}

export function listCategories(posts: Post[]) {
  return [...postsByCategory(posts)]
    .map(([name, entries]) => [name, entries.length] as const)
    .sort(([left], [right]) => left.localeCompare(right, "ko"));
}

export function postsWithNeighbors(posts: Post[]) {
  return posts.map((post, i) => ({
    post, older: posts[i + 1], newer: posts[i - 1],
    listPage: Math.floor(i / POSTS_PER_PAGE) + 1,
  }));
}

export function postUrl(post: Post, category?: string) {
  const base = category ? categoryUrl(category) + "posts/" : "/posts/";
  return base + post.id.split("/").map(encodeURIComponent).join("/") + "/";
}

export function categoryUrl(name: string) {
  return "/category/" + encodeURIComponent(name) + "/";
}

export function archivePageUrl(page: number, category?: string) {
  const base = category ? categoryUrl(category) : "/archive/";
  return page === 1 ? base : base + page + "/";
}

export function dateLabel(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll("-", ".");
}
