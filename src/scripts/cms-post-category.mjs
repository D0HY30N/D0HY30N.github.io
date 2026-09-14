const POSTS_FOLDER = "src/content/posts/";

export function categoriesFromPostPath(path) {
	if (typeof path !== "string") return undefined;
	const normalized = path.replaceAll("\\", "/").replace(/^\/+/, "");
	if (!normalized.startsWith(POSTS_FOLDER)) return undefined;
	const parts = normalized.slice(POSTS_FOLDER.length).split("/");
	if (parts.some((part) => !part || part === "." || part === "..")) return undefined;
	// One folder is a standalone category; two folders supply both category levels.
	// Extra folders below those levels only organize files.
	return {
		parentCategory: parts.length > 2 ? parts[0] : "",
		category: parts.length > 2 ? parts[1] : parts.length > 1 ? parts[0] : "",
	};
}

export function syncPostFolderCategory({ entry }) {
	if (entry.get("collection") !== "posts") return entry;
	const folders = categoriesFromPostPath(entry.get("path"));
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
