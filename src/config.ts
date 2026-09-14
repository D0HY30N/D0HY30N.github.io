import type {
	CategoryConfig,
	ExpressiveCodeConfig,
	NavBarConfig,
	ProfileConfig,
	SidebarImageConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "D0HY30N's Blog",
	subtitle: "",
	description: "보안과 개발을 공부하며 배운 내용을 기록하는 D0HY30N의 기술 블로그입니다.",
	contentLang: "ko-KR",
	lang: "en", // UI language: English or Korean.
	themeColor: {
		hue: 260, // Muted blue-gray accent
		fixed: true, // Hide the theme color picker for visitors
	},
	banner: {
		enable: false,
		src: "",
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

// 카테고리 위 128x128 이미지. 투명 배경으로 표시하며 darkSrc는 다크모드용입니다.
export const sidebarImageConfig: SidebarImageConfig = {
	enable: true,
	src: "/favicon/cat-favicon-light-source.png",
	darkSrc: "/favicon/cat-favicon-dark-source.png",
	alt: "D0HY30N의 고양이",
	position: "center",
};

// 글의 parentCategory(대분류), category(소분류)로 카테고리를 자동 생성합니다.
// 표시 순서나 빈 카테고리를 고정하고 싶을 때만 groups를 설정하세요.
export const categoryConfig: CategoryConfig = {
	groups: [],
};

export const profileConfig: ProfileConfig = {
	name: "D0HY30N",
};

export const commentsConfig = {
	enabled: true,
	repo: "D0HY30N/D0HY30N.github.io",
	repoId: "R_kgDOUY84xg",
	category: "Announcements",
	categoryId: "DIC_kwDOUY84xs4DFkgY",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
