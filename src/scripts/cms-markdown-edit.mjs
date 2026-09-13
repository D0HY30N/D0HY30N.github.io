export function markdownEdit(value, start, end, action, url = "") {
	const selected = value.slice(start, end);
	const wrap = (before, after, placeholder) => ({
		start, end, text: before + (selected || placeholder) + after,
		selectionStart: start + before.length,
		selectionEnd: start + before.length + (selected || placeholder).length,
	});
	switch (action) {
		case "bold": return wrap("**", "**", "굵은 글자");
		case "italic": return wrap("*", "*", "기울임 글자");
		case "strike": return wrap("~~", "~~", "취소선");
		case "code": return wrap("`", "`", "코드");
		case "link": return wrap("[", `](<${url}>)`, "링크 이름");
		case "image": return wrap("![", `](<${url}>)`, "이미지 설명");
		case "codeblock": return wrap("\n```text\n", "\n```\n", "코드");
		case "rule": return blockEdit(value, end, "---");
		default: {
			const lineStart = value.slice(0, start).lastIndexOf("\n") + 1;
			const prefix = { h1: "# ", h2: "## ", h3: "### ", quote: "> ", list: "- ", ordered: "1. ", task: "- [ ] " }[action];
			if (!prefix) throw new Error(`Unknown Markdown action: ${action}`);
			const text = value.slice(lineStart, end).split("\n").map((line, index) =>
				(action === "ordered" ? `${index + 1}. ` : prefix)
				+ (/^h[1-3]$/.test(action) ? line.replace(/^#{1,6} +/, "") : line)).join("\n");
			return { start: lineStart, end, text, selectionStart: lineStart, selectionEnd: lineStart + text.length };
		}
	}
}

// Block tools insert after the selection and keep surrounding text intact.
function blockEdit(value, position, block, placeholder = "") {
	const before = value.slice(0, position);
	const after = value.slice(position);
	const prefix = !before || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
	const suffix = after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
	const text = prefix + block + suffix;
	const selectionStart = placeholder ? position + prefix.length + block.indexOf(placeholder) : position + text.length;
	return { start: position, end: position, text, selectionStart, selectionEnd: selectionStart + placeholder.length };
}

export function markdownTableEdit(value, position, columns, rows) {
	if (!Number.isInteger(columns) || columns < 1 || columns > 12 || !Number.isInteger(rows) || rows < 1 || rows > 30) {
		throw new RangeError("열은 1~12개, 내용 행은 1~30개로 입력하세요.");
	}
	const row = (cells) => `| ${cells.join(" | ")} |`;
	const block = [
		row(Array.from({ length: columns }, (_, index) => `제목 ${index + 1}`)),
		row(Array(columns).fill("---")),
		...Array.from({ length: rows }, () => row(Array(columns).fill("내용"))),
	].join("\n");
	return blockEdit(value, position, block, "제목 1");
}

export function validMarkdownUrl(value) {
	return !!value && !/[<>\n\r]/.test(value) && !/^(?:javascript|data|vbscript):/i.test(value)
		&& (!/^[a-z][\w+.-]*:/i.test(value) || /^https?:/i.test(value));
}
