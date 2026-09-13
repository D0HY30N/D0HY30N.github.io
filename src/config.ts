import type {
	CategoryConfig,
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SidebarImageConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "D0HY30N's Blog",
	subtitle: "",
	lang: "en", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 260, // Muted blue-gray accent
		fixed: true, // Hide the theme color picker for visitors
	},
	banner: {
		enable: false,
		src: "assets/images/demo-banner.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		{
			name: "Posts",
			url: "/",
		},
		LinkPreset.About,
		{
			name: "Github",
			url: "https://github.com/D0HY30N", // Internal links should not include the base path, as it is automatically added
			external: true, // Show an external link icon and will open in a new tab
		},
	],
};

// 카테고리 위 64x64 이미지. 투명 배경으로 표시하며 darkSrc는 다크모드용입니다.
export const sidebarImageConfig: SidebarImageConfig = {
	enable: true,
	src: "/favicon/favicon-light-128.png?v=cat-1",
	darkSrc: "/favicon/favicon-dark-128.png?v=cat-1",
	alt: "D0HY30N의 고양이",
	position: "center",
};

// 글의 parentCategory(대분류), category(소분류)로 새 분류를 만들 수 있습니다.
// 아래 설정은 기존 글의 기본 소속, 표시 순서, 빈 카테고리를 유지합니다.
// Markdown의 parentCategory가 우선하며, 소분류 하나는 대분류 하나에 속합니다.
export const categoryConfig: CategoryConfig = {
	groups: [
		{ name: "보안", categories: ["WEB", "시스템", "네트워크"] },
		{ name: "개발", categories: ["Astro"] },
		{ name: "블로그", categories: ["Examples", "Guides"] },
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/demo-avatar.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "D0HY30N",
	bio: "",
	links: [
		{
			name: "Twitter",
			icon: "fa6-brands:twitter", // Visit https://icones.js.org/ for icon codes
			// You will need to install the corresponding icon set if it's not already included
			// `pnpm add @iconify-json/<icon-set-name>`
			url: "https://twitter.com",
		},
		{
			name: "Steam",
			icon: "fa6-brands:steam",
			url: "https://store.steampowered.com",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/saicaca/fuwari",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: false,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
