import type { Favicon } from "@/types/config.ts";

export const defaultFavicons: Favicon[] = (["light", "dark"] as const).flatMap(
	(theme) => [16, 32, 128, 180, 192].map((size) => ({
		src: `/favicon/favicon-${theme}-${size}.png?v=cat-1`,
		theme,
		sizes: `${size}x${size}`,
	})),
);
