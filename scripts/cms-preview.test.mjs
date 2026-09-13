import assert from "node:assert/strict";
import { readFile, mkdir, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { test, after } from "node:test";
import { markdownEdit, validMarkdownUrl } from "../src/scripts/cms-markdown-edit.mjs";

const require = createRequire(import.meta.url);
const astroRequire = createRequire(require.resolve("astro/package.json"));
const root = fileURLToPath(new URL("../", import.meta.url));
const compiled = new URL("../.astro/cms-render-test.mjs", import.meta.url);
await mkdir(new URL("../.astro/", import.meta.url), { recursive: true });
await astroRequire("esbuild").build({
	absWorkingDir: root, entryPoints: ["./src/markdown/render.mjs"],
	bundle: true, platform: "node", format: "esm", packages: "external",
	outfile: fileURLToPath(compiled),
});
const { renderMarkdown } = await import(pathToFileURL(fileURLToPath(compiled)).href);
after(() => rm(compiled, { force: true }));

test("CMS preserves directive labels, math, and Expressive Code metadata", async () => {
	const markdown = ':::tip[확인 제목]\n내용\n:::\n\n:spoiler[비밀]\n\n$x^2$\n\n```js title="test.js" ins={1} collapse={2-3} startLineNumber=10\nconst x=1;\nconst y=2;\nconst z=3;\n```';
	const { html, css } = await renderMarkdown(markdown);
	assert.match(html, /class="bdm-title"><div>확인 제목<\/div>/);
	assert.match(html, /<spoiler>비밀<\/spoiler>/);
	assert.match(html, /class="katex"/);
	assert.match(html, /test\.js/);
	assert.match(html, /class="ec-line highlight ins"/);
	assert.match(html, /<details/);
	assert.match(html, /class="ln" aria-hidden="true">10<\/div>/);
	assert.ok(css.includes(".expressive-code"));
	assert.ok((await renderMarkdown(markdown)).css.length > 1000, "Styles remain available after edits");
});

test("raw author scripts and styles never become trusted preview CSS", async () => {
	const { html, css } = await renderMarkdown('<style>body{--author-sentinel:1}</style>\n<script>window.authorSentinel=1</script>\n\n```html\n<script>example()</script>\n```');
	assert.doesNotMatch(html, /<(script|style)[\s>]/i);
	assert.doesNotMatch(css, /author-sentinel|authorSentinel/);
	assert.match(html, /example/);
});

test("both CMS guides render all their examples", async () => {
	for (const name of ["markdown", "fuwari"]) {
		const source = await readFile(new URL(`../cms/guides/${name}.md`, import.meta.url), "utf8");
		const { html } = await renderMarkdown(source.replace(/^---[\s\S]*?---\s*/, ""));
		assert.match(html, /<h2/);
		assert.doesNotMatch(html, /Invalid admonition|Invalid directive|katex-error/);
	}
});

test("formatting changes the selection without rewriting Fuwari syntax", () => {
	const source = ':::note\n내용\n:::\n\n```js {2}\nconst x=1;\n```';
	const start = source.indexOf("내용");
	const edit = markdownEdit(source, start, start + 2, "bold");
	assert.equal(source.slice(0, edit.start) + edit.text + source.slice(edit.end), source.replace("내용", "**내용**"));
	assert.equal(markdownEdit("", 0, 0, "image", "/images/uploads/한 글.png").text, "![이미지 설명](</images/uploads/한 글.png>)");
	assert.equal(validMarkdownUrl("javascript:alert(1)"), false);
	assert.equal(validMarkdownUrl("/images/uploads/test.png"), true);
});

test("all CMS body fields stay raw and guides are outside blog content", async () => {
	const config = astroRequire("yaml").parse(await readFile(new URL("../public/admin/config.yml", import.meta.url), "utf8"));
	const fields = config.collections.flatMap((collection) => collection.fields || collection.files.flatMap((file) => file.fields));
	for (const field of fields.filter((field) => field.name === "body")) assert.equal(field.widget, "markdown-source");
	const guides = config.collections.find((collection) => collection.name === "writing-guides");
	assert.equal(guides.files.length, 2);
	for (const file of guides.files) {
		assert.ok(file.file.startsWith("cms/guides/"));
		assert.ok(file.fields.every((field) => field.readonly));
	}
});
