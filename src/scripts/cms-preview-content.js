let renderer;
const repositoryRequests = new Map();

const imageTypes = {
	jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif",
	webp: "image/webp", avif: "image/avif", svg: "image/svg+xml",
};

export async function preparePreview(markdown, { document, getAsset }) {
	renderer ||= import("../markdown/render.mjs");
	const rendered = await (await renderer).renderMarkdown(markdown);
	const template = document.createElement("template");
	template.innerHTML = window.DOMPurify.sanitize(rendered.html, {
		ADD_TAGS: ["spoiler", "iframe"],
		ADD_ATTR: ["target", "allow", "allowfullscreen", "frameborder", "scrolling", "repo"],
		FORBID_TAGS: ["script", "style"],
		FORBID_ATTR: ["srcdoc"],
	});

	await Promise.all([...template.content.querySelectorAll("img[src]")].map(async (image) => {
		const source = image.getAttribute("src");
		if (/^(https?:|data:|blob:|\/\/)/i.test(source)) return;
		try {
			const asset = getAsset(source);
			if (!asset) return;
			if (/^(blob:|data:)/.test(asset.url)) {
				image.src = asset.url;
			} else {
				const base64 = await asset.toBase64();
				const type = asset.fileObj?.type || imageTypes[source.split(".").pop()?.toLowerCase()] || "image/png";
				image.src = base64.startsWith("data:") ? base64 : `data:${type};base64,${base64}`;
			}
		} catch {
			// Keep the original public URL if this asset is not available from the CMS.
		}
	}));

	for (const frame of template.content.querySelectorAll("iframe")) {
		let allowed = false;
		try {
			const url = new URL(frame.getAttribute("src") || "", "https://d0hy30n.github.io/");
			allowed = url.protocol === "https:" && (
				(["www.youtube.com", "www.youtube-nocookie.com"].includes(url.hostname) && url.pathname.startsWith("/embed/"))
				|| (url.hostname === "player.vimeo.com" && url.pathname.startsWith("/video/"))
				|| (url.hostname === "player.bilibili.com" && url.pathname === "/player.html")
			);
			if (allowed) frame.src = url.href;
		} catch { /* Remove invalid embeds. */ }
		if (!allowed) {
			frame.remove();
			continue;
		}
		frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-presentation");
		frame.setAttribute("loading", "lazy");
		frame.setAttribute("referrerpolicy", "no-referrer");
	}
	for (const link of template.content.querySelectorAll('a[target="_blank"]')) {
		link.rel = "noopener noreferrer";
	}
	return { html: template.innerHTML, css: rendered.css };
}

export function hydratePreviewCards(document) {
	for (const card of document.querySelectorAll(".card-github[repo]")) {
		const repo = card.getAttribute("repo");
		if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) continue;
		if (!repositoryRequests.has(repo)) {
			repositoryRequests.set(repo, fetch(`https://api.github.com/repos/${repo}`, { referrerPolicy: "no-referrer" })
				.then((response) => {
					if (!response.ok) throw new Error("GitHub card unavailable");
					return response.json();
				}));
		}
		repositoryRequests.get(repo).then((data) => {
			if (!card.isConnected) return;
			const text = (selector, value) => { const node = card.querySelector(selector); if (node) node.textContent = value; };
			const count = (value) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0);
			text(".gc-description", data.description?.replace(/:[a-zA-Z0-9_]+:/g, "") || "Description not set");
			text(".gc-language", data.language || "");
			text(".gc-stars", count(data.stargazers_count));
			text(".gc-forks", count(data.forks));
			text(".gc-license", data.license?.spdx_id || "no-license");
			const avatar = card.querySelector(".gc-avatar");
			if (avatar && /^https:\/\/avatars\.githubusercontent\.com\//.test(data.owner?.avatar_url || "")) {
				avatar.style.backgroundImage = `url(${JSON.stringify(data.owner.avatar_url)})`;
				avatar.style.backgroundColor = "transparent";
			}
			card.classList.remove("fetch-waiting");
		}).catch(() => card.classList.add("fetch-error"));
	}
}

export async function handlePreviewClick(event) {
	const button = event.target.closest?.(".copy-btn");
	if (button) {
		const code = [...button.closest("pre").querySelectorAll(".code:not(summary *)")]
			.map((line) => line.textContent === "\n" ? "" : line.textContent).join("\n");
		try {
			await navigator.clipboard.writeText(code);
			button.classList.add("success");
			setTimeout(() => button.classList.remove("success"), 1000);
		} catch { /* Clipboard access can be unavailable in embedded browsers. */ }
	}
	const anchor = event.target.closest?.('a[href^="#"]');
	if (anchor) {
		event.preventDefault();
		const id = decodeURIComponent(anchor.getAttribute("href").slice(1));
		anchor.ownerDocument.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
	}
}
