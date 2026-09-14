import { siteConfig } from "../config";
import previewStyles from "../styles/cms-preview.css?inline";
import markdownExtensions from "../styles/markdown-extend.styl?inline";
import themeVariables from "../styles/variables.styl?inline";
import { preparePreview, hydratePreviewCards, handlePreviewClick } from "./cms-preview-content";
import { registerMarkdownEditor } from "./cms-markdown-editor";
import { registerCategoryFields, syncPostFolderCategory } from "./cms-post-category.mjs";

function supportEmbeddedPreviewFrames() {
	// Some embedded browsers leave Blob iframe navigations at about:blank.
	// Reuse the same CMS document via srcdoc only in that case. Keep its sandbox.
	new MutationObserver((records) => {
		for (const { target: frame } of records) {
			if (!(frame instanceof HTMLIFrameElement) || !frame.matches("iframe.preview")) continue;
			const source = frame.getAttribute("src") || "";
			if (!source.startsWith(`blob:${window.location.origin}/`)) continue;
			const stillBlank = () => frame.isConnected
				&& frame.getAttribute("src") === source
				&& !frame.hasAttribute("srcdoc")
				&& frame.contentDocument?.URL === "about:blank";
			window.setTimeout(async () => {
				if (!stillBlank()) return;
				try {
					const html = await (await fetch(source)).text();
					if (stillBlank()) frame.srcdoc = html;
				} catch {
					// A normally loaded CMS iframe revokes its Blob URL itself.
				}
			}, 1500);
		}
	}).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["src"] });
}

// Only the CMS iframe receives these styles; the editor UI stays independent.
export function registerBlogPreviews(options) {
	const { CMS, createClass, h } = window;
	registerMarkdownEditor();
	registerCategoryFields();
	CMS.registerEventListener({ name: "preSave", handler: syncPostFolderCategory });
	supportEmbeddedPreviewFrames();
	CMS.registerPreviewStyle(
		[themeVariables, previewStyles, markdownExtensions].join("\n"),
		{ raw: true },
	);

	const createPreview = (isPost) => createClass({
		getInitialState() {
			return { dark: window.matchMedia("(prefers-color-scheme: dark)").matches, html: "", css: "", rendering: true, error: "" };
		},
		componentDidMount() {
			this.previewMounted = true;
			this.applyTheme();
			this.props.document.addEventListener("click", handlePreviewClick);
			this.updateBody();
		},
		componentDidUpdate() {
			this.applyTheme();
			this.updateBody();
		},
		componentWillUnmount() {
			this.previewMounted = false;
			clearTimeout(this.renderTimer);
			this.props.document.removeEventListener("click", handlePreviewClick);
		},
		updateBody() {
			const markdown = this.props.entry.getIn(["data", "body"]) || "";
			if (markdown === this.lastMarkdown) return;
			this.lastMarkdown = markdown;
			const revision = this.renderRevision = (this.renderRevision || 0) + 1;
			const props = this.props;
			clearTimeout(this.renderTimer);
			this.setState({ rendering: true, error: "" });
			this.renderTimer = setTimeout(async () => {
				try {
					const result = await preparePreview(markdown, props);
					if (!this.previewMounted || revision !== this.renderRevision) return;
					this.setState({ ...result, rendering: false }, () => hydratePreviewCards(props.document));
				} catch {
					if (this.previewMounted && revision === this.renderRevision) {
						this.setState({ rendering: false, error: "미리보기를 만들지 못했어요. 문법을 확인하거나 CMS를 새로고침해 주세요." });
					}
				}
			}, 250);
		},
		applyTheme() {
			const root = this.props.document.documentElement;
			root.classList.toggle("dark", this.state.dark);
			root.style.setProperty("--hue", String(siteConfig.themeColor.hue));
			root.lang = this.props.entry.getIn(["data", "lang"]) || "ko";
		},
		render() {
			const { entry, widgetFor } = this.props;
			const value = (name) => entry.getIn(["data", name]);
			const image = value("image");
			const tags = value("tags");
			const tagNames = tags?.toArray ? tags.toArray() : Array.isArray(tags) ? tags : [];
			const category = [value("parentCategory"), value("category")].filter(Boolean).join(" / ");
			const date = String(value("published") || "").slice(0, 10);
			const themeButton = (dark, text) => h("button", {
				type: "button",
				"aria-pressed": this.state.dark === dark,
				onClick: () => this.setState({ dark }),
			}, text);

			return h("div", { className: "cms-blog-preview" },
				h("style", {}, this.state.css),
				h("nav", { className: "preview-toolbar", "aria-label": "미리보기 테마" },
					h("span", { role: "status" }, this.state.rendering ? "미리보기 준비 중…" : "본문 미리보기"),
					h("div", {}, themeButton(false, "라이트"), themeButton(true, "다크")),
				),
				h("article", { className: "preview-article" },
					isPost && h("header", { className: "preview-header" },
						h("h1", { className: "preview-title" }, value("title") || "제목을 입력하세요"),
						h("div", { className: "preview-meta" },
							date && h("time", { dateTime: date }, date),
							category && h("span", {}, category),
							tagNames.length > 0 && h("span", {}, tagNames.map((tag) => `#${tag}`).join(" / ")),
						),
					),
					image && h("div", { className: "preview-cover" }, widgetFor("image")),
					this.state.error && h("p", { role: "alert", className: "preview-error" }, this.state.error),
					h("div", { className: "prose dark:prose-invert prose-base !max-w-none custom-md", dangerouslySetInnerHTML: { __html: this.state.html } }),
				),
			);
		},
	});

	CMS.registerPreviewTemplate("posts", createPreview(true));
	CMS.registerPreviewTemplate("about", createPreview(false));
	CMS.registerPreviewTemplate("markdown-guide", createPreview(false));
	CMS.registerPreviewTemplate("fuwari-guide", createPreview(false));
	CMS.init(options);
}
