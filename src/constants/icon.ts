import type { Favicon } from "@/types/config.ts";

const FAVICON_VERSION = "transparent-1";

export const defaultFavicons: Favicon[] = [
	{
		src: `/favicon/favicon-light-16.png?v=${FAVICON_VERSION}`,
		theme: "light",
		sizes: "16x16",
	},
	{
		src: `/favicon/favicon-light-32.png?v=${FAVICON_VERSION}`,
		theme: "light",
		sizes: "32x32",
	},
	{
		src: `/favicon/favicon-light-128.png?v=${FAVICON_VERSION}`,
		theme: "light",
		sizes: "128x128",
	},
	{
		src: `/favicon/favicon-light-180.png?v=${FAVICON_VERSION}`,
		theme: "light",
		sizes: "180x180",
	},
	{
		src: `/favicon/favicon-light-192.png?v=${FAVICON_VERSION}`,
		theme: "light",
		sizes: "192x192",
	},
	{
		src: `/favicon/favicon-dark-16.png?v=${FAVICON_VERSION}`,
		theme: "dark",
		sizes: "16x16",
	},
	{
		src: `/favicon/favicon-dark-32.png?v=${FAVICON_VERSION}`,
		theme: "dark",
		sizes: "32x32",
	},
	{
		src: `/favicon/favicon-dark-128.png?v=${FAVICON_VERSION}`,
		theme: "dark",
		sizes: "128x128",
	},
	{
		src: `/favicon/favicon-dark-180.png?v=${FAVICON_VERSION}`,
		theme: "dark",
		sizes: "180x180",
	},
	{
		src: `/favicon/favicon-dark-192.png?v=${FAVICON_VERSION}`,
		theme: "dark",
		sizes: "192x192",
	},
];
