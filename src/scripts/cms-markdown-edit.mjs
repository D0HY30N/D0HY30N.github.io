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
		default: {
			const lineStart = value.lastIndexOf("\n", start - 1) + 1;
			const prefix = { h2: "## ", h3: "### ", quote: "> ", list: "- ", ordered: "1. " }[action];
			if (!prefix) throw new Error(`Unknown Markdown action: ${action}`);
			const text = value.slice(lineStart, end).split("\n").map((line, index) =>
				(action === "ordered" ? `${index + 1}. ` : prefix) + line).join("\n");
			return { start: lineStart, end, text, selectionStart: lineStart, selectionEnd: lineStart + text.length };
		}
	}
}

export function validMarkdownUrl(value) {
	return !!value && !/[<>\n\r]/.test(value) && !/^(?:javascript|data|vbscript):/i.test(value)
		&& (!/^[a-z][\w+.-]*:/i.test(value) || /^https?:/i.test(value));
}
