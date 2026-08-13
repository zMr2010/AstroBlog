import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "XianRui's Blog",
	subtitle: "Dispel the gloom and restore clear skies once more!",
	lang: "en", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 0, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: false,
		src: "https://cdn.luogu.com.cn/upload/image_hosting/9ygygpo1.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
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
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.Faqs,
		LinkPreset.About,
		{
			name: "Chat",
			url: "/chat/",
			noSwup: true,
		},
		{
			name: "P.Z.",
			url: "/private-zone/",
		},
		// {
		// 	name: "GitHub",
		// 	url: "https://github.com/saicaca/fuwari", // Internal links should not include the base path, as it is automatically added
		// 	external: true, // Show an external link icon and will open in a new tab
		// },
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/images/Avatar_Evanescia.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "XianRuiDendro",
	bio: "Dispel the gloom and restore clear skies once more!",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/zMr2010",
		},
		{
			name: "QQ",
			icon: "fa6-brands:qq",
			url: "https://qm.qq.com/q/Z1mLn5nBKi",
		},
		{
			name: "Email",
			icon: "fa6-solid:envelope-open",
			url: "mailto:2356327510@qq.com",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
