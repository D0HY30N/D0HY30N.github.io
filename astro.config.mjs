import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://d0hy30n.github.io",
  devToolbar: { enabled: false },
  integrations: [
    // Category-scoped copies of a post point their canonical at /posts/, so keep them out.
    sitemap({ filter: page => !/\/category\/[^/]+\/posts\//.test(page) }),
  ],
});
