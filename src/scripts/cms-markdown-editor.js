import { markdownEdit, validMarkdownUrl } from "./cms-markdown-edit.mjs";
import "../styles/cms-editor.css";

// Use the supported custom-field API: the body remains a plain Markdown string.
export function registerMarkdownEditor() {
	const { CMS, createClass, h } = window;
	const control = createClass({
		getInitialState() { return { dialog: "", url: "", error: "" }; },
		componentDidUpdate(previous) {
			// Only external updates replace the DOM value. Keeping normal input native
			// preserves the browser's selection and undo stack, including toolbar edits.
			if (previous.value !== this.props.value && this.input.value !== (this.props.value || "")) {
				this.input.value = this.props.value || "";
			}
		},
		rememberSelection() {
			this.selection = [this.input.selectionStart, this.input.selectionEnd];
		},
		insert(action, url) {
			const input = this.input;
			const [start, end] = this.selection || [input.selectionStart, input.selectionEnd];
			const edit = markdownEdit(input.value, start, end, action, url);
			input.focus();
			input.setSelectionRange(edit.start, edit.end);
			// Native insertion preserves undo/redo in Chromium; other engines use the fallback.
			if (!document.execCommand("insertText", false, edit.text)) {
				input.setRangeText(edit.text, edit.start, edit.end, "end");
			}
			this.props.onChange(input.value);
			this.setState({ dialog: "", url: "", error: "" }, () => {
				input.focus();
				input.setSelectionRange(edit.selectionStart, edit.selectionEnd);
				this.rememberSelection();
			});
		},
		render() {
			const readonly = this.props.field.get("readonly") === true;
			const button = (action, label, text) => h("button", {
				type: "button", title: label, "aria-label": label,
				onMouseDown: (event) => { this.rememberSelection(); event.preventDefault(); },
				onClick: () => ["link", "image"].includes(action)
					? this.setState({ dialog: action, url: "", error: "" }) : this.insert(action),
			}, text);
			return h("div", { className: "cms-source-editor" },
				!readonly && h("div", { className: "cms-source-toolbar", role: "toolbar", "aria-label": "마크다운 편집 도구" },
					button("h2", "큰 제목", "H2"), button("h3", "작은 제목", "H3"),
					button("bold", "굵게", h("strong", {}, "B")), button("italic", "기울임꼴", h("em", {}, "I")),
					button("strike", "취소선", h("s", {}, "S")), button("code", "인라인 코드", "<>"),
					button("codeblock", "코드 블록", "```"), button("quote", "인용문", "❞"),
					button("list", "글머리 목록", "• ≡"), button("ordered", "번호 목록", "1. ≡"),
					button("link", "링크", "링크"), button("image", "이미지", "이미지"),
				),
				this.state.dialog && h("form", {
					className: "cms-source-insert", "aria-label": this.state.dialog === "image" ? "이미지 넣기" : "링크 넣기",
					onSubmit: (event) => {
						event.preventDefault();
						const url = this.state.url.trim();
						if (!validMarkdownUrl(url)) { this.setState({ error: "올바른 URL 또는 이미지 경로를 입력하세요." }); return; }
						this.insert(this.state.dialog, url);
					},
					onKeyDown: (event) => { if (event.key === "Escape") { event.preventDefault(); this.setState({ dialog: "" }, () => this.input.focus()); } },
				},
					h("label", {}, this.state.dialog === "image" ? "이미지 URL 또는 경로" : "링크 주소",
						h("input", { type: "text", autoFocus: true, value: this.state.url, placeholder: this.state.dialog === "image" ? "/images/uploads/example.png" : "https://", onChange: (event) => this.setState({ url: event.target.value }) })),
					this.state.dialog === "image" && h("p", {}, "업로드한 이미지는 CMS 에셋에서 URL을 복사해 붙여넣으세요."),
					this.state.error && h("p", { role: "alert" }, this.state.error),
					h("div", {}, h("button", { type: "submit" }, "넣기"), h("button", { type: "button", onClick: () => this.setState({ dialog: "" }, () => this.input.focus()) }, "취소")),
				),
				h("textarea", {
					id: this.props.forID, "aria-label": this.props.field.get("label") || "본문", className: "cms-source-input",
					defaultValue: this.props.value || "", readOnly: readonly, spellCheck: false,
					ref: (input) => { this.input = input; },
					onSelect: () => this.rememberSelection(),
					onChange: (event) => this.props.onChange(event.target.value),
					onKeyDown: (event) => {
						if (readonly || !(event.ctrlKey || event.metaKey) || !["b", "i", "k"].includes(event.key.toLowerCase())) return;
						event.preventDefault(); this.rememberSelection();
						if (event.key.toLowerCase() === "k") this.setState({ dialog: "link", url: "", error: "" });
						else this.insert(event.key.toLowerCase() === "b" ? "bold" : "italic");
					},
				}),
			);
		},
	});
	CMS.registerWidget("markdown-source", control);
}
