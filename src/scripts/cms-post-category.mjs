const POSTS_FOLDER = "src/content/posts/";

export function categoriesFromPostPath(path) {
	if (typeof path !== "string") return undefined;
	const normalized = path.replaceAll("\\", "/").replace(/^\/+/, "");
	if (!normalized.startsWith(POSTS_FOLDER)) return undefined;
	const parts = normalized.slice(POSTS_FOLDER.length).split("/");
	if (parts.some((part) => !part || part === "." || part === "..")) return undefined;
	// Posts / parent category / category / post.md. Extra folders only organize files.
	return {
		parentCategory: parts.length > 1 ? parts[0] : "",
		category: parts.length > 2 ? parts[1] : undefined,
	};
}

export function syncPostFolderCategory({ entry }) {
	if (entry.get("collection") !== "posts") return entry;
	const folders = categoriesFromPostPath(entry.get("path"));
	if (!folders) throw new Error("게시글의 저장 폴더를 확인해 주세요.");
	const category = folders.category ?? String(entry.getIn(["data", "category"]) || "").trim();
	if (folders.parentCategory && !category) {
		throw new Error("소카테고리 폴더를 만들거나 소카테고리를 입력해 주세요.");
	}
	return entry
		.setIn(["data", "parentCategory"], folders.parentCategory)
		.setIn(["data", "category"], category);
}
