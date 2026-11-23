import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

export async function listPosts() {
  const posts = await getCollection("posts", ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf() || a.id.localeCompare(b.id));
}

export function listCategories(posts: Post[]) {
  const counts = new Map<string, number>();
  for (const { data } of posts) counts.set(data.category, (counts.get(data.category) ?? 0) + 1);
  return [...counts].sort(([left], [right]) => left.localeCompare(right, "ko"));
}

export function postUrl(post: Post) {
  return "/posts/" + post.id.split("/").map(encodeURIComponent).join("/") + "/";
}

export function categoryUrl(name: string) {
  return "/category/" + encodeURIComponent(name) + "/";
}

export function dateLabel(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll("-", ".");
}
