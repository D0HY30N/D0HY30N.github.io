const POSTS_FOLDER = "src/content/posts/";

export function registerCategoryFields() {
	const { CMS, createClass, h } = window;
	const control = createClass({
		render() {
			const { field, forID, value } = this.props;
			return h("input", {
				id: forID,
				type: "text",
				className: "cms-category-display",
				"aria-label": field.get("label"),
				readOnly: true,
				// The dash is only a display value; an absent parent stays empty in Markdown.
				value: value || (field.get("name") === "parentCategory" ? "-" : ""),
			});
		},
	});
	CMS.registerWidget("folder-category", control);
}

export function categoriesFromPostPath(path) {
	if (typeof path !== "string") return undefined;
	const normalized = path.replaceAll("\\", "/").replace(/^\/+/, "");
	if (!normalized.startsWith(POSTS_FOLDER)) return undefined;
	const parts = normalized.slice(POSTS_FOLDER.length).split("/");
	if (parts.some((part) => !part || part === "." || part === "..")) return undefined;
	if (parts.length > 3) {
		throw new RangeError("카테고리 폴더는 최대 두 단계까지만 사용할 수 있습니다. 소카테고리 폴더 안에 글을 저장해 주세요.");
	}
	// One folder is a standalone category; two folders supply both category levels.
	return {
		parentCategory: parts.length > 2 ? parts[0] : "",
		category: parts.length > 2 ? parts[1] : parts.length > 1 ? parts[0] : "",
	};
}

export function syncPostFolderCategory({ entry }) {
	if (entry.get("collection") !== "posts") return entry;
	let folders;
	try {
		folders = categoriesFromPostPath(entry.get("path"));
	} catch (cause) {
		// A new folder only reaches GitHub when its first entry is saved.
		throw new Error("saving_failed", { cause });
	}
	if (!folders?.category) {
		// Sveltia displays custom save errors from the saving_failed cause.
		throw new Error("saving_failed", {
			cause: new Error("소카테고리 폴더를 선택하거나 만들어 주세요."),
		});
	}
	return entry
		.setIn(["data", "parentCategory"], folders.parentCategory)
		.setIn(["data", "category"], folders.category);
}
