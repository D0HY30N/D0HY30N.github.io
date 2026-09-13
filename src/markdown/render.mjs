import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import rehypeExpressiveCode from "rehype-expressive-code";
import { codeOptions } from "./expressive-code.ts";
import { remarkPlugins, rehypePlugins } from "./plugins.mjs";

function removeExecutableContent() {
	return (tree) => {
		const clean = (node) => {
			if (!node.children) return;
			node.children = node.children.filter((child) => !["script", "style"].includes(child.tagName));
			node.children.forEach(clean);
		};
		clean(tree);
	};
}

function collectCodeStyles() {
	return (tree, file) => {
		const styles = new Set();
		const collect = (node) => {
			if (!node.children) return;
			node.children = node.children.filter((child) => {
				if (child.tagName === "style") {
					styles.add(child.children.map((text) => text.value || "").join(""));
					return false;
				}
				return child.tagName !== "script";
			});
			node.children.forEach(collect);
		};
		collect(tree);
		file.data.previewStyles = [...styles].join("\n");
	};
}

// The same extensions and Expressive Code settings used by Astro, evaluated
// locally in the browser. Raw author scripts/styles never become preview assets.
const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkSmartypants)
	.use(remarkPlugins)
	.use(remarkRehype, { allowDangerousHtml: true })
	.use(rehypePlugins)
	.use(removeExecutableContent)
	.use(rehypeExpressiveCode, codeOptions)
	.use(collectCodeStyles)
	.use(rehypeRaw)
	// A separate attacher is required: Unified deduplicates repeated plugins.
	.use(() => removeExecutableContent())
	.use(rehypeStringify);

export async function renderMarkdown(markdown) {
	const result = await processor.process(markdown);
	return { html: String(result), css: result.data.previewStyles || "" };
}
