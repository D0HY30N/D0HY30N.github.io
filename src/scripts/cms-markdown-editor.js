import { markdownEdit, markdownTableEdit, validMarkdownUrl } from "./cms-markdown-edit.mjs";
import "../styles/cms-editor.css";

// Use the supported custom-field API: the body remains a plain Markdown string.
export function registerMarkdownEditor() {
	const { CMS, createClass, h } = window;
	const control = createClass({
		getInitialState() { return { dialog: "", url: "", error: "", busy: false, columns: 3, rows: 3 }; },
		componentWillUnmount() { this.disposed = true; },
		componentDidUpdate(previous) {
			// Only external updates replace the DOM value. Keeping normal input native
			// preserves the browser's selection and undo stack, including toolbar edits.
			if (this.input && previous.value !== this.props.value && this.input.value !== (this.props.value || "")) {
				this.input.value = this.props.value || "";
			}
		},
		rememberSelection() {
			this.selection = [this.input.selectionStart, this.input.selectionEnd];
		},
		restoreSelection() {
			this.input.focus();
			if (this.selection) this.input.setSelectionRange(...this.selection);
		},
		async chooseImage() {
			if (this.choosingImage) return;
			this.choosingImage = true;
			const original = this.input.value;
			this.setState({ busy: true, dialog: "", error: "" });
			try {
				// Sveltia stages local files and replaces the intact URL on entry save.
				// Its picker also handles existing assets, URLs, size limits and cancellation.
				const picked = await this.props.pickFile({ kind: "image", multiple: false });
				if (this.disposed) return;
				this.setState({ busy: false }, () => {
					if (this.disposed) return;
					if (picked && this.input.value === original) this.insert("image", picked.value);
					else {
						if (picked) this.setState({ error: "본문이 변경되어 이미지를 넣지 않았습니다. 넣을 위치에서 다시 선택해 주세요." });
						this.restoreSelection();
					}
				});
			} catch {
				if (!this.disposed) this.setState({ busy: false, error: "이미지를 불러오지 못했습니다. 잠시 후 다시 선택해 주세요." }, () => this.restoreSelection());
			} finally {
				this.choosingImage = false;
			}
		},
		insert(action, url) {
			const input = this.input;
			const [start, end] = this.selection || [input.selectionStart, input.selectionEnd];
			const edit = action === "table"
				? markdownTableEdit(input.value, end, Number(this.state.columns), Number(this.state.rows))
				: markdownEdit(input.value, start, end, action, url);
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
				type: "button", title: label, "aria-label": label, disabled: this.state.busy,
				onMouseDown: (event) => { this.rememberSelection(); event.preventDefault(); },
				onClick: () => {
					if (action === "image") this.chooseImage();
					else if (["link", "table"].includes(action)) this.setState({ dialog: action, url: "", error: "" });
					else this.insert(action);
				},
			}, text);
			return h("div", { className: "cms-source-editor" },
				!readonly && h("div", { className: "cms-source-toolbar", role: "toolbar", "aria-label": "마크다운 편집 도구" },
					button("h1", "제목 1단계", "H1"), button("h2", "제목 2단계", "H2"), button("h3", "제목 3단계", "H3"),
					button("bold", "굵게", h("strong", {}, "B")), button("italic", "기울임꼴", h("em", {}, "I")),
					button("strike", "취소선", h("s", {}, "S")), button("code", "인라인 코드", "<>"),
					button("codeblock", "코드 블록", "```"), button("quote", "인용문", "❞"),
					button("list", "글머리 목록", "• ≡"), button("ordered", "번호 목록", "1. ≡"),
					button("task", "체크리스트", "☑"), button("rule", "구분선", "―"), button("table", "표", "표"),
					button("link", "링크", "링크"), button("image", "이미지", "이미지"),
				),
				this.state.busy && h("p", { className: "cms-source-message", role: "status" }, "이미지를 선택하고 있습니다. 선택한 이미지는 글을 저장할 때 함께 저장됩니다."),
				this.state.error && h("p", { className: "cms-source-message", role: "alert" }, this.state.error),
				this.state.dialog && h("form", {
					className: "cms-source-insert", "aria-label": this.state.dialog === "table" ? "표 넣기" : "링크 넣기",
					onSubmit: (event) => {
						event.preventDefault();
						if (this.state.dialog === "table") {
							try { this.insert("table"); } catch (error) { this.setState({ error: error.message }); }
							return;
						}
						const url = this.state.url.trim();
						if (!validMarkdownUrl(url)) { this.setState({ error: "올바른 URL 또는 경로를 입력하세요." }); return; }
						this.insert(this.state.dialog, url);
					},
					onKeyDown: (event) => { if (event.key === "Escape") { event.preventDefault(); this.setState({ dialog: "", error: "" }, () => this.restoreSelection()); } },
				},
					this.state.dialog === "table" ? h("div", { className: "cms-source-table-size" },
						h("label", {}, "열 개수", h("input", { type: "number", min: 1, max: 12, required: true, autoFocus: true, value: this.state.columns, onChange: (event) => this.setState({ columns: event.target.value }) })),
						h("label", {}, "내용 행 개수", h("input", { type: "number", min: 1, max: 30, required: true, value: this.state.rows, onChange: (event) => this.setState({ rows: event.target.value }) })),
					) : h("label", {}, "링크 주소", h("input", { type: "text", autoFocus: true, value: this.state.url, placeholder: "https://", onChange: (event) => this.setState({ url: event.target.value }) })),
					this.state.dialog === "table" && h("p", {}, "제목 행은 별도로 추가됩니다. 넣은 뒤 마크다운에서 각 칸의 내용을 바꿔 주세요."),
					h("div", {}, h("button", { type: "submit" }, "넣기"), h("button", { type: "button", onClick: () => this.setState({ dialog: "", error: "" }, () => this.restoreSelection()) }, "취소")),
				),
				h("textarea", {
					id: this.props.forID, "aria-label": this.props.field.get("label") || "본문", className: "cms-source-input",
					defaultValue: this.props.value || "", readOnly: readonly || this.state.busy, spellCheck: false,
					ref: (input) => { this.input = input; },
					onSelect: () => this.rememberSelection(),
					onChange: (event) => this.props.onChange(event.target.value),
					onKeyDown: (event) => {
						if (readonly || this.state.busy || !(event.ctrlKey || event.metaKey) || !["b", "i", "k"].includes(event.key.toLowerCase())) return;
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
