import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { expressiveCodeConfig } from "../config.ts";
import { pluginLanguageBadge } from "../plugins/expressive-code/language-badge.ts";
import { pluginCustomCopyButton } from "../plugins/expressive-code/custom-copy-button.ts";

// Shared by Astro and the CMS preview renderer.
export const codeOptions = {
	// Keep code styles with cached Markdown so a server restart cannot leave stale CSS asset URLs.
	emitExternalStylesheet: false,
	themes: [expressiveCodeConfig.theme, expressiveCodeConfig.theme],
	plugins: [
		pluginCollapsibleSections(),
		pluginLineNumbers(),
		pluginLanguageBadge(),
		pluginCustomCopyButton()
	],
	defaultProps: {
		wrap: true,
		overridesByLang: {
			'shellsession': {
				showLineNumbers: false,
			},
		},
	},
	styleOverrides: {
		codeBackground: "var(--codeblock-bg)",
		borderRadius: "0.75rem",
		borderColor: "none",
		codeFontSize: "0.875rem",
		codeFontFamily: "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
		codeLineHeight: "1.5rem",
		frames: {
			editorBackground: "var(--codeblock-bg)",
			terminalBackground: "var(--codeblock-bg)",
			terminalTitlebarBackground: "var(--codeblock-topbar-bg)",
			editorTabBarBackground: "var(--codeblock-topbar-bg)",
			editorActiveTabBackground: "none",
			editorActiveTabIndicatorBottomColor: "var(--primary)",
			editorActiveTabIndicatorTopColor: "none",
			editorTabBarBorderBottomColor: "var(--codeblock-topbar-bg)",
			terminalTitlebarBorderBottomColor: "none"
		},
		textMarkers: {
			delHue: 0,
			insHue: 180,
			markHue: 250
		}
	},
	frames: {
		showCopyToClipboardButton: false,
	}
};
