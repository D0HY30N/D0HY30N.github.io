import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { listPosts, postUrl } from "../lib/posts";

export async function GET(context: APIContext) {
  const posts = await listPosts();
  return rss({
    title: "D0HY30N's Blog",
    description: "김도현(D0HY30N)이 모의해킹과 사이버보안을 공부하며 남긴 기록.",
    site: context.site!,
    items: posts.map(post => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.published,
      categories: [post.data.category],
      link: postUrl(post),
    })),
    customData: "<language>ko</language>",
  });
}
