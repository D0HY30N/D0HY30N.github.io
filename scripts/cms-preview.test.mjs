import assert from "node:assert/strict";
import { readFile, mkdir, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { test, after } from "node:test";
import { markdownEdit, markdownTableEdit, validMarkdownUrl } from "../src/scripts/cms-markdown-edit.mjs";
import { categoriesFromPostPath, syncPostFolderCategory } from "../src/scripts/cms-post-category.mjs";

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

test("CMS folders determine both category levels without manual values", () => {
	assert.deepEqual(categoriesFromPostPath("src/content/posts/보안/WEB/http.md"), { parentCategory: "보안", category: "WEB" });
	assert.deepEqual(categoriesFromPostPath("src/content/posts/개발 도구/작성 환경/한글 제목.md"), { parentCategory: "개발 도구", category: "작성 환경" });
	assert.deepEqual(categoriesFromPostPath("src/content/posts/http.md"), { parentCategory: "", category: "" });
	assert.deepEqual(categoriesFromPostPath("/src/content/posts/WEB/http.md"), { parentCategory: "", category: "WEB" });
	assert.deepEqual(categoriesFromPostPath("src/content/posts/시스템/linux.md"), { parentCategory: "", category: "시스템" });
	for (const path of [undefined, "src/content/spec/about.md", "src/content/posts/", "src/content/posts/../about.md"]) {
		assert.equal(categoriesFromPostPath(path), undefined);
	}
});

test("CMS keeps two category levels visible and rejects deeper folders before saving", async () => {
	const config = astroRequire("yaml").parse(await readFile(new URL("../public/d0hy30n/config.yml", import.meta.url), "utf8"));
	const posts = config.collections.find((collection) => collection.name === "posts");
	// Sveltia includes the file name in nested.depth.
	assert.equal(posts.nested.depth, 3);
	assert.equal(posts.nested.subfolders, false);
	for (const path of ["src/content/posts/보안/WEB/노트/http.md", "src\\content\\posts\\보안\\WEB\\노트\\http.md"]) {
		assert.throws(() => categoriesFromPostPath(path), RangeError);
		const entry = {
			get: (key) => ({ collection: "posts", path })[key],
			setIn: () => assert.fail("A third category folder must be rejected before metadata updates"),
		};
		assert.throws(() => syncPostFolderCategory({ entry }), (error) =>
			error.message === "saving_failed" && error.cause instanceof RangeError);
	}
});

test("CMS rejects posts outside category folders before changing their data", () => {
	const entry = {
		get: (key) => ({ collection: "posts", path: "src/content/posts/http.md" })[key],
		setIn: () => assert.fail("Uncategorized posts must be rejected before metadata updates"),
	};
	assert.throws(() => syncPostFolderCategory({ entry }), (error) =>
		error.message === "saving_failed" && error.cause?.message === "소카테고리 폴더를 선택하거나 만들어 주세요.");
});

test("folder synchronization leaves other CMS collections untouched", () => {
	for (const collection of ["pages", "writing-guides"]) {
		const entry = { get: (key) => key === "collection" ? collection : undefined };
		assert.equal(syncPostFolderCategory({ entry }), entry);
	}
});

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
	const config = astroRequire("yaml").parse(await readFile(new URL("../public/d0hy30n/config.yml", import.meta.url), "utf8"));
	const fields = config.collections.flatMap((collection) => collection.fields || collection.files.flatMap((file) => file.fields));
	for (const field of fields.filter((field) => field.name === "body")) assert.equal(field.widget, "markdown-source");
	const guides = config.collections.find((collection) => collection.name === "writing-guides");
	assert.equal(guides.files.length, 2);
	for (const file of guides.files) {
		assert.ok(file.file.startsWith("cms/guides/"));
		assert.ok(file.fields.every((field) => field.readonly));
	}
});

test("inserted images retain the exact temporary URL for CMS save replacement", async () => {
	const url = "blob:https://d0hy30n.github.io/edce7c9e-0a85-4b61-9cdb-ce6c7e1e64df";
	const edit = markdownEdit("앞\n\n뒤", 2, 2, "image", url);
	assert.ok(edit.text.includes(url));
	const saved = edit.text.replaceAll(url, "/images/uploads/image.png");
	assert.match((await renderMarkdown(saved)).html, /src="\/images\/uploads\/image.png"/);
});

test("table and rule tools preserve surrounding paragraphs and render as blocks", async () => {
	const source = "앞 문단\n\n뒤 문단";
	const edit = markdownTableEdit(source, 4, 3, 2);
	const value = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
	const { html } = await renderMarkdown(value);
	assert.match(html, /<p>앞 문단<\/p>/);
	assert.match(html, /<p>뒤 문단<\/p>/);
	assert.equal((html.match(/<th[\s>]/g) || []).length, 3);
	assert.equal((html.match(/<td[\s>]/g) || []).length, 6);
	assert.equal(value.slice(edit.selectionStart, edit.selectionEnd), "제목 1");
	assert.throws(() => markdownTableEdit("", 0, 0, 2), RangeError);
	assert.throws(() => markdownTableEdit("", 0, 3, 1.5), RangeError);
	const rule = markdownEdit(source, 0, 4, "rule");
	assert.match((await renderMarkdown(source.slice(0, rule.start) + rule.text + source.slice(rule.end))).html, /<hr/);
});

test("heading level changes and checklist insertion retain selected content", async () => {
	const source = "## 기존 제목";
	assert.equal(markdownEdit(source, 0, source.length, "h1").text, "# 기존 제목");
	const items = "첫 번째\n두 번째";
	const edit = markdownEdit(items, 0, items.length, "task");
	const { html } = await renderMarkdown(edit.text);
	assert.equal((html.match(/type="checkbox"/g) || []).length, 2);
	assert.match(html, /첫 번째/);
	assert.match(html, /두 번째/);
});
