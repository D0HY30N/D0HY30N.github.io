import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { rehypeFootnoteBackrefs, rehypeImageFigures } from "./src/lib/rehype-prose.mjs";

export default defineConfig({
  site: "https://d0hy30n.github.io",
  devToolbar: { enabled: false },
  markdown: {
    // github-dark-default: blue-tinted background that matches the site, and comments that pass 4.5:1.
    shikiConfig: { theme: "github-dark-default" },
    remarkRehype: { footnoteLabel: "각주", footnoteBackLabel: "본문으로 돌아가기" },
    rehypePlugins: [rehypeImageFigures, rehypeFootnoteBackrefs],
  },
  integrations: [
    // Category-scoped copies of a post point their canonical at /posts/, so keep them out.
    sitemap({ filter: page => !/\/category\/[^/]+\/posts\//.test(page) }),
  ],
});
